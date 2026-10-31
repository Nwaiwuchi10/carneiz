import AdminCustomerDetailView from "@/src/views/admin/customers/detail";

export const metadata = {
  title: "Customer Profile - Carneiz Admin",
  description: "View customer details and history",
};

export default function AdminCustomerDetailPage() {
  return <AdminCustomerDetailView />;
}
