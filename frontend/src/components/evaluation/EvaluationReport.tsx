'use client';

import React from 'react';
import { AnswerSheet, Question } from '@/lib/evaluation-data';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertTriangle, FileDown } from 'lucide-react';

interface EvaluationReportProps {
  sheets: AnswerSheet[];
  questions: Question[];
  onClose?: () => void;
}

export default function EvaluationReport({ sheets, questions, onClose }: EvaluationReportProps) {
  const evaluatedSheets = sheets.filter((s) => s.status === 'EVALUATED' || s.totalMarks !== undefined);
  const totalEvaluated = evaluatedSheets.length;

  const totalPossible = questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0) || 100;
  const avgScore =
    totalEvaluated > 0
      ? (evaluatedSheets.reduce((acc, s) => acc + (s.totalMarks || 0), 0) / totalEvaluated).toFixed(1)
      : '0.0';

  const avgPct = totalEvaluated > 0 ? Math.round((Number(avgScore) / totalPossible) * 100) : 0;
  const passCount = evaluatedSheets.filter((s) => (s.percentage || 0) >= 50).length;
  const passPct = totalEvaluated > 0 ? Math.round((passCount / totalEvaluated) * 100) : 0;

  const highestScore = totalEvaluated > 0 ? Math.max(...evaluatedSheets.map((s) => s.totalMarks || 0)) : 0;

  // Real grade distribution from evaluated sheets
  const distinctionCount = evaluatedSheets.filter((s) => (s.percentage || 0) >= 75).length;
  const firstClassCount = evaluatedSheets.filter((s) => (s.percentage || 0) >= 60 && (s.percentage || 0) < 75).length;
  const secondClassCount = evaluatedSheets.filter((s) => (s.percentage || 0) >= 50 && (s.percentage || 0) < 60).length;
  const failCount = evaluatedSheets.filter((s) => (s.percentage || 0) < 50).length;

  const gradeBuckets = [
    { label: 'Distinction (≥75%)', count: distinctionCount, color: 'bg-emerald-500' },
    { label: 'First Class (60-74%)', count: firstClassCount, color: 'bg-[#ff5722]' },
    { label: 'Second Class (50-59%)', count: secondClassCount, color: 'bg-amber-500' },
    { label: 'Fail (<50%)', count: failCount, color: 'bg-rose-500' },
  ];

  const examTitle = sheets[0]?.examId || 'Academic Examination';
  const cohortLabel = sheets[0]?.className || 'Enrolled Student Cohort';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="badge-orange font-mono">
            <BarChart3 className="w-3.5 h-3.5 text-[#ff5722]" />
            <span>Performance &amp; Evaluation Analytics</span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 font-heading mt-1.5">
            {cohortLabel} — {examTitle} Performance Ledger
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Comprehensive evaluation metrics, rubric scoring breakdown, and grade distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-outline btn-sm cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-slate-100 text-slate-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number">{totalEvaluated}</p>
            <p className="kpi-label">Evaluated Scripts</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-orange-50 text-[#ff5722]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number text-[#ff5722]">
              {avgScore} <span className="text-xs text-slate-400 font-normal">/ {totalPossible}</span>
            </p>
            <p className="kpi-label">Class Average ({avgPct}%)</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number text-emerald-700">{passPct}%</p>
            <p className="kpi-label">Pass Rate ({passCount} Passed)</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-50 text-purple-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="kpi-number text-purple-700">{highestScore}</p>
            <p className="kpi-label">Highest Score ({highestScore}/{totalPossible})</p>
          </div>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-heading">
          Cohort Grade Distribution
        </h3>

        <div className="space-y-2">
          {gradeBuckets.map((bucket, i) => {
            const pct = totalEvaluated > 0 ? Math.round((bucket.count / totalEvaluated) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-36 sm:w-44 text-slate-600 font-normal truncate">{bucket.label}</span>
                <div className="flex-1 h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bucket.color} rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 font-mono font-medium text-slate-700 text-right">
                  {bucket.count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Difficulty Breakdown */}
      {questions.length > 0 && (
        <div className="data-container">
          <div className="data-header">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 font-heading">
              Question-Wise Scoring Analysis
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50/80 text-slate-400 font-normal border-b border-slate-100">
                <tr>
                  <th className="table-th">Q.No</th>
                  <th className="table-th">Question Blueprint</th>
                  <th className="table-th">Max Marks</th>
                  <th className="table-th">Average Score</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q) => {
                  const scores = evaluatedSheets
                    .map((s) => s.marksEntered?.[q.id])
                    .filter((m) => m !== undefined && m !== null) as number[];
                  const qAvg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
                  const qPct = scores.length > 0 && q.maxMarks > 0 ? Math.round((Number(qAvg) / q.maxMarks) * 100) : 0;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70">
                      <td className="table-td font-mono font-medium text-slate-800">Q.{q.number}</td>
                      <td className="table-td max-w-xs truncate text-slate-600 font-normal">{q.text}</td>
                      <td className="table-td font-mono">{q.maxMarks} M</td>
                      <td className="table-td font-mono font-medium text-[#ff5722]">
                        {qAvg} {scores.length > 0 ? 'M' : ''}
                      </td>
                      <td className="table-td">
                        {scores.length > 0 ? (
                          <span className="badge-emerald font-mono">
                            {qPct}% Average
                          </span>
                        ) : (
                          <span className="badge-slate font-mono text-[10px]">Pending Evaluation</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
