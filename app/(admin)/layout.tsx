
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard/dashboard-layout";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
