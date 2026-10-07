import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export const HALL_TICKET_KEYS = {
  all: ["hallTickets"] as const,
  list: ["hallTickets", "list"] as const,
  verify: (ticketNumber: string) => ["hallTickets", "verify", ticketNumber] as const,
};

export function useHallTickets() {
  return useQuery({
    queryKey: HALL_TICKET_KEYS.list,
    queryFn: api.getHallTickets,
  });
}

export function useVerifyHallTicket(ticketNumber: string) {
  return useQuery({
    queryKey: HALL_TICKET_KEYS.verify(ticketNumber),
    queryFn: () => api.verifyTicket(ticketNumber),
    enabled: Boolean(ticketNumber),
  });
}
