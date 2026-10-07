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

export function getMockOCRResult(rollNo: string = 'SWC-2026-ROLL', studentName: string = 'Enrolled Student'): OCRResult {
  return {
    examId: 'exam-001',
    studentRollNo: rollNo,
    studentName: studentName,
    totalPages: 4,
    confidence: 96.4,
    detectedText: `Section A: Q1: C (Benzene ring with phenolic -OH)\nQ2: B (First pass hepatic metabolism)\n\nSection B:\nQ3: Aspirin synthesis: Salicylic acid + Acetic anhydride -> Acetylsalicylic acid + Acetic acid\nQ4: Zero order vs First order kinetics derivation: dC/dt = -k0 vs -k1*C\n\nSection C:\nQ5: Mechanism of action of ACE Inhibitors in renal hypertension...\nQ6: Tablet manufacturing defects (Capping, Lamination, Sticking) and preventive formulation remedies.`,
    boundingBoxes: [
      { questionNo: 1, top: 14, left: 10, width: 80, height: 12, label: 'Q1', confidence: 99 },
      { questionNo: 2, top: 28, left: 10, width: 80, height: 12, label: 'Q2', confidence: 99 },
      { questionNo: 3, top: 42, left: 10, width: 80, height: 22, label: 'Q3', confidence: 95 },
      { questionNo: 4, top: 66, left: 10, width: 80, height: 24, label: 'Q4', confidence: 91 },
    ],
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
      <text x="60" y="65" font-family="'Segoe UI', 'Montserrat', sans-serif" font-size="14" font-weight="bold" fill="#0F172A">SWATHI COLLEGE OF PHARMACY — SEMESTER EXAMINATION</text>
      <text x="60" y="86" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">Subject: Medicinal Chemistry-II (BP501T) | Semester: V (B.Pharm)</text>
      <text x="60" y="106" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">Student: <tspan font-weight="bold" fill="#1E293B">${studentName}</tspan> | Roll No: <tspan font-weight="bold" fill="#0D9488">${rollNo}</tspan> | Page: 1 of 4</text>
      <rect x="640" y="52" width="100" height="60" rx="6" fill="#F1F5F9" stroke="#94A3B8" stroke-dasharray="3,3" />
      <text x="690" y="76" font-family="monospace" font-size="9" text-anchor="middle" fill="#64748B">BARCODE / OMR</text>
      <text x="690" y="94" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#0F172A">|||| ||| ||||</text>

      <!-- Margin Vertical Line -->
      <line x1="110" y1="140" x2="110" y2="${height - 60}" stroke="#FDA4AF" stroke-width="1.5" />

      <!-- Section A Title -->
      <text x="125" y="165" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#1E293B">SECTION A — OBJECTIVE & MULTIPLE CHOICE (10 Marks)</text>

      <!-- Q1 -->
      <text x="60" y="196" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.1</text>
      <g opacity="${activeQuestionNo === 1 ? '1' : '0.85'}">
        <text x="125" y="197" font-family="'Caveat', 'Comic Sans MS', cursive" font-size="18" fill="#1E3A8A">Ans: (c) Phenolic -OH group attached to benzene nucleus</text>
        <text x="125" y="228" font-family="'Caveat', cursive" font-size="16" fill="#3B82F6">Reason: High electron density gives electrophilic substitution at ortho/para position.</text>
        <!-- Teacher Red Tick -->
        <path d="M 680 190 L 695 205 L 725 175" fill="none" stroke="#DC2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <text x="735" y="195" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="bold" fill="#DC2626">+1</text>
      </g>

      <!-- Q2 -->
      <text x="60" y="260" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.2</text>
      <g opacity="${activeQuestionNo === 2 ? '1' : '0.85'}">
        <text x="125" y="261" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Ans: (b) Cytochrome P450 CYP3A4 Enzyme System</text>
        <text x="125" y="292" font-family="'Caveat', cursive" font-size="16" fill="#3B82F6">Responsible for major Phase-I oxidation reactions in hepatocytes.</text>
        <!-- Teacher Red Tick -->
        <path d="M 680 255 L 695 270 L 725 240" fill="none" stroke="#DC2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <text x="735" y="260" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="bold" fill="#DC2626">+1</text>
      </g>

      <!-- Section B -->
      <text x="125" y="340" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#1E293B">SECTION B — SHORT PHARMACEUTICAL ESSAYS (20 Marks)</text>

      <!-- Q3 (Active Question) -->
      <text x="60" y="375" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.3</text>
      <g id="q3-answer-group">
        ${
          activeQuestionNo === 3
            ? `<rect x="115" y="355" width="630" height="275" rx="8" fill="#3B82F6" fill-opacity="0.06" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="4,4" />
               <rect x="630" y="360" width="105" height="22" rx="4" fill="#2563EB" />
               <text x="682" y="375" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ACTIVE GRADING</text>`
            : ''
        }
        <text x="125" y="388" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Synthesis of Aspirin (Acetylsalicylic Acid):</text>
        <text x="125" y="420" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Step 1: Salicylic acid (C7H6O3) + Acetic Anhydride ((CH3CO)2O)</text>
        <text x="125" y="452" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Step 2: Heated in presence of Conc. H2SO4 catalyst at 50-60°C</text>
        <text x="125" y="484" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Reaction: C6H4(OH)COOH + (CH3CO)2O  ──(H+)──>  C6H4(OCOCH3)COOH + CH3COOH</text>
        <text x="125" y="516" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Step 3: Acetylation of phenolic group yields Acetylsalicylic acid (Aspirin).</text>
        <text x="125" y="548" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Step 4: Recrystallization using warm ethanol and water.</text>
        <text x="125" y="580" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Therapeutic uses: Analgesic, Antipyretic, Anti-inflammatory, Antiplatelet agent.</text>

        <!-- Teacher Annotation in Red -->
        <circle cx="700" cy="560" r="24" fill="none" stroke="#DC2626" stroke-width="2.5" />
        <text x="700" y="567" font-family="'Caveat', cursive" font-size="22" font-weight="bold" text-anchor="middle" fill="#DC2626">4.5 / 5</text>
      </g>

      <!-- Q4 -->
      <text x="60" y="650" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.4</text>
      <g opacity="${activeQuestionNo === 4 ? '1' : '0.85'}">
        <text x="125" y="651" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Zero-order vs First-order Elimination Kinetics:</text>
        <text x="125" y="683" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Zero Order: Constant amount eliminated per unit time (-dC/dt = k0).</text>
        <text x="125" y="715" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">First Order: Constant fraction eliminated per unit time (-dC/dt = k1 * C).</text>
        <text x="125" y="747" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Half-life (t1/2): First order t1/2 = 0.693 / k1 (independent of initial conc).</text>
        <text x="125" y="779" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Examples: Ethanol, Phenytoin (Zero order at high doses); Amoxicillin (First order).</text>
      </g>
    `;
  } else if (pageNo === 2) {
    contentSvg = `
      <!-- Header -->
      <line x1="110" y1="140" x2="110" y2="${height - 60}" stroke="#FDA4AF" stroke-width="1.5" />
      <text x="60" y="80" font-family="'Segoe UI', sans-serif" font-size="11" fill="#64748B">Swathi College | Roll: ${rollNo} | Page: 2 of 4</text>

      <text x="125" y="165" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#1E293B">SECTION C — DETAILED CLINICAL & PHARMACOLOGICAL DERIVATIONS (35 Marks)</text>

      <!-- Q5 -->
      <text x="60" y="200" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.5</text>
      <g>
        <text x="125" y="201" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Structure Activity Relationship (SAR) of Beta-Lactam Antibiotics:</text>
        <text x="125" y="233" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">1. Four-membered Beta-lactam ring fused to Thiazolidine ring is essential for activity.</text>
        <text x="125" y="265" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">2. Free Carboxylic acid (-COOH) at C-3 position is required for binding with PBP.</text>
        <text x="125" y="297" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">3. Acyl side chain at C-6 position dictates antibacterial spectrum and acid stability.</text>
        <text x="125" y="329" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">   - Electron withdrawing group (e.g. NH2 in Ampicillin) imparts acid resistance.</text>
        <text x="125" y="361" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">   - Bulky aromatic group (e.g. Methicillin) imparts Beta-lactamase resistance.</text>
        <text x="125" y="393" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Mechanism: Inhibits Transpeptidase enzyme preventing bacterial cell wall cross-linking.</text>

        <!-- Red Ink Faculty Comment -->
        <text x="125" y="440" font-family="'Caveat', cursive" font-size="18" fill="#DC2626">✓ Excellent SAR points and chemical reasoning. Clear mechanism.</text>
        <circle cx="700" cy="380" r="24" fill="none" stroke="#DC2626" stroke-width="2.5" />
        <text x="700" y="387" font-family="'Caveat', cursive" font-size="22" font-weight="bold" text-anchor="middle" fill="#DC2626">9.5 / 10</text>
      </g>

      <!-- Q6 -->
      <text x="60" y="490" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#0F172A">Q.6</text>
      <g>
        <text x="125" y="491" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Industrial Tablet Manufacturing Defects and Remediation:</text>
        <text x="125" y="523" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">a) Capping & Lamination: Partial or complete separation of top/bottom crowns.</text>
        <text x="125" y="555" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">   - Causes: Air entrapment during high-speed compression, excessive fine powder.</text>
        <text x="125" y="587" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">   - Remedy: Use pre-compression, add hygroscopic binders (PVP K-30), reduce fines.</text>
        <text x="125" y="619" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">b) Sticking & Picking: Material adhering to punch faces.</text>
        <text x="125" y="651" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">   - Causes: High moisture in granules, insufficient lubricant (Magnesium Stearate).</text>
        <text x="125" y="683" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">   - Remedy: Dry granules thoroughly, increase lubricant concentration to 1-2%.</text>
      </g>
    `;
  } else {
    contentSvg = `
      <line x1="110" y1="140" x2="110" y2="${height - 60}" stroke="#FDA4AF" stroke-width="1.5" />
      <text x="60" y="80" font-family="'Segoe UI', sans-serif" font-size="11" fill="#64748B">Swathi College | Roll: ${rollNo} | Page: ${pageNo} of 4</text>
      <text x="125" y="165" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#1E293B">SUPPLEMENTARY CALCULATIONS & DIAGNOSTIC CURVES</text>
      <text x="125" y="210" font-family="'Caveat', cursive" font-size="18" fill="#1E3A8A">Q.7 Clinical Assay protocol & Spectrophotometric Beer-Lambert calibration plot...</text>
      <text x="125" y="250" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Absorbance A = ε · c · l, where path length l = 1 cm.</text>
      <text x="125" y="290" font-family="'Caveat', cursive" font-size="17" fill="#1E3A8A">Linear regression line: y = 0.0452x + 0.0012, R² = 0.9998.</text>
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
