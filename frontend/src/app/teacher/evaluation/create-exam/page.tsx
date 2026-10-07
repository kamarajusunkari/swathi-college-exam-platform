import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ExamSetup from '@/components/evaluation/ExamSetup';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TeacherCreateExamPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <ExamSetup />
    </DashboardLayout>
  );
}
