import AdminProductsView from "@/src/views/admin/products";

export const metadata = {
  title: "All Products - Carneiz Admin",
  description: "Manage products catalog",
};

export default function AdminProductsPage() {
  return <AdminProductsView />;
}
