import type { Metadata } from "next";
import AdminSidebar from "./AdminSidebar";
import AdminNotifications from "./AdminNotifications";
import AdminUserMenu from "./AdminUserMenu";

export const metadata: Metadata = {
  title: "Admin | Misk Lume",
  robots: { index: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-area flex min-h-screen bg-admin-bg font-body">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-admin-border bg-admin-surface px-6">
          <div />
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <AdminNotifications />

            {/* Admin User Menu */}
            <AdminUserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
