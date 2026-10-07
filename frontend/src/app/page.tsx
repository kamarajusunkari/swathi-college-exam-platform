import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "EXAM_PAPER_CREATOR") {
    redirect("/creator/dashboard");
  }

  if (user.role === "EXAM_PAPER_EVALUATOR") {
    redirect("/evaluator/dashboard");
  }

  if (user.role === "EXAM_PAPER_CHECKER") {
    redirect("/checker/dashboard");
  }

  if (user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  }

  if (user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  redirect("/admin/dashboard");
}
