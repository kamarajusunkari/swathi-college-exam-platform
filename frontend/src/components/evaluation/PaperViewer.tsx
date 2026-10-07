'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Sparkles,
  Check,
  X,
  SlidersHorizontal,
  PenTool,
} from 'lucide-react';
import { Question, AnswerSheet, PaperAnnotation } from '@/lib/evaluation-data';
import { generateSyntheticSheetSvg } from '@/lib/ocr-utils';

interface PaperViewerProps {
  sheet?: AnswerSheet;
  questions: Question[];
  currentQuestionId: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  marksEntered?: Record<string, number>;
  onOpenPageManager?: () => void;
}

export default function PaperViewer({
  sheet,
  questions,
  currentQuestionId,
  currentPage,
  onPageChange,
  marksEntered = {},
  onOpenPageManager,
}: PaperViewerProps) {
  // Zoom & Pan states
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Enhancement filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isBWMode, setIsBWMode] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Red Pen Annotation Stamp Mode
  const [activePenTool, setActivePenTool] = useState<'NONE' | 'CHECK' | 'CROSS' | 'MARKS'>('NONE');
  const [annotations, setAnnotations] = useState<PaperAnnotation[]>(sheet?.annotations || []);

  const containerRef = useRef<HTMLDivElement>(null);
  const paperImageRef = useRef<HTMLDivElement>(null);

  const activeQuestion = questions.find((q) => q.id === currentQuestionId);
  const totalPages = sheet?.pages?.length || 4;

  // Auto-switch to page if bounding box is on another page
  useEffect(() => {
    if (activeQuestion?.answerAreaBoundingBox?.pageNo) {
      if (activeQuestion.answerAreaBoundingBox.pageNo !== currentPage) {
        onPageChange(activeQuestion.answerAreaBoundingBox.pageNo);
      }
    }
  }, [currentQuestionId, activeQuestion, currentPage, onPageChange]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 60));
  const handleReset = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setIsBWMode(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activePenTool !== 'NONE') return;
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handlePaperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activePenTool === 'NONE') return;

    const rect = paperImageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 1130;

    const newAnnotation: PaperAnnotation = {
      id: `ann-${Date.now()}`,
      pageNo: currentPage,
      type: activePenTool,
      x: Math.round(x),
      y: Math.round(y),
      text: activePenTool === 'MARKS' ? `${marksEntered[currentQuestionId] || 1}M` : undefined,
      color: '#DC2626',
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
  };

  const currentPageSvg = generateSyntheticSheetSvg(
    currentPage,
    sheet?.studentName || 'Student Candidate',
    sheet?.rollNo || 'SWC-ROLL-001',
    activeQuestion?.number || 3
  );

  const pageAnnotations = annotations.filter((a) => a.pageNo === currentPage);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/90 overflow-hidden relative select-none">
      {/* Top Toolbar */}
      <div className="h-12 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between z-10 shadow-xs">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-slate-700 px-2 py-1 bg-slate-100 rounded-md">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Red Pen Stamps & Annotations */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase px-2">Pen Tools:</span>

          <button
            onClick={() => setActivePenTool(activePenTool === 'CHECK' ? 'NONE' : 'CHECK')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activePenTool === 'CHECK'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Tick
          </button>

          <button
            onClick={() => setActivePenTool(activePenTool === 'CROSS' ? 'NONE' : 'CROSS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activePenTool === 'CROSS'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            Cross
          </button>

          <button
            onClick={() => setActivePenTool(activePenTool === 'MARKS' ? 'NONE' : 'MARKS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activePenTool === 'MARKS'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-red-500" />
            Marks Stamp
          </button>

          {activePenTool !== 'NONE' && (
            <button
              onClick={() => setActivePenTool('NONE')}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline px-1.5"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Right: Zoom & Image Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-medium text-slate-600 w-12 text-center">
            {zoom}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-700 ml-1"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`p-1.5 rounded-lg border transition ml-1 ${
              showFilterBar ? 'bg-teal-50 border-teal-300 text-teal-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            title="Image Contrast & Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 ml-1 px-2 py-1 rounded hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Filter Options Bar */}
      {showFilterBar && (
        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs z-10 border-b border-slate-700">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Brightness:</span>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-24 accent-teal-400"
              />
              <span className="font-mono text-[11px] text-slate-400">{brightness}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Contrast className="w-3.5 h-3.5 text-teal-400" />
              <span>Contrast:</span>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-24 accent-teal-400"
              />
              <span className="font-mono text-[11px] text-slate-400">{contrast}%</span>
            </div>

            <button
              onClick={() => setIsBWMode(!isBWMode)}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                isBWMode ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              High-Contrast B&W Mode
            </button>
          </div>

          <button
            onClick={() => {
              setBrightness(100);
              setContrast(100);
              setIsBWMode(false);
            }}
            className="text-[11px] text-slate-400 hover:text-white underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Main Canvas Workspace */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 overflow-auto flex items-center justify-center p-6 relative ${
          activePenTool !== 'NONE' ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          ref={paperImageRef}
          onClick={handlePaperClick}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            filter: `brightness(${brightness}%) contrast(${contrast}%) ${isBWMode ? 'grayscale(100%) contrast(250%)' : ''}`,
          }}
          className="relative bg-white shadow-2xl rounded-sm border border-slate-300 select-none"
        >
          {/* Answer sheet SVG Rendering */}
          <img
            src={currentPageSvg}
            alt={`Exam Paper Page ${currentPage}`}
            className="w-[780px] h-[1100px] object-contain pointer-events-none block"
            draggable={false}
          />

          {/* Render User Annotations */}
          {pageAnnotations.map((ann) => (
            <div
              key={ann.id}
              style={{
                position: 'absolute',
                left: `${(ann.x / 800) * 100}%`,
                top: `${(ann.y / 1130) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-none select-none"
            >
              {ann.type === 'CHECK' && (
                <span className="text-2xl font-bold text-red-600 drop-shadow-xs">✓</span>
              )}
              {ann.type === 'CROSS' && (
                <span className="text-2xl font-bold text-red-600 drop-shadow-xs">✗</span>
              )}
              {ann.type === 'MARKS' && (
                <div className="border-2 border-red-600 text-red-600 rounded-full px-2 py-0.5 text-xs font-bold font-mono bg-red-50/80">
                  {ann.text || '+1'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
