"use client";

import React from "react";
import ManualEvaluator from "@/components/evaluation/ManualEvaluator";
import { SessionUser } from "@/lib/types";

interface Props {
  sheet: {
    id: string;
    student?: {
      user?: { name: string };
      rollNo?: string;
    } | null;
  };
  currentUser: SessionUser;
}

export function EvaluationWorkspace({ sheet }: Props) {
  return <ManualEvaluator sheetId={sheet.id} />;
}
