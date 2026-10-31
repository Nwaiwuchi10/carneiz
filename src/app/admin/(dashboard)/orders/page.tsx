import AdminOrdersView from "@/src/views/admin/orders";

export const metadata = {
  title: "All Orders - Carneiz Admin",
  description: "Track orders across Carneiz store",
};

export default function AdminOrdersPage() {
  return <AdminOrdersView />;
}
