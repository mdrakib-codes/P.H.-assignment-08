import type { ReactNode } from "react";
import { PrivateRouteGuard } from "@/components/auth/PrivateRouteGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <PrivateRouteGuard>{children}</PrivateRouteGuard>;
}
