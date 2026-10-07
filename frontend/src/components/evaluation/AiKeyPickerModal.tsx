'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { AI_PROVIDER_LIST, AiProviderKey } from '@/lib/ai-providers';
import { toast } from 'sonner';

interface AiKeyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiKeyPickerModal({ isOpen, onClose }: AiKeyPickerModalProps) {
  const [provider, setProvider] = useState<AiProviderKey>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('swathi_gemini_key') || '');
      setOpenaiKey(localStorage.getItem('swathi_openai_key') || '');
      const savedProvider = localStorage.getItem('swathi_ai_provider') as AiProviderKey;
      if (savedProvider) setProvider(savedProvider);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('swathi_gemini_key', geminiKey.trim());
      localStorage.setItem('swathi_openai_key', openaiKey.trim());
      localStorage.setItem('swathi_ai_provider', provider);
    }
    toast.success('AI Evaluation Key configuration saved successfully!');
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const activeKey = provider === 'gemini' ? geminiKey : openaiKey;

    try {
      const res = await fetch('/api/ai/evaluate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: 'State Beer-Lambert law.',
          maxMarks: 2,
          modelAnswer: 'A = e * c * l, absorbance is directly proportional to concentration and path length.',
          studentAnswerText: 'Absorbance is proportional to concentration and length of sample path A=ecl.',
          provider: provider,
          apiKey: activeKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Connected to ${provider.toUpperCase()} AI successfully! Test score: ${data.evaluation.marks}/2M`);
      } else {
        toast.error('AI test failed: ' + (data.error || 'Check your API key.'));
      }
    } catch (err) {
      toast.error('Could not connect to AI endpoint.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                AI Copilot & Key Settings (BYOK)
              </h2>
              <p className="text-xs text-slate-500">
                Configure Google Gemini or OpenAI API keys for real-time exam grading
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Provider Select */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Preferred AI Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  provider === 'gemini'
                    ? 'bg-purple-50/80 border-purple-500 text-purple-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-semibold">Google Gemini</p>
                  <p className="text-[10px] text-slate-400 font-normal">Gemini 2.0 Flash</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  provider === 'openai'
                    ? 'bg-purple-50/80 border-purple-500 text-purple-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Key className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-semibold">OpenAI (ChatGPT)</p>
                  <p className="text-[10px] text-slate-400 font-normal">GPT-4o-mini</p>
                </div>
              </button>
            </div>
          </div>

          {/* Key Input */}
          {provider === 'gemini' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Google Gemini API Key</label>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-700 hover:underline flex items-center gap-1"
                >
                  Get Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:border-purple-500 outline-hidden"
              />
              <p className="text-[11px] text-slate-400">
                Stored locally in your browser session. Free tier supported at Google AI Studio.
              </p>
            </div>
          )}

          {provider === 'openai' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">OpenAI API Key</label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-700 hover:underline flex items-center gap-1"
                >
                  Get Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:border-purple-500 outline-hidden"
              />
              <p className="text-[11px] text-slate-400">
                Your key is used securely for student answer OCR evaluation.
              </p>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              If no API key is provided, the platform automatically switches to our built-in Pharmacy OCR heuristic evaluation engine.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test AI Key'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
