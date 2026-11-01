"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Download, Plus, X, Upload, CheckCircle, Edit, Trash2, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { productsService } from "@/src/services/admin/products.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";
import DeleteConfirmationModal from "@/src/components/DeleteConfirmationModal";

export default function AdminProductsView() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, trending: 0, inStock: 0, outOfStock: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Action loading state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title?: string;
    message: string;
  }>({ isOpen: false, type: 'success', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Beef',
    price: '',
    stockQuantity: '',
    description: '',
    status: 'Active',
    weight: '1.0 kg',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: 15,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const [statsRes, prodRes] = await Promise.all([
        productsService.getStats(),
        productsService.getProducts(params)
      ]);
      setStats(statsRes);
      setProducts(prodRes.data || []);
      setTotalPages(Math.ceil((prodRes.total || 0) / 15) || 1);
      setTotalCount(prodRes.total || 0);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [page, searchTerm, selectedCategory, selectedStatus]);

  const handleDeleteProduct = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      await productsService.deleteProduct(id);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Product Deleted',
        message: `Product "${name}" was permanently deleted from the catalog.`
      });
      fetchProducts();
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Delete Failed',
        message: err?.response?.data?.message || "Failed to delete product. Please try again."
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        fd.append(key, String(val));
      });
      if (coverImage) {
        fd.append('coverImage', coverImage);
      }
      
      await productsService.createProduct(fd);
      setShowAddModal(false);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Product Created',
        message: `Product "${formData.name}" was successfully added to your catalog.`
      });
      fetchProducts();
      // reset form
      setFormData({
        name: '', category: 'Beef', price: '', stockQuantity: '', description: '', status: 'Active', weight: '1.0 kg'
      });
      setCoverImage(null);
    } catch (err: any) {
      console.error("Error adding product", err);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Creation Failed',
        message: err?.response?.data?.message || "Error adding product. Please verify fields and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await productsService.getProducts({ limit: 1000 });
      const items = res.data || products;
      if (items.length === 0) {
        setModal({
          isOpen: true,
          type: 'info',
          title: 'No Data',
          message: 'There are no products available to export.'
        });
        return;
      }
      const headers = ["ID", "Name", "Category", "Price", "Stock", "Status", "SKU"];
      const rows = items.map((p: any) => [
        p._id,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        p.price || 0,
        p.stockQuantity ?? 0,
        p.status || 'Active',
        `"${(p.sku || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carneiz_products_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Export Completed',
        message: `Successfully exported ${items.length} products to CSV.`
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate product CSV export. Please try again.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-50 text-green-700';
      case 'Out of Stock': return 'bg-red-50 text-red-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* Response Modal */}
      <AdminResponseModal 
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Product?"
        message="Are you sure you want to permanently delete this product from your inventory? Customers will no longer be able to purchase it."
        itemName={deleteConfirm.name}
        confirmText="Yes, Delete"
        isDeleting={deletingId === deleteConfirm.id}
        onConfirm={async () => {
          const id = deleteConfirm.id;
          const name = deleteConfirm.name;
          setDeleteConfirm({ isOpen: false, id: '', name: '' });
          await handleDeleteProduct(id, name);
        }}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-auto animate-in fade-in duration-200 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"
            >
              <X size={18} />
            </button>
            
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add Product Manually</h2>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Product Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. Premium Pork Ribs" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c]">
                      <option>Beef</option>
                      <option>Goat</option>
                      <option>Chicken</option>
                      <option>Turkey</option>
                      <option>Fish</option>
                      <option>Spices</option>
                      <option>Bulk</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Price (₦)</label>
                  <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" placeholder="28000" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Stock Quantity</label>
                  <input required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} type="number" placeholder="45 pcs" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Product Cover Image</label>
                <label className="border border-gray-200 border-dashed rounded-lg bg-gray-50/50 p-6 flex items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="file" className="hidden" accept="image/*" onChange={e => {
                    if(e.target.files && e.target.files.length > 0) setCoverImage(e.target.files[0]);
                  }} />
                  <div className="w-12 h-12 bg-[#8b181c] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {coverImage ? (
                      <img src={URL.createObjectURL(coverImage)} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{coverImage ? coverImage.name : 'Upload a product thumbnail'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Recommended square format. PNG or JPG under 5MB.</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Describe the cuts, weight range, packaging details..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"></textarea>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Product Status</h4>
                  <p className="text-xs text-gray-500">Set the visibility state for catalog search and order placement.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${formData.status === 'Active' ? 'text-[#8b181c]' : 'text-gray-500'}`}>
                    {formData.status}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Draft' : 'Active'})}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${formData.status === 'Active' ? 'bg-[#8b181c]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute shadow transition-transform ${formData.status === 'Active' ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2 cursor-pointer">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Products</h1>
          <p className="text-sm text-gray-500">Manage your meat catalog, inventory, and status</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin text-[#8b181c]" /> : <Download size={16} />}
            Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#8b181c] text-white text-sm font-semibold rounded-lg hover:bg-[#721316] shadow-sm transition-colors cursor-pointer">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-blue-500"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL PRODUCTS</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-2">{stats.total.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-500">Registered catalog items</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-green-500"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TRENDING PRODUCTS</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-2">{stats.trending.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-500">+12% growth from last month</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-yellow-500"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">IN STOCK</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-2">{stats.inStock.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-500">Available to order</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-red-600"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">OUT OF STOCK</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-2">{stats.outOfStock.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-500">Action needed</p>
        </div>
      </div>


      {/* Table Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
        {/* Filter Row */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search meat products, SKU..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] focus:border-[#8b181c]"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="w-40 pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c] focus:border-[#8b181c] cursor-pointer"
              >
                <option value="All">Category: All</option>
                <option value="Beef">Beef</option>
                <option value="Goat">Goat Meat</option>
                <option value="Chicken">Chicken / Poultry</option>
                <option value="Turkey">Turkey</option>
                <option value="Fish">Fish / Seafood</option>
                <option value="Spices">Spices</option>
                <option value="Gizzard">Gizzard</option>
                <option value="Pork">Pork</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            <div className="relative">
              <select 
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                className="w-36 pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c] focus:border-[#8b181c] cursor-pointer"
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b181c]"></div></div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-4 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="py-4 px-4 w-16">Image</th>
                  <th className="py-4 px-4">Product Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-500">No products found. Add a product or adjust filters.</td></tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-3 px-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 p-0.5">
                          <img src={prod.imageUrl || "/assets/images/placeholder.jpg"} alt="" className="w-full h-full object-contain" />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#8b181c] group-hover:underline">
                        <Link href={`/admin/products/${prod._id}`}>
                          {prod.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{prod.category}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">₦{(prod.price || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{prod.stockQuantity ?? 0} pcs</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(prod.status)}`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link 
                            href={`/products/${prod._id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            title="View in Storefront" 
                            className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <Link 
                            href={`/admin/products/${prod._id}`} 
                            title="Edit Product Details" 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={15} />
                          </Link>
                          <button 
                            onClick={() => setDeleteConfirm({ isOpen: true, id: prod._id, name: prod.name })} 
                            disabled={deletingId === prod._id}
                            title="Delete Product" 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40"
                          >
                            {deletingId === prod._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalCount > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>Showing {products.length} of {totalCount} products</p>
            <div className="flex gap-1">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 text-gray-700 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 border border-transparent bg-[#8b181c] text-white font-medium rounded-md">
                {page}
              </span>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 text-gray-700 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
