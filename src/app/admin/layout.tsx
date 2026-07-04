import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ToastProvider } from "@/components/admin/ToastProvider";
import { NotificationsProvider } from "@/components/admin/NotificationsProvider";
import AdminShell from "@/components/admin/AdminShell";
import MuiThemeProvider from "@/components/admin/MuiThemeProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MuiThemeProvider>
      <ToastProvider>
        <AdminRouteGuard>
          <NotificationsProvider>
            <AdminShell>
              {children}
            </AdminShell>
          </NotificationsProvider>
        </AdminRouteGuard>
      </ToastProvider>
    </MuiThemeProvider>
  );
}
