"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Menu, Upload, Loader2, X, Check } from "lucide-react";
import { categoriesService } from "@/src/services/admin/categories.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminCategoriesView() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title?: string;
    message: string;
  }>({ isOpen: false, type: 'success', message: '' });
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    displayPosition: 1,
    tags: [] as string[]
  });

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.getCategories();
      if (data && data.data) {
        setCategories(data.data);
        if (data.data.length > 0 && !activeCategory) {
          selectCategory(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const selectCategory = (cat: any) => {
    setActiveCategory(cat);
    setImageFile(null);
    setImagePreview(cat.image || cat.heroCover || '');
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      displayPosition: cat.displayPosition || 1,
      tags: cat.tags || []
    });
  };

  const resetForm = () => {
    setActiveCategory(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      name: '',
      slug: '',
      description: '',
      displayPosition: categories.length + 1,
      tags: []
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let payload: any;
      if (imageFile) {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('slug', formData.slug);
        fd.append('description', formData.description);
        fd.append('displayPosition', String(formData.displayPosition));
        fd.append('image', imageFile);
        payload = fd;
      } else {
        payload = formData;
      }

      if (activeCategory) {
        await categoriesService.updateCategory(activeCategory._id, payload);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Category Updated',
          message: `Category "${formData.name}" has been updated successfully.`
        });
      } else {
        await categoriesService.createCategory(payload);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Category Created',
          message: `Category "${formData.name}" has been created successfully.`
        });
      }

      await fetchCategories();
    } catch (error: any) {
      console.error("Error saving category", error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: error?.response?.data?.message || 'Error saving category. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await categoriesService.deleteCategory(id);
      if (activeCategory?._id === id) {
        resetForm();
      }
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Category Deleted',
        message: `Category "${name}" was deleted successfully.`
      });
      await fetchCategories();
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Failed to delete category.'
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#8b181c]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Response Modal */}
      <AdminResponseModal 
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories & Tags</h1>
          <p className="text-sm text-gray-500">Map classification structures and product taxonomies</p>
        </div>
        <button 
          onClick={resetForm}
          className="px-4 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm flex items-center"
        >
          <Plus size={16} className="mr-2" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Category Tree */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Categories List ({categories.length})</h3>
            <span className="text-xs text-gray-400">Synced to Cloudinary & DB</span>
          </div>
          <div className="p-2 space-y-1">
            {categories.map((cat) => (
              <div key={cat._id}>
                <div 
                  onClick={() => selectCategory(cat)}
                  className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${activeCategory?._id === cat._id ? 'bg-red-50 text-[#8b181c]' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <Menu size={16} className="text-gray-400 cursor-grab" />
                    )}
                    <div>
                      <span className="font-bold block text-sm">{cat.name}</span>
                      <span className="text-[11px] text-gray-400">Order: {cat.displayPosition || 1}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => selectCategory(cat)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded"><Edit2 size={14} /></button>
                    <button 
                      onClick={(e) => handleDelete(e, cat._id, cat.name)} 
                      disabled={deletingId === cat._id}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded disabled:opacity-50 cursor-pointer"
                      title="Delete Category"
                    >
                      {deletingId === cat._id ? (
                        <Loader2 size={14} className="animate-spin text-red-600" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-4 text-center text-gray-500">No categories found. Click Add Category to start.</div>
            )}
          </div>
        </div>

        {/* Category Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              Category Details: {activeCategory ? activeCategory.name : 'New Category'}
            </h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category Name</label>
                <input 
                  required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  type="text" className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Slug URL</label>
                <input 
                  value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                  type="text" placeholder="beef" className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3} className="w-full p-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category Hero Cover / Banner</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400">No Image</span>
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded bg-white hover:bg-gray-50 shadow-sm mb-1 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={14} /> Change Banner
                    </button>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Uploads automatically to Cloudinary CDN</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Position Order</label>
                <input 
                  type="number" value={formData.displayPosition} onChange={e => setFormData({...formData, displayPosition: Number(e.target.value)})}
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#8b181c] hover:bg-[#721316] text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {activeCategory ? 'Update Category' : 'Create Category'}
                </button>
                {activeCategory && (
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
