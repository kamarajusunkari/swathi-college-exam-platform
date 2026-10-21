# Swathi College Examination Platform — Executive Engineering Audit & Master Development Plan

**Project:** Swathi College Examination Management & Evaluation Platform  
**Target Audience:** Engineering Management, Technical Lead & Development Team  
**Audit Date:** October 12, 2026  
**Document Status:** Complete Audit Report & Implementation Roadmap (Ready for Execution)  
**Tracking File:** `DEVELOPMENT_PLAN.md`  

---

## Executive Summary

An architectural and source-code audit was conducted across the **NestJS 12** backend, **Prisma 6 / PostgreSQL** database layer, and **Next.js 15 (App Router) / React 19** frontend.

The project contains high-value foundations (clean Prisma schema, NestJS module separation, rich Tailwind UI layouts, and Google Gemini Flash Lite integration). However, **several critical workflows are disconnected**:
1. Frontend components make direct `fetch('/api/...')` calls that fail with 404 HTML responses because `next.config.ts` lacks API rewrites to the backend (port 5000).
2. Several interactive screens (`ManualEvaluator.tsx`, `TeacherEvaluationClient.tsx`, and `answer-sheets/page.tsx`) store marks and scripts in browser `localStorage` or simulate completion with `setTimeout`, completely bypassing working backend database APIs.
3. Strict server page guards redirect three out of seven roles (`EXAM_PAPER_CREATOR`, `EXAM_PAPER_EVALUATOR`, and `EXAM_PAPER_CHECKER`) to `/login` when accessing shared administrative consoles linked from their sidebars.
4. Two TypeScript compilation errors currently block frontend production builds.
5. Zero automated tests exist in the codebase.

### Project Delivery Forecast

| Delivery Model | Team Velocity | Total Effort | Projected Timeline | Target Completion |
|---|---|---|---|---|
| **Standard Delivery (Solo Full-Stack Dev)** | 36–40 hrs / week | **144 Total Hours** | **4 Sprints (4 Weeks)** | **November 9, 2026** |
| **Accelerated Delivery (2 Full-Stack Devs)** | 70–75 hrs / week | **144 Total Hours** | **2 Sprints (2.5 Weeks)** | **October 30, 2026** |

---

## 1. Technology Stack & Architecture

### Backend Architecture
- **Framework:** NestJS 12.1.2 with `@nestjs/platform-express` and TypeScript 5.7.3.
- **Database & ORM:** PostgreSQL (NeonDB cloud with SSL and pooling) via Prisma Client 6.4.1.
- **Authentication:** Stateless JWT (`jose` v5.9.6, HS256) stored in HTTP-only `auth_token` cookie and `swathi_auth_user` cookie. Passwords hashed using `bcryptjs` (salt rounds: 10).
- **Validation & Transformation:** `class-validator` v0.15.1 and `class-transformer` v0.5.1 with global `ValidationPipe({ whitelist: true, transform: true })`.
- **External Integrations:** Google Gemini Flash Lite (OpenAI SDK compatible endpoint) for document OCR and answer script grading; `qrcode` v1.5.4 for cryptographic verification payloads.

### Frontend Architecture
- **Framework:** Next.js 15.1.7 (App Router) with React 19.0.0 and TypeScript 5.7.3.
- **State & Data Fetching:** TanStack React Query v5.104.1 for server cache & mutations; Zustand v5.0.15 for client store; Axios v1.20.0 as API client.
- **Styling & UI:** Tailwind CSS v3.4.17 with custom design tokens, Lucide React icons, Sonner toast notifications.
- **Document Output:** `jspdf` v2.5.2 for client-side printable marksheet and admit card rendering.

---

## 2. Audit of the Seven Platform Roles

| # | Role Key | Role Name | Implemented State | Gap Analysis & Necessary Fixes |
|---|---|---|---|---|
| 1 | `SUPER_ADMIN` | Super Administrator | **Partially Implemented** | Has master access across academic, user, exam, fee, and audit modules. Lacks visual audit export and emergency rollbacks. |
| 2 | `ADMIN` | Exam Controller | **Partially Implemented** | Uses `/admin/*` dashboards. Missing batch hall-ticket release controls, formal question paper sign-off gate, and result publication pre-flight check. |
| 3 | `EXAM_PAPER_CREATOR` | Exam Paper Creator | **Broken Access** | Has `/creator/dashboard` with time window widget. **Blocker:** Sidebar links to `/admin/exams` and `/admin/exams/create` boot the user to `/login` because server page loaders only allow `SUPER_ADMIN` and `ADMIN`. Submit button is a simulated toast. |
| 4 | `EXAM_PAPER_EVALUATOR` | Exam Paper Evaluator | **Broken Access & Mocked** | Has `/evaluator/dashboard`. **Blocker:** Link to `/admin/evaluation` boots the user to `/login`. `ManualEvaluator.tsx` saves marks to `localStorage` instead of calling `POST /evaluation/submit`. |
| 5 | `EXAM_PAPER_CHECKER` | Paper Checker (Scrutiny) | **Partially Implemented** | Backend has `checkModeration`. **Blocker:** Cannot access evaluation desk from sidebar. Frontend calls non-existent route `/evaluation/check-moderation` instead of `/evaluation/check`. |
| 6 | `TEACHER` | Teacher (Faculty) | **Frontend Only** | Has `/teacher/dashboard`. Internal tests and test scores are kept in transient React `useState`. Evaluation client sync fails and falls back to `localStorage`. |
| 7 | `STUDENT` | Student Candidate | **Broken Build & Proxy** | Has `/student/*` pages. **Blocker:** TypeScript compilation fails in `student/fees` and `student/hall-tickets`. Fee payment hits 404 without Next.js rewrites. Hall ticket eligibility checks any fee instead of the specific exam fee. |

---

## 3. Detailed Component & Feature Classification

| Functional Subsystem | Classification | Source Evidence & Observations |
|---|---|---|
| **Authentication & Session** | Partially Implemented | Login, logout, `/auth/me`, and `/auth/switch-role` work. Backend `RolesGuard` does not enforce operational time-windows (`isTimeRestricted`, `dailyStartTime`, `dailyEndTime`) or granular permissions. |
| **API Proxy & Routing** | Broken | `frontend/next.config.ts` has no `rewrites` config. Client calls to `/api/...` return 404 HTML. |
| **Academic Master Data** | Partially Implemented | Programs, Classes, Sections, Groups, Subjects exist in Prisma and controllers. API client contract mismatches in `updateSubject` and `deleteEntity`. |
| **Examination Blueprinting** | Partially Implemented | Exam scheduling creates blueprint and paper records. Question bank editing and paper version history APIs are missing. |
| **Controlled 2-Hour Paper Release** | Partially Implemented | Manual toggle endpoint `POST /exams/papers/release` exists. No automated scheduler or cron job validates that release is constrained to the 120-minute pre-exam window. |
| **Fee Clearance & Hall Tickets** | Partially Implemented | Payment marks fee `PAID` and auto-creates `HallTicket`. Hall ticket generation has no room/seat batch allocator or revocation endpoint. |
| **Answer Sheet Ingestion** | Frontend Only | `app/answer-sheets` uses `setTimeout` simulation. Backend `ingestSheets` exists but lacks multipart upload & barcode matching. |
| **Manual & AI Script Evaluation** | Frontend Only | `ManualEvaluator.tsx` updates `localStorage` (`updateSheetMarks`). Backend `submitEvaluation` is functional but never invoked from the UI. |
| **Paper Checker Scrutiny** | Partially Implemented | Backend updates answer sheet and stages `ExamResult`. Frontend route naming mismatch and broken sidebar permissions. |
| **Result Publication Engine** | Partially Implemented | `publishResults` updates `isPublished` in bulk without validating whether scripts have been evaluated and checker-approved. |
| **Faculty Internal Tests** | Frontend Only | Hardcoded `useState` in `TeacherDashboard.tsx`. No database persistence. |
| **Testing & CI/CD** | Not Implemented | 0 test files in repository. No test scripts configured. |

---

## 4. Prioritized, Dependency-Aware Development Backlog

### Module M01: Infrastructure, Routing & API Contract Alignment
- **Priority:** Critical | **Effort:** 8 Hours
- **Scope:** 
  - Add API proxy rewrites in `frontend/next.config.ts` redirecting `/api/:path*` to `http://localhost:5000/api/:path*`.
  - Fix the 2 TypeScript compilation errors in `student/fees/page.tsx` and `student/hall-tickets/page.tsx`.
  - Align all endpoint URLs in `frontend/src/lib/api/services.api.ts` with backend NestJS controllers.
  - Setup Jest/Vitest unit testing configuration in backend and frontend.
- **Definition of Done:** `npx tsc --noEmit` succeeds in both folders; client `fetch('/api/...')` reaches NestJS successfully.

### Module M02: Unified Roles, Time-Window Enforcement & Route Guards
- **Priority:** Critical | **Effort:** 12 Hours
- **Scope:**
  - Update `backend/src/common/guards/roles.guard.ts` and `jwt-auth.guard.ts` to enforce operational time windows (`isTimeRestricted`, `timeWindowStart`, `timeWindowEnd`, `dailyStartTime`, `dailyEndTime`) and granular permissions.
  - Fix server page loader guards in `app/admin/exams`, `app/admin/evaluation`, `app/admin/results`, and `app/admin/answer-sheets` to authorize `EXAM_PAPER_CREATOR`, `EXAM_PAPER_EVALUATOR`, and `EXAM_PAPER_CHECKER` appropriately.
  - Protect unauthenticated endpoints in `ai.controller.ts` with `JwtAuthGuard` and role guards.
- **Definition of Done:** Creators, Evaluators, and Checkers can access their respective workspace pages without redirect loops; outside-hours API requests are rejected with 403 Forbidden.

### Module M03: Academic Master Data & Curriculum Management
- **Priority:** High | **Effort:** 8 Hours
- **Scope:**
  - Verify and complete Program, Class, Section, Group, and Subject CRUD.
  - Fix `deleteEntity` and `updateSubject` contract mismatches.
  - Validate teacher-to-subject assignments and student enrollment links.
- **Definition of Done:** Full academic hierarchy can be created, updated, and deleted with audit logging.

### Module M04: Question Paper Vault, Blueprinting & 2-Hour Release Engine
- **Priority:** Critical | **Effort:** 16 Hours
- **Scope:**
  - Question item CRUD with step-by-step marking rubrics, model answers, and section categorization.
  - Question paper workflow: Draft formulation → Creator submit → Exam Controller approval → Vault locking.
  - Version history tracking via `PaperVersionHistory` table on every modification.
  - Automated 2-hour controlled release validator: enforce that papers cannot be unlocked earlier than `releaseLeadMinutes` (120 mins) prior to exam start.
  - Print-ready PDF question paper generation.
- **Definition of Done:** Creators formulate and submit papers; Controllers review and approve; unreleased papers remain cryptographically locked until the 2-hour window.

### Module M05: Fee Verification, Clearance & QR Hall Ticket Engine
- **Priority:** Critical | **Effort:** 14 Hours
- **Scope:**
  - Exam fee invoice creation per enrolled student.
  - Real-time online fee payment processing and instant reconciliation.
  - Strict eligibility guard: Hall tickets must NOT be issued or downloadable if mandatory examination fees are unpaid.
  - Exam Controller batch hall-ticket generation with exam center, room number, and seat allocation.
  - Signed QR payload generation and public verification endpoint `/hall-tickets/verify/:ticketNumber`.
  - Student hall ticket print/PDF layout.
- **Definition of Done:** Unpaid students cannot view/download hall tickets; payment immediately unlocks hall ticket with verifiable QR code.

### Module M06: Physical Answer Sheet Digitization & Barcode Ingestion
- **Priority:** High | **Effort:** 14 Hours
- **Scope:**
  - Replace simulation in `answer-sheets/page.tsx` and `TeacherEvaluationClient.tsx` with actual database persistence.
  - Answer sheet bundle creation (`AnswerSheetBundle`) for physical examination centers.
  - Answer booklet ingestion with barcode/QR student mapping (`sheetCode` → `StudentProfile`).
  - Flagging and resolution interface for unmapped or low-confidence OCR barcodes.
- **Definition of Done:** Physical scanned batches are ingested into PostgreSQL, linked to exam and student records, and assigned to evaluation bundles.

### Module M07: Digital Script Evaluation Desk & AI Assisted Scoring
- **Priority:** Critical | **Effort:** 18 Hours
- **Scope:**
  - Wire `ManualEvaluator.tsx` and `TeacherEvaluationClient.tsx` to `POST /evaluation/submit`.
  - Live question-by-question scoring against official rubric breakdown steps.
  - Double-blind evaluation control: Evaluators can only access answer sheets explicitly assigned to them.
  - AI scoring integration: Gemini Flash Lite suggestion retrieval, confidence score display, and teacher overrides with reason logging.
  - Score summary computation (total marks, percentage, UGC 10-point grade, pass/fail status).
- **Definition of Done:** Evaluator grading is saved directly into `QuestionEvaluation` and `AnswerSheet` database tables; draft vs. finalized states persist across sessions.

### Module M08: Paper Checker Scrutiny, Moderation & Sign-Off Gate
- **Priority:** Critical | **Effort:** 10 Hours
- **Scope:**
  - Complete `CheckerDashboard` and connect to backend `POST /evaluation/check`.
  - 2nd-stage scrutiny queue displaying evaluated booklets pending scrutiny.
  - Checker score adjustments, moderation notes, and official sign-off recording (`checkedById`, `checkedAt`, `checkerNotes`).
  - Enforcement rule: Answer booklets must complete Paper Checker approval before staging into final results.
- **Definition of Done:** Scrutiny sign-off transitions answer sheets to `FINALIZED` and automatically creates/updates `ExamResult` records.

### Module M09: Result Calculation, Validation Gate & Publication
- **Priority:** Critical | **Effort:** 12 Hours
- **Scope:**
  - Institutional grading engine: SGPA/GPA computation, pass/fail thresholds, grace marks rules.
  - Pre-publication validation gate: Verify that all candidate sheets for an exam have completed evaluation AND checker scrutiny before publication is allowed.
  - Bulk publish / unpublish toggle with audit trail recording.
  - Digital transcript / marksheet rendering with anti-tamper verification QR code.
- **Definition of Done:** Unfinished exams cannot be published; published results instantly populate student grade cards with verifiable QR codes.

### Module M10: Faculty (Teacher) Internals & Continuous Assessment
- **Priority:** Medium | **Effort:** 10 Hours
- **Scope:**
  - Replace transient React state in `TeacherDashboard.tsx` with persistent database entities for class unit tests and practical continuous assessments.
  - Faculty marks entry interface for assigned subject sections.
  - Syncing internal assessment scores with student academic profiles.
- **Definition of Done:** Faculty can schedule internal tests and record continuous assessment scores that persist in the database.

### Module M11: Student Portal End-to-End Verification
- **Priority:** High | **Effort:** 8 Hours
- **Scope:**
  - End-to-end user journey verification: Timetable → Fee Payment → Hall Ticket Download → Result Transcript.
  - Responsive mobile testing for student smartphones.
  - Error states and zero-dues clearance messaging.
- **Definition of Done:** Complete student lifecycle functions smoothly with zero console errors or network failures.

### Module M12: Institutional Audit Trails, E2E Testing & Release Verification
- **Priority:** High | **Effort:** 14 Hours
- **Scope:**
  - Comprehensive audit logging for sensitive actions (paper release, marks override, checker moderation, result publication, user role changes).
  - Automated integration test suite covering the entire exam lifecycle.
  - Production build verification (`npm run build` in backend and frontend).
  - Security headers, CORS lockdown, and environment configuration audit.
- **Definition of Done:** All builds pass cleanly; automated test suite passes; complete audit log exportable by Super Admin.

---

## 5. Master Development Tracker & Milestone Schedule

### Capacity Baseline
- **Team Size:** 1 Full-Stack Developer
- **Weekly Capacity:** 36 Working Hours (7.2 hrs/day, 5 days/week)
- **Total Project Effort:** **144 Hours**
- **Project Duration:** **4 Sprints (4 Weeks)**

```
Sprint 1 (Days 1–5):   M01 + M02 + M03 (32 hrs)  — Core Plumbing, Security & Hierarchy
Sprint 2 (Days 6–10):  M04 + M05 (30 hrs)        — Paper Vault, 2-Hr Release, Fees & Hall Tickets
Sprint 3 (Days 11–17): M06 + M07 + M08 (42 hrs)  — Ingestion, Evaluation & Checker Scrutiny
Sprint 4 (Days 18–24): M09 + M10 + M11 + M12 (40 hrs) — Results, Internals, Student & E2E Audit
```

| Module ID | Module Name | Priority | Dependencies | Est. Hours | Planned Start | Target Delivery | Status | Verification Status |
|---|---|---|---|:---:|:---:|:---:|:---:|:---:|
| **M01** | Infrastructure & Contract Alignment | **Critical** | None | 8h | Day 1 | Day 2 | **Ready to Implement** | Pending Approval |
| **M02** | Roles, Time-Windows & Guards | **Critical** | M01 | 12h | Day 2 | Day 4 | **Blocked by M01** | Not Started |
| **M03** | Academic Master Data | **High** | M01, M02 | 8h | Day 4 | Day 5 | **Blocked by M02** | Not Started |
| **M04** | Paper Vault & 2-Hr Release | **Critical** | M02, M03 | 16h | Day 6 | Day 8 | **Blocked by M03** | Not Started |
| **M05** | Fee Clearance & QR Hall Tickets | **Critical** | M02, M04 | 14h | Day 8 | Day 10 | **Blocked by M04** | Not Started |
| **M06** | Answer Sheet Ingestion & Barcodes | **High** | M04, M05 | 14h | Day 11 | Day 13 | **Blocked by M05** | Not Started |
| **M07** | Script Evaluation Desk & AI | **Critical** | M02, M06 | 18h | Day 13 | Day 15 | **Blocked by M06** | Not Started |
| **M08** | Paper Checker Scrutiny Gate | **Critical** | M07 | 10h | Day 16 | Day 17 | **Blocked by M07** | Not Started |
| **M09** | Result Validation & Publication | **Critical** | M05, M08 | 12h | Day 18 | Day 19 | **Blocked by M08** | Not Started |
| **M10** | Faculty Internal Tests | **Medium** | M03, M07 | 10h | Day 20 | Day 21 | **Blocked by M03** | Not Started |
| **M11** | Student Portal End-to-End | **High** | M05, M09 | 8h | Day 21 | Day 22 | **Blocked by M09** | Not Started |
| **M12** | Audit Logs & Release Test Suite | **High** | M01–M11 | 14h | Day 23 | Day 24 | **Blocked by M11** | Not Started |

---

## 6. Recommended First Step: Module M01

**Module M01 (Infrastructure, Routing & API Contract Alignment)** is recommended as the immediate next step for the following reasons:
1. **Unblocks Client Communications:** Adding Next.js rewrites in `next.config.ts` immediately fixes all broken client `fetch('/api/...')` calls across fee payments, paper releases, results publishing, and scrutiny checks.
2. **Restores Build Integrity:** Resolves the two TypeScript compilation errors in `student/fees/page.tsx` and `student/hall-tickets/page.tsx` so the platform compiles without warnings.
3. **Aligns API Contracts:** Establishes single-source-of-truth endpoint contracts between `services.api.ts` and backend controllers.
4. **Zero Regression Risk:** Modifies zero business logic while fixing the foundation required by all 11 subsequent modules.
