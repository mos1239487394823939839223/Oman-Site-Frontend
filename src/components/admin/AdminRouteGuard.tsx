"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";
import LoadingSpinner from "./LoadingSpinner";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push("/login?redirect=/admin");
        return;
      }

      // Check if user is admin
      if (user && user.role !== "admin") {
        // Redirect to home if not admin
        router.push("/");
        return;
      }
    }
  }, [user, isAuthenticated, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show nothing if not authenticated or not admin (redirect will happen)
  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null;
  }

  // Render children if authenticated and is admin
  return <>{children}</>;
}

