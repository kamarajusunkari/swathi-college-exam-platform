'use client';

import React, { useState } from 'react';
import {
  Upload,
  Files,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import CameraScanner from './CameraScanner';
import { toast } from 'sonner';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isBulk?: boolean;
}

export default function UploadZone({
  onFilesSelected,
  isBulk = true,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showLiveCamera, setShowLiveCamera] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.type.startsWith('image/') || f.name.endsWith('.zip')
    );
    if (files.length > 0) {
      onFilesSelected(files);
      toast.success(`${files.length} answer sheet file(s) selected.`);
    } else {
      toast.error('Please upload PDF, ZIP barcode bundle, or image files (JPG, PNG).');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      toast.success(`${files.length} file(s) ready for cataloging.`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camera Scan Trigger */}
        <div
          onClick={() => setShowLiveCamera(true)}
          className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-2xl p-6 shadow-md shadow-teal-700/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-200 tracking-wider">
              Live Capture & Edge Alignment
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Use Device Camera</h3>
            <p className="text-xs text-emerald-100/90 mt-1 leading-snug">
              Snap physical answer sheets page by page with auto-deskew and page indexing.
            </p>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition flex items-center justify-center cursor-pointer ${
            isDragging
              ? 'border-teal-500 bg-teal-50/60 shadow-inner'
              : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            multiple={isBulk}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.zip"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Upload className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Digital PDF & Scans Upload
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Upload Scanned Script Files
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Drop PDF answer scripts, ZIP barcode bundles, or image files
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showLiveCamera && (
        <CameraScanner
          isOpen={showLiveCamera}
          onClose={() => setShowLiveCamera(false)}
          onCaptureFinished={(capturedCount) => {
            setShowLiveCamera(false);
            toast.success(`Captured ${capturedCount} answer sheet pages successfully!`);
          }}
        />
      )}
    </div>
  );
}
