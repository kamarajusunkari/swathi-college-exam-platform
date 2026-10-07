import { useMutation } from "@tanstack/react-query";
import * as api from "@/lib/api/services.api";

export function useScanQuestionPaperMutation() {
  return useMutation({
    mutationFn: api.scanQuestionPaper,
  });
}

export function useEvaluateScriptMutation() {
  return useMutation({
    mutationFn: api.evaluateScript,
  });
}
