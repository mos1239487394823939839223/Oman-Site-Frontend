import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ToastProvider } from "@/components/admin/ToastProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminRouteGuard>
        {children}
      </AdminRouteGuard>
    </ToastProvider>
  );
}
