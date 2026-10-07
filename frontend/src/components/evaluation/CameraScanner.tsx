'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Trash2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureFinished: (capturedCount: number) => void;
}

export default function CameraScanner({
  isOpen,
  onClose,
  onCaptureFinished,
}: CameraScannerProps) {
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraActive(true);
          }
        }
      } catch (err) {
        console.warn('Camera access not granted, running simulated scanner:', err);
        setIsCameraActive(false);
      }
    }

    if (isOpen) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapturePage = () => {
    // Canvas snapshot or mock high-res page
    const samplePageSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850"><rect width="100%" height="100%" fill="%23FFFFFF"/><text x="40" y="60" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230F172A">SWATHI COLLEGE — PAGE ${capturedPages.length + 1}</text><line x1="30" y1="90" x2="570" y2="90" stroke="%23E2E8F0" stroke-width="2"/><text x="40" y="140" font-family="monospace" font-size="12" fill="%23475569">Captured via Digital Camera Scanner (${new Date().toLocaleTimeString()})</text></svg>`;

    setCapturedPages((prev) => [...prev, samplePageSvg]);
    toast.success(`Page ${capturedPages.length + 1} captured.`);
  };

  const handleSaveAndCatalog = () => {
    if (capturedPages.length === 0) {
      toast.error('Please snap at least one page of the student answer script.');
      return;
    }
    onCaptureFinished(capturedPages.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Live Document & Answer Script Scanner
              </h2>
              <p className="text-xs text-slate-500">
                Align paper within guide borders • {capturedPages.length} pages scanned
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

        {/* Viewport Workspace */}
        <div className="flex-1 flex overflow-hidden bg-slate-950 relative">
          {/* Main Camera View */}
          <div className="flex-1 flex items-center justify-center relative p-6">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              />
            ) : (
              <div className="w-[360px] h-[500px] border-2 border-dashed border-teal-500/80 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Camera className="w-12 h-12 text-teal-400 animate-pulse" />
                <p className="text-xs font-semibold text-slate-200">
                  Document Scanner Viewport
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Position student answer sheet flat on desk under uniform lighting.
                </p>
              </div>
            )}

            {/* Document Frame Guidelines */}
            <div className="absolute inset-12 pointer-events-none border-2 border-teal-400/40 rounded-2xl flex flex-col justify-between p-4">
              <div className="flex justify-between text-[10px] font-mono text-teal-400 uppercase">
                <span>[ CORNER A ]</span>
                <span>[ CORNER B ]</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-teal-400 uppercase">
                <span>[ CORNER C ]</span>
                <span>[ CORNER D ]</span>
              </div>
            </div>
          </div>

          {/* Captured Pages Strip */}
          <div className="w-56 bg-slate-900 border-l border-slate-800 p-3 overflow-y-auto space-y-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Scanned Pages ({capturedPages.length})
            </div>

            {capturedPages.map((pg, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800 p-1">
                <img src={pg} alt={`Page ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">
                  Page {i + 1}
                </div>
                <button
                  onClick={() => setCapturedPages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-2 right-2 p-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCapturePage}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Snap Page ({capturedPages.length + 1})
            </button>

            <button
              type="button"
              onClick={handleSaveAndCatalog}
              disabled={capturedPages.length === 0}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Catalog Answer Script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
