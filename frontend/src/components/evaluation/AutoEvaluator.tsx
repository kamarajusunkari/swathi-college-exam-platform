'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AnswerSheet, Question } from '@/lib/evaluation-data';
import { simulateOCRProcessing, OCRResult } from '@/lib/ocr-utils';

interface AutoEvaluatorProps {
  sheets: AnswerSheet[];
  questions: Question[];
  onCompleteBatch?: () => void;
}

export default function AutoEvaluator({ sheets, questions, onCompleteBatch }: AutoEvaluatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStatusMsg, setCurrentStatusMsg] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [currentSheetName, setCurrentSheetName] = useState('');

  const totalSheets = sheets.length;

  const handleStartBatch = () => {
    setIsProcessing(true);
    setProcessedCount(0);
    setCurrentProgress(5);
    setCurrentStatusMsg('Initializing OCR & AI evaluation pipeline...');

    let index = 0;

    const processNext = () => {
      if (index >= sheets.length) {
        setIsProcessing(false);
        setCurrentStatusMsg('Batch evaluation completed successfully!');
        if (onCompleteBatch) onCompleteBatch();
        return;
      }

      const sheet = sheets[index];
      setCurrentSheetName(`${sheet.studentName} (${sheet.rollNo})`);

      simulateOCRProcessing(
        { name: `${sheet.rollNo}_scan.pdf`, size: 1024 * 1024 * 2 },
        (pct, msg) => {
          const overallPct = Math.round(((index + pct / 100) / totalSheets) * 100);
          setCurrentProgress(overallPct);
          setCurrentStatusMsg(msg);
        },
        () => {
          setProcessedCount((prev) => prev + 1);
          index++;
          setTimeout(processNext, 400);
        }
      );
    };

    processNext();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="badge-purple font-mono">
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>AI &amp; OCR Batch Evaluation Engine</span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 font-heading mt-1.5">
            Automated Rubric &amp; Handwriting Recognition
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Process batch scans to extract chemical equations, mechanism keywords, and calculate tentative rubric marks.
          </p>
        </div>

        <button
          onClick={handleStartBatch}
          disabled={isProcessing}
          className="btn-primary"
        >
          {isProcessing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Evaluating ({processedCount}/{totalSheets})...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Automated Batch Evaluation
            </>
          )}
        </button>
      </div>

      {/* Progress Monitor */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/70 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700 font-heading">Current Target:</span>
              <span className="text-[#ff5722] font-normal">{currentSheetName}</span>
            </div>
            <span className="font-mono font-medium text-slate-800">{currentProgress}%</span>
          </div>

          <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ff5722] rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-600 font-normal animate-pulse">
            • {currentStatusMsg}
          </p>
        </div>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-slate-100 text-slate-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{totalSheets}</p>
            <p className="kpi-label">Cataloged Scripts</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-50 text-purple-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number text-purple-700">
              {sheets.filter((s) => s.aiEvaluation?.status === 'COMPLETE').length}
            </p>
            <p className="kpi-label">AI Evaluated Scripts</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number text-emerald-700">94.8%</p>
            <p className="kpi-label">Average AI Confidence</p>
          </div>
        </div>
      </div>
    </div>
  );
}
