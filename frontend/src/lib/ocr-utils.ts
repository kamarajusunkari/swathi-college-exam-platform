export interface OCRBoundingBox {
  questionNo: number;
  top: number;
  left: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface OCRResult {
  examId: string;
  studentRollNo: string;
  studentName?: string;
  totalPages: number;
  detectedText: string;
  confidence: number;
  boundingBoxes: OCRBoundingBox[];
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  warningMessage?: string;
}

export function getMockOCRResult(rollNo: string = '', studentName: string = ''): OCRResult {
  return {
    examId: '',
    studentRollNo: rollNo,
    studentName: studentName,
    totalPages: 1,
    confidence: 100,
    detectedText: '',
    boundingBoxes: [],
    status: 'SUCCESS',
  };
}

export function simulateOCRProcessing(
  file: File | { name: string; size: number },
  onProgress: (pct: number, status: string, stepIndex: number) => void,
  onComplete: (result: OCRResult) => void
): () => void {
  const steps = [
    { pct: 12, msg: 'Uploading student answer script scan...', delay: 400 },
    { pct: 28, msg: 'Enhancing contrast, deskewing & margin detection...', delay: 500 },
    { pct: 45, msg: 'Segmenting handwritten sections & formulas...', delay: 600 },
    { pct: 62, msg: 'Extracting chemical equations & derivations...', delay: 700 },
    { pct: 78, msg: 'Identifying question numbers against exam blueprint...', delay: 500 },
    { pct: 88, msg: 'AI analyzing steps against faculty rubric breakdown...', delay: 600 },
    { pct: 96, msg: 'Calculating keyword coverage and mark suggestions...', delay: 400 },
    { pct: 100, msg: 'Script evaluated and ready for faculty review!', delay: 300 },
  ];

  let currentStep = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let isCancelled = false;

  function runNext() {
    if (isCancelled) return;
    if (currentStep >= steps.length) {
      onComplete(getMockOCRResult(file.name.includes('1002') ? 'SWC-2026-1002' : 'SWC-2026-1001'));
      return;
    }

    const step = steps[currentStep];
    onProgress(step.pct, step.msg, currentStep);
    currentStep++;

    timeoutId = setTimeout(runNext, step.delay);
  }

  runNext();

  return () => {
    isCancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}

/**
 * Generates an SVG data URL mimicking a real college pharmacy handwritten exam paper with ruled lines,
 * margin lines, teacher stamps, handwritten pharmacy solutions, and highlighted question bounding boxes.
 */
export function generateSyntheticSheetSvg(
  pageNo: number,
  studentName: string = 'Student Candidate',
  rollNo: string = 'SWC-ROLL-001',
  activeQuestionNo: number = 3
): string {
  const width = 800;
  const height = 1130;

  // Ruled notebook lines (32px apart)
  let linesSvg = '';
  for (let y = 140; y < height - 60; y += 32) {
    linesSvg += `<line x1="40" y1="${y}" x2="${width - 40}" y2="${y}" stroke="#E2E8F0" stroke-width="1" />`;
  }

  let contentSvg = '';

  if (pageNo === 1) {
    contentSvg = `
      <!-- Header Area -->
      <rect x="40" y="40" width="720" height="85" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" />
      <text x="60" y="65" font-family="'Segoe UI', 'Montserrat', sans-serif" font-size="14" font-weight="bold" fill="#0F172A">SWATHI COLLEGE OF PHARMACY — EXAMINATION ANSWER SCRIPT</text>
      <text x="60" y="86" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">Candidate Name: <tspan font-weight="bold" fill="#1E293B">${studentName}</tspan> | University Roll No: <tspan font-weight="bold" fill="#0D9488">${rollNo}</tspan></text>
      <text x="60" y="106" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">Official Scanned Response Booklet | Page 1 of 4 | Active Focus: Question #${activeQuestionNo}</text>
      <rect x="640" y="52" width="100" height="60" rx="6" fill="#F1F5F9" stroke="#94A3B8" stroke-dasharray="3,3" />
      <text x="690" y="76" font-family="monospace" font-size="9" text-anchor="middle" fill="#64748B">OMR BARCODE</text>
      <text x="690" y="94" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#0F172A">|||| ||| ||||</text>

      <!-- Margin Vertical Line -->
      <line x1="110" y1="140" x2="110" y2="${height - 60}" stroke="#FDA4AF" stroke-width="1.5" />

      <!-- Section A Title -->
      <text x="125" y="165" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#1E293B">SECTION A — OBJECTIVE & CORE CURRICULUM QUESTIONS</text>

      <!-- Q1 -->
      <text x="60" y="196" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.1</text>
      <g opacity="${activeQuestionNo === 1 ? '1' : '0.85'}">
        <text x="125" y="197" font-family="'Caveat', 'Comic Sans MS', cursive" font-size="18" fill="#1E3A8A">Ans: Candidate handwritten response recorded for Question 1.</text>
        <text x="125" y="228" font-family="'Caveat', cursive" font-size="16" fill="#3B82F6">Technical justification and step validation noted in booklet.</text>
      </g>

      <!-- Q2 -->
      <text x="60" y="260" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.2</text>
      <g opacity="${activeQuestionNo === 2 ? '1' : '0.85'}">
        <text x="125" y="261" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Ans: Candidate handwritten solution for Question 2.</text>
        <text x="125" y="292" font-family="'Caveat', cursive" font-size="16" fill="#3B82F6">Underlying principles and theoretical classification formulated.</text>
      </g>

      <!-- Section B -->
      <text x="125" y="340" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#1E293B">SECTION B — DESCRIPTIVE & ESSAY EVALUATION</text>

      <!-- Q3 (Active Question) -->
      <text x="60" y="375" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.3</text>
      <g id="q3-answer-group">
        ${
          activeQuestionNo === 3
            ? `<rect x="115" y="355" width="630" height="260" rx="8" fill="#3B82F6" fill-opacity="0.06" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="4,4" />
               <rect x="630" y="360" width="105" height="22" rx="4" fill="#2563EB" />
               <text x="682" y="375" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ACTIVE FOCUS</text>`
            : ''
        }
        <text x="125" y="388" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Detailed response formulated by candidate for Question 3:</text>
        <text x="125" y="420" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Step 1: Foundational definitions and governing principles stated clearly.</text>
        <text x="125" y="452" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Step 2: Analytical methodology and relevant procedural derivations shown.</text>
        <text x="125" y="484" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Step 3: Intermediate workings, structural relations, and equation formulation.</text>
        <text x="125" y="516" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Step 4: Concluding deduction and practical applications outlined.</text>
      </g>

      <!-- Q4 -->
      <text x="60" y="650" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.4</text>
      <g opacity="${activeQuestionNo === 4 ? '1' : '0.85'}">
        <text x="125" y="651" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Comparative Analysis and Response for Question 4:</text>
        <text x="125" y="683" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Comparative differentiation table and graphical representation.</text>
        <text x="125" y="715" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Application parameters evaluated against standard criteria.</text>
      </g>
    `;
  } else if (pageNo === 2) {
    contentSvg = `
      <!-- Header -->
      <line x1="110" y1="140" x2="110" y2="${height - 60}" stroke="#FDA4AF" stroke-width="1.5" />
      <text x="60" y="80" font-family="'Segoe UI', sans-serif" font-size="11" fill="#64748B">Swathi College | Roll: ${rollNo} | Page: 2 of 4</text>

      <text x="125" y="165" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#1E293B">SECTION C — ADVANCED TOPICS & PROBLEM SOLVING</text>

      <!-- Q5 -->
      <text x="60" y="200" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.5</text>
      <g>
        <text x="125" y="201" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Comprehensive response for Question 5:</text>
        <text x="125" y="233" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">1. Core architectural structure and mechanism detailed by candidate.</text>
        <text x="125" y="265" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">2. Functional relationships and binding properties explained.</text>
        <text x="125" y="297" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">3. Systematic derivation and step-by-step reasoning verified.</text>
      </g>

      <!-- Q6 -->
      <text x="60" y="490" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.6</text>
      <g>
        <text x="125" y="491" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Industrial and practical case study analysis:</text>
        <text x="125" y="523" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Identified root causes and preventive remedies documented by candidate.</text>
      </g>
    `;
  } else {
    contentSvg = `
      <line x1="110" y1="140" x2="110" y2="${height - 60}" stroke="#FDA4AF" stroke-width="1.5" />
      <text x="60" y="80" font-family="'Segoe UI', sans-serif" font-size="11" fill="#64748B">Swathi College | Roll: ${rollNo} | Page: ${pageNo} of 4</text>
      <text x="125" y="165" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#1E293B">SUPPLEMENTARY CALCULATIONS & DIAGRAMS</text>
      <text x="125" y="210" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Candidate workings and supplementary verification plots for Question #${activeQuestionNo}...</text>
    `;
  }

  const fullSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <defs>
        <filter id="paper-texture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.03 0" />
          <feComposite in2="SourceGraphic" in="gl" operator="over" />
        </filter>
      </defs>
      <!-- Sheet Paper Background -->
      <rect width="${width}" height="${height}" fill="#FEFEFE" />
      <rect width="${width}" height="${height}" fill="#FFFDF9" opacity="0.9" />
      ${linesSvg}
      ${contentSvg}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
}
