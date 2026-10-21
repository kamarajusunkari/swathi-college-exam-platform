"use client";

import React from "react";
import { CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { usePayFeeMutation } from "@/features/fees/fees.queries";
import { payFeeSchema } from "@/features/fees/fees.schema";

interface Props {
  paymentId: string;
  isPaid: boolean;
  amount: number;
}

export function FeePaymentAction({ paymentId, isPaid, amount }: Props) {
  const router = useRouter();
  const payFeeMutation = usePayFeeMutation();
  const loading = payFeeMutation.isPending;

  const handlePay = async () => {
    const payload = {
      paymentId,
      paymentMethod: "UPI_INSTANT",
      amount,
    };

    const parseResult = payFeeSchema.safeParse(payload);
    if (!parseResult.success) {
      toast.error(parseResult.error.errors[0]?.message || "Payment payload error");
      return;
    }

    try {
      const data = await payFeeMutation.mutateAsync(parseResult.data);
      toast.success(data?.message || `Payment of ₹${amount} successful! Hall ticket released.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Something went wrong with payment");
    }
  };

  if (isPaid) {
    return (
      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        Receipt Issued
      </div>
    );
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          Pay {formatCurrency(amount)} Now
        </>
      )}
    </button>
  );
}
