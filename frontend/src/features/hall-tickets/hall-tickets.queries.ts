import { useQuery, useMutation } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const HALL_TICKET_KEYS = {
  all: ["hallTickets"] as const,
  list: ["hallTickets", "list"] as const,
  student: ["hallTickets", "student"] as const,
  verify: (ticketNumber: string) => ["hallTickets", "verify", ticketNumber] as const,
};

export function useHallTickets(initialData?: any) {
  return useQuery({
    queryKey: HALL_TICKET_KEYS.list,
    queryFn: api.getHallTickets,
    initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useStudentHallTickets(initialData?: any) {
  return useQuery({
    queryKey: HALL_TICKET_KEYS.student,
    queryFn: api.getStudentHallTickets,
    initialData,
    staleTime: 1000 * 60 * 2,
  });
}

export function useVerifyHallTicket(ticketNumber: string) {
  return useQuery({
    queryKey: HALL_TICKET_KEYS.verify(ticketNumber),
    queryFn: () => api.verifyHallTicket(ticketNumber),
    enabled: Boolean(ticketNumber),
  });
}

export function useVerifyHallTicketMutation() {
  return useMutation({
    mutationFn: (ticketNumber: string) => api.verifyHallTicket(ticketNumber),
  });
}
