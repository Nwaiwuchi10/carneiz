"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bold, Italic, Underline, AlignLeft, Link as LinkIcon, Upload, Trash2, Plus, Loader2 } from "lucide-react";
import { productsService } from "@/src/services/admin/products.service";
import Link from "next/link";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminProductEditView() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title?: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'success', message: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    subcategory: '',
    protein: '',
    fat: '',
    carbs: '',
    calories: '',
    storageInstructions: '',
    deliveryEstimate: '',
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [variants, setVariants] = useState<any[]>([
    { weight: '1.0 kg Pack', price: 28500, stock: 45, active: true }
  ]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const p = await productsService.getProductById(productId);
        setProduct(p);
        setFormData({
          name: p.name || '',
          description: p.description || '',
          sku: p.sku || '',
          category: p.category || '',
          subcategory: p.subcategory || '',
          protein: p.protein || '',
          fat: p.fat || '',
          carbs: p.carbs || '',
          calories: p.calories || '',
          storageInstructions: p.storageInstructions || '',
          deliveryEstimate: p.deliveryEstimate || '',
        });
        if (p.variants && p.variants.length > 0) {
          setVariants(p.variants);
        }
        if (p.imageUrl) setExistingImageUrl(p.imageUrl);
        if (p.images) setExistingImages(p.images);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (productId !== 'new') {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [productId]);

  const handleSave = async (status: string) => {
    if (status === 'Draft') {
      setIsSavingDraft(true);
    } else {
      setIsSaving(true);
    }
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        fd.append(key, String(val));
      });
      fd.append('status', status);
      fd.append('variants', JSON.stringify(variants));
      fd.append('images', JSON.stringify(existingImages));
      
      if (coverImage) {
        fd.append('coverImage', coverImage);
      } else {
        fd.append('imageUrl', existingImageUrl || '');
      }
      newImages.forEach(img => {
        fd.append('images', img);
      });
      
      if (productId === 'new') {
        await productsService.createProduct(fd);
      } else {
        await productsService.updateProduct(productId, fd);
      }
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Product Saved',
        message: `Product details saved successfully as ${status}.`,
        onConfirm: () => router.push('/admin/products')
      });
    } catch (error: any) {
      console.error("Failed to save product", error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: error?.response?.data?.message || "Failed to save product. Please check required fields."
      });
    } finally {
      setIsSaving(false);
      setIsSavingDraft(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await productsService.deleteProduct(productId);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Product Deleted',
        message: 'Product was successfully removed from your catalog.',
        onConfirm: () => router.push('/admin/products')
      });
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Delete Failed',
        message: err?.response?.data?.message || "Failed to delete product. Please try again."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newV = [...variants];
    newV[index][field] = value;
    setVariants(newV);
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
        onClose={() => {
          setModal(prev => ({ ...prev, isOpen: false }));
          if (modal.onConfirm) modal.onConfirm();
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <div className="text-sm text-gray-500 mb-2">
            <Link href="/admin/products" className="hover:underline">Products</Link> &gt; {productId === 'new' ? 'New' : 'Edit'}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {productId === 'new' ? 'Create New Product' : `Edit: ${formData.name}`}
          </h1>
          <p className="text-sm text-gray-500">Fulfill detail specs, variants, pricing matrices and SEO</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {productId !== 'new' && (
            <>
              <Link
                href={`/products/${productId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 shadow-sm no-underline"
              >
                View in Store
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving || isSavingDraft}
                className="px-3.5 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-lg hover:bg-red-100 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
          <button 
            onClick={() => handleSave('Draft')}
            disabled={isSaving || isSavingDraft || isDeleting}
            className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSavingDraft && <Loader2 className="w-4 h-4 animate-spin text-gray-600" />}
            Save Draft
          </button>
          <button 
            onClick={() => handleSave('Active')}
            disabled={isSaving || isSavingDraft || isDeleting}
            className="px-4 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm disabled:opacity-70 flex items-center cursor-pointer"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">General Information</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Title</label>
                <input 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  type="text" className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rich Text Description</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Bold size={14}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Italic size={14}/></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Underline size={14}/></button>
                    <div className="w-px h-5 bg-gray-300 mx-1 self-center"></div>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignLeft size={14}/></button>
                    <div className="w-px h-5 bg-gray-300 mx-1 self-center"></div>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><LinkIcon size={14}/></button>
                  </div>
                  <textarea 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={4} className="w-full p-4 text-sm focus:outline-none focus:ring-0 resize-none text-gray-700" 
                  ></textarea>
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SKU Code</label>
                <input 
                  value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                  type="text" className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Product Images (Cover & Gallery)</h3>
              <span className="text-xs text-gray-400">Min. 3 high-res photos recommended</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Cover Image Slot */}
              <div className="relative aspect-square rounded-lg border-2 border-[#8b181c] overflow-hidden bg-gray-100 group">
                <img src={coverImage ? URL.createObjectURL(coverImage) : (existingImageUrl || 'https://via.placeholder.com/300?text=Cover+Image')} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer">
                    <span className="text-white text-xs font-bold bg-[#8b181c] px-3 py-1.5 rounded hover:bg-[#721316] transition-colors">Change Cover</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      if(e.target.files && e.target.files.length > 0) setCoverImage(e.target.files[0]);
                    }} />
                  </label>
                  {(coverImage || existingImageUrl) && (
                    <button 
                      type="button"
                      title="Delete cover image"
                      onClick={() => {
                        setCoverImage(null);
                        setExistingImageUrl('');
                      }}
                      className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors shadow"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-[#8b181c] text-white text-[10px] text-center py-1 font-bold">Primary Cover</div>
              </div>

              {/* Existing Gallery Images */}
              {existingImages.map((imgUrl, idx) => (
                <div key={`exist-${idx}`} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 group">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      title="Delete image"
                      onClick={() => {
                        setExistingImages(prev => prev.filter((_, i) => i !== idx));
                      }} 
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}

              {/* New Gallery Images */}
              {newImages.map((img, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 group">
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      title="Delete image"
                      onClick={() => {
                        const updated = [...newImages];
                        updated.splice(idx, 1);
                        setNewImages(updated);
                      }} 
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}

              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-500">
                <input type="file" className="hidden" accept="image/*" multiple onChange={e => {
                  if(e.target.files) {
                    setNewImages([...newImages, ...Array.from(e.target.files)]);
                  }
                }} />
                <Upload size={24} className="mb-2" />
                <span className="text-xs font-semibold text-center px-2">Add Gallery<br/>Images</span>
              </label>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Weight / Quantity Variants</h3>
              <button onClick={() => setVariants([...variants, { weight: '', price: 0, stock: 0, active: true }])} className="text-sm font-bold text-[#8b181c] flex items-center hover:underline"><Plus size={16} className="mr-1"/> Add Variant</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <div className="col-span-4">Weight / Pack</div>
                <div className="col-span-3">Price (₦)</div>
                <div className="col-span-3">Stock Quantity</div>
                <div className="col-span-2 text-center">Active</div>
              </div>
              {variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <input type="text" value={v.weight} onChange={e => handleVariantChange(idx, 'weight', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
                  </div>
                  <div className="col-span-3">
                    <input type="number" value={v.price} onChange={e => handleVariantChange(idx, 'price', Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
                  </div>
                  <div className="col-span-3">
                    <input type="number" value={v.stock} onChange={e => handleVariantChange(idx, 'stock', Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button 
                      onClick={() => handleVariantChange(idx, 'active', !v.active)}
                      className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${v.active ? 'bg-[#8b181c]' : 'bg-gray-300'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow transition-transform ${v.active ? 'translate-x-5' : 'translate-x-1'}`}></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition & Storage */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Nutrition & Storage Profile (Per 100g)</h3>
            <div className="grid grid-cols-4 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Energy (Kcal)</label>
                <input type="text" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Protein</label>
                <input type="text" value={formData.protein} onChange={e => setFormData({...formData, protein: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fat</label>
                <input type="text" value={formData.fat} onChange={e => setFormData({...formData, fat: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Carbs</label>
                <input type="text" value={formData.carbs} onChange={e => setFormData({...formData, carbs: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Storage Instructions</label>
                <input type="text" value={formData.storageInstructions} onChange={e => setFormData({...formData, storageInstructions: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Estimate Override</label>
                <input type="text" value={formData.deliveryEstimate} onChange={e => setFormData({...formData, deliveryEstimate: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">Categorization</h3>
              <button className="px-3 py-1.5 bg-[#8b181c] text-white text-xs font-bold rounded hover:bg-[#721316] transition-colors">
                Add Category
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c]">
                  <option value="Beef">Beef</option>
                  <option value="Chicken">Chicken</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subcategory</label>
                <select value={formData.subcategory} onChange={e => setFormData({...formData, subcategory: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c]">
                  <option value="Steaks & Chops">Steaks & Chops</option>
                  <option value="Ground">Ground</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5">Frequently Bought Together</h3>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50 text-sm">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <span className="font-medium text-gray-700">Organic Pepper Grinder</span>
              </div>
              <div className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50 text-sm">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <span className="font-medium text-gray-700">Fresh Sprig Rosemary</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bundle Discount (%)</label>
              <input type="text" placeholder="10% Off bundle" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
