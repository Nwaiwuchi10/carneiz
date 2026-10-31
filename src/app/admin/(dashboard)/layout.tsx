import AdminLayout from "@/src/views/admin/components/AdminLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
