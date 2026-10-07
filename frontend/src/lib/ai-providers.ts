export type AiProviderKey = "openai" | "gemini" | "anthropic" | "groq" | "custom";

export interface AiProviderMeta {
  key: AiProviderKey;
  label: string;
  baseURL: string | null;
  defaultModel: string | null;
  keyPlaceholder: string;
  keyHint: string;
}

export const AI_PROVIDERS: Record<AiProviderKey, AiProviderMeta> = {
  openai: {
    key: "openai",
    label: "OpenAI (GPT-4o / GPT-4o-mini)",
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    keyPlaceholder: "sk-proj-...",
    keyHint: "From platform.openai.com/api-keys",
  },
  gemini: {
    key: "gemini",
    label: "Google Gemini (2.0 Flash / 1.5 Pro)",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    defaultModel: "gemini-2.0-flash",
    keyPlaceholder: "AIzaSy...",
    keyHint: "From aistudio.google.com/apikey",
  },
  anthropic: {
    key: "anthropic",
    label: "Anthropic Claude (Claude 3.5 Sonnet)",
    baseURL: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    keyPlaceholder: "sk-ant-...",
    keyHint: "From console.anthropic.com/keys",
  },
  groq: {
    key: "groq",
    label: "Groq (Llama 3.3 70B)",
    baseURL: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    keyPlaceholder: "gsk_...",
    keyHint: "From console.groq.com/keys",
  },
  custom: {
    key: "custom",
    label: "Custom OpenAI-Compatible Provider",
    baseURL: null,
    defaultModel: null,
    keyPlaceholder: "API Key",
    keyHint: "Self-hosted vLLM or Ollama instance",
  },
};

export const AI_PROVIDER_LIST = Object.values(AI_PROVIDERS);
