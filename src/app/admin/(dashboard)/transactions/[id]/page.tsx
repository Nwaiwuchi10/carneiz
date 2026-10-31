import AdminTransactionDetailView from "@/src/views/admin/transactions/detail";

export const metadata = {
  title: "Transaction Detail - Carneiz Admin",
  description: "View transaction details",
};

export default function AdminTransactionDetailPage() {
  return <AdminTransactionDetailView />;
}
