import AdminTransactionsView from "@/src/views/admin/transactions";

export const metadata = {
  title: "Transactions - Carneiz Admin",
  description: "Track all payment activities",
};

export default function AdminTransactionsPage() {
  return <AdminTransactionsView />;
}
