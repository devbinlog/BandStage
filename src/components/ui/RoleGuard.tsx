import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * 역할 기반 접근 제어 서버 컴포넌트.
 * 허용된 역할이 아닌 경우 redirectTo로 이동.
 */
export async function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleGuardProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as UserRole;
  if (!allowedRoles.includes(userRole)) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}
