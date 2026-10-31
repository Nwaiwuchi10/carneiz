import AdminOrderDetailView from "@/src/views/admin/orders/detail";

export const metadata = {
  title: "Order Details - Carneiz Admin",
  description: "View specific order details",
};

export default function AdminOrderDetailPage() {
  return <AdminOrderDetailView />;
}
