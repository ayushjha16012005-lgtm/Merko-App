'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useToast
} from '@merko/ui';
import {
  useAdminProducts,
  useAdminCategories,
  useCreateProduct,
  useUpdateProduct,
  useToggleProductStatus,
  useDeleteProduct
} from '@/hooks/useAdmin';
import type { ProductResponseDto } from '@merko/types';
import { Search, Plus, Edit2, Trash2, ShieldAlert, Sparkles, CheckSquare } from 'lucide-react';

export default function AdminProductsPage() {
  const { toast } = useToast();

  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Selected products for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);



  // Modal Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductResponseDto | null>(null);

  // Form Field States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Workspace Tab State
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'variants'>('basic');

  // Staged Lists for Images and Variants
  const [imagesList, setImagesList] = useState<{ id?: string; imageUrl: string; altText: string; sortOrder: number }[]>([]);
  const [variantsList, setVariantsList] = useState<{ id?: string; name: string; sku: string; price: number; stock: number; isActive: boolean }[]>([]);

  // Add states for image staging inputs
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');

  // Add states for variant staging inputs
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantSku, setNewVariantSku] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('100');

  // Fetch Data
  const { data: categoriesData } = useAdminCategories();
  const {
    data: productsData,
    isLoading: productsLoading,
  } = useAdminProducts({
    search,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    isActive: statusFilter === 'active' ? true : statusFilter === 'draft' ? false : undefined,
    page,
    limit,
  });

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const statusMutation = useToggleProductStatus();
  const deleteMutation = useDeleteProduct();

  // Handlers
  const handleOpenCreateModal = () => {
    setEditProduct(null);
    setName('');
    setSlug('');
    setShortDescription('');
    setDescription('');
    setBasePrice('');
    setCategoryId(categories[0]?.id || '');
    setImagesList([]);
    setVariantsList([]);
    setActiveTab('basic');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (p: ProductResponseDto) => {
    setEditProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setShortDescription(p.shortDescription || '');
    setDescription(p.description || '');
    setBasePrice(String(p.basePrice));
    setCategoryId(p.categoryId);
    setImagesList((p.images || []).map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      altText: img.altText || '',
      sortOrder: img.sortOrder ?? 0,
    })));
    setVariantsList((p.variants || []).map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: Number(v.price),
      stock: v.stock ?? 0,
      isActive: v.isActive ?? true,
    })));
    setActiveTab('basic');
    setIsFormOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug
    if (!editProduct) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !basePrice || !categoryId) {
      toast('Please fill out all required fields.', 'error');
      return;
    }

    const payload = {
      categoryId,
      name,
      slug,
      shortDescription,
      description,
      basePrice: Number(basePrice),
      images: imagesList,
      variants: variantsList,
    };

    try {
      if (editProduct) {
        await updateMutation.mutateAsync({ id: editProduct.id, data: payload });
        toast('Product updated successfully!', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        toast('Product created successfully!', 'success');
      }
      setIsFormOpen(false);
      setSelectedIds([]);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { message?: string } } }).response?.data;
        toast(responseData?.message || 'Operation failed', 'error');
      } else {
        toast('Operation failed', 'error');
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await statusMutation.mutateAsync({ id, isActive: !currentStatus });
      toast('Product status updated!', 'success');
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string, permanent = false) => {
    if (!confirm(`Are you sure you want to ${permanent ? 'PERMANENTLY' : 'soft'} delete this product?`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id, permanent });
      toast(permanent ? 'Product deleted permanently!' : 'Product soft-deleted successfully!', 'success');
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch {
      toast('Failed to delete product', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => statusMutation.mutateAsync({ id, isActive: false })));
      toast(`Deactivated ${selectedIds.length} products!`, 'success');
      setSelectedIds([]);
    } catch {
      toast('Failed to bulk deactivate products', 'error');
    }
  };

  const selectOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Manage Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create catalog templates, define base price tables, and adjust variant stocks.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-1.5 shadow-lg shadow-indigo-600/10">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Control Filters Block */}
      <Card className="border-slate-200/60 dark:border-slate-800/40">
        <CardContent className="pt-6 grid gap-4 md:grid-cols-4 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              placeholder="Search by name/slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories select */}
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={selectOptions}
          />

          {/* Status select */}
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active Catalog' },
              { value: 'draft', label: 'Drafts' },
            ]}
          />

          <div className="text-xs font-semibold text-slate-400 text-right md:pr-2">
            Found {pagination?.total || 0} products
          </div>
        </CardContent>
      </Card>

      {/* Table block */}
      <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Slug & Key</th>
                  <th className="p-4">Base Price</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {productsLoading ? (
                  [1, 2, 3, 4].map((n) => (
                    <tr key={n}>
                      <td colSpan={6} className="p-4 text-center">
                        <div className="h-6 animate-pulse bg-slate-50 dark:bg-slate-800/40 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-500">
                      <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
                      <h4 className="font-bold text-slate-900 dark:text-white mt-4">No Products Registered</h4>
                      <p className="text-xs text-slate-400 mt-1">Create your first merchandise template to begin seeding catalog lists.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isChecked = selectedIds.includes(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition ${
                          isChecked ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                        }`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(p.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded bg-slate-50 flex items-center justify-center border text-lg dark:bg-slate-900 dark:border-slate-800">
                              {p.images?.[0]?.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={p.images[0].imageUrl} alt="" className="object-cover h-full w-full" />
                              ) : (
                                '📦'
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                {p.name}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {p.category?.name || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-500">
                          {p.slug}
                        </td>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          ₹{Number(p.basePrice).toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(p.id, p.isActive)}
                            className="focus:outline-none"
                            title="Click to toggle status"
                          >
                            <Badge variant={p.isActive ? 'success' : 'warning'}>
                              {p.isActive ? 'Active' : 'Draft'}
                            </Badge>
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(p)}
                            className="h-8 w-8 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(p.id, false)}
                            className="h-8 w-8 text-slate-400 hover:text-red-650"
                            title="Soft delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bulk Action Controls popup */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-slate-900 text-white p-4 flex items-center justify-between gap-6 dark:bg-slate-950 border-t border-slate-800"
              >
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider">
                  <CheckSquare className="h-4.5 w-4.5 text-indigo-400" />
                  <span>{selectedIds.length} Items Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkDeactivate}
                    className="text-xs hover:bg-slate-800 text-white hover:text-white"
                  >
                    Draft Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (confirm(`Soft delete all ${selectedIds.length} selected items?`)) {
                        await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync({ id })));
                        toast('Bulk deleted successfully!', 'success');
                        setSelectedIds([]);
                      }
                    }}
                    className="text-xs px-3 py-1 bg-red-700 hover:bg-red-800"
                  >
                    Delete Selected
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Pagination component */}
      {pagination && pagination.pages > 1 && !productsLoading && (
        <div className="flex justify-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPage(i + 1)}
              className="h-8 w-8 p-0"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* CREATE / EDIT DIALOG FORM MODAL WORKSPACE */}
      <Dialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            {editProduct ? 'Product Management Workspace' : 'Add New Product Blank'}
          </DialogTitle>
          <DialogDescription>
            {editProduct ? 'Full catalog management console. Configure text parameters, images registry, and variants table.' : 'Define settings below to register a new blank template in the marketplace catalog.'}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons Header */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/50 mt-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'basic'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'images'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Images ({imagesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'variants'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Variants ({variantsList.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="grid gap-4 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Category <span className="text-red-500">*</span></label>
                <Select
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>

              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Product Name <span className="text-red-500">*</span></label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Heavyweight Organic Hoodie"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">SEO Slug <span className="text-red-500">*</span></label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. heavyweight-organic-hoodie"
                  disabled={!!editProduct}
                  required
                />
              </div>

              {/* Base Price */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Base Price (₹) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 599.00"
                  required
                />
              </div>

              {/* Short Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Short Description</label>
                <Input
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief subtitle summary"
                />
              </div>

              {/* Long Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Detailed description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed breakdown of fabrics, sizes, or custom guidelines..."
                  className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: IMAGES MANAGEMENT */}
          {activeTab === 'images' && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Image to Workspace</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Input
                    placeholder="Alt Description (e.g. Front View)"
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!newImageUrl) {
                        toast('Please enter a valid image URL', 'error');
                        return;
                      }
                      setImagesList((prev) => [
                        ...prev,
                        {
                          imageUrl: newImageUrl,
                          altText: newImageAlt || 'Product image',
                          sortOrder: prev.length,
                        },
                      ]);
                      setNewImageUrl('');
                      setNewImageAlt('');
                      toast('Image added to staging preview!', 'success');
                    }}
                    className="text-xs px-4 py-1.5"
                  >
                    Staging Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Product Gallery Preview</h4>
                {imagesList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8 border border-dashed rounded-xl">
                    No images staging. Paste URLs above.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {imagesList.map((img, idx) => {
                      const isFeatured = idx === 0;
                      return (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-950 items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded overflow-hidden bg-slate-50 border dark:border-slate-800 flex items-center justify-center flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.imageUrl} alt={img.altText} className="object-cover h-full w-full" onError={(e)=>{ (e.target as HTMLElement).style.display = 'none'; }} />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                {img.altText || 'Product image'}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                {isFeatured ? (
                                  <span className="text-amber-500 font-bold">★ Primary Featured</span>
                                ) : (
                                  `Staging Order: ${img.sortOrder}`
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const list = [...imagesList];
                                const temp = list[idx];
                                list[idx] = list[idx - 1];
                                list[idx - 1] = temp;
                                list.forEach((item, index) => {
                                  item.sortOrder = index;
                                });
                                setImagesList(list);
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 dark:hover:bg-slate-800 disabled:opacity-30 text-xs"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === imagesList.length - 1}
                              onClick={() => {
                                const list = [...imagesList];
                                const temp = list[idx];
                                list[idx] = list[idx + 1];
                                list[idx + 1] = temp;
                                list.forEach((item, index) => {
                                  item.sortOrder = index;
                                });
                                setImagesList(list);
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 dark:hover:bg-slate-800 disabled:opacity-30 text-xs"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            {!isFeatured && (
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...imagesList];
                                  const target = list.splice(idx, 1)[0];
                                  list.unshift(target);
                                  list.forEach((item, index) => {
                                    item.sortOrder = index;
                                  });
                                  setImagesList(list);
                                  toast('Image set as primary featured!', 'success');
                                }}
                                className="p-1 hover:bg-amber-50 text-slate-400 hover:text-amber-500 rounded dark:hover:bg-amber-950/20 text-xs"
                                title="Set Featured"
                              >
                                ★
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const list = imagesList.filter((_, i) => i !== idx);
                                list.forEach((item, index) => {
                                  item.sortOrder = index;
                                });
                                setImagesList(list);
                                toast('Image removed from staging preview!', 'info');
                              }}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded dark:hover:bg-red-950/20 text-xs font-bold"
                              title="Delete Image"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VARIANTS MANAGEMENT */}
          {activeTab === 'variants' && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Variant Option</h4>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Input
                    placeholder="Name (e.g. Size: M)"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                  />
                  <Input
                    placeholder="SKU (e.g. TEE-WHT-M)"
                    value={newVariantSku}
                    onChange={(e) => setNewVariantSku(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Price (₹)"
                    value={newVariantPrice}
                    onChange={(e) => setNewVariantPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Stock Count"
                    value={newVariantStock}
                    onChange={(e) => setNewVariantStock(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!newVariantName || !newVariantSku || !newVariantPrice) {
                        toast('Name, SKU, and Price are required', 'error');
                        return;
                      }
                      const skuExists = variantsList.some((v) => v.sku === newVariantSku.toUpperCase());
                      if (skuExists) {
                        toast('A variant with this SKU already exists', 'error');
                        return;
                      }
                      setVariantsList((prev) => [
                        ...prev,
                        {
                          name: newVariantName,
                          sku: newVariantSku.toUpperCase(),
                          price: Number(newVariantPrice),
                          stock: Number(newVariantStock) || 0,
                          isActive: true,
                        },
                      ]);
                      setNewVariantName('');
                      setNewVariantSku('');
                      setNewVariantPrice('');
                      setNewVariantStock('100');
                      toast('Variant added to staging list!', 'success');
                    }}
                    className="text-xs px-4 py-1.5"
                  >
                    Staging Add Option
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Variants List</h4>
                {variantsList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8 border border-dashed rounded-xl">
                    No variants staging. Add options above.
                  </p>
                ) : (
                  <div className="overflow-x-auto border rounded-xl dark:border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                        <tr>
                          <th className="p-3">Variant Option Name</th>
                          <th className="p-3">SKU Code</th>
                          <th className="p-3 w-28">Price (₹)</th>
                          <th className="p-3 w-24">Stock</th>
                          <th className="p-3 w-20 text-center">Status</th>
                          <th className="p-3 w-12 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                        {variantsList.map((v, idx) => (
                          <tr key={idx}>
                            <td className="p-2">
                              <input
                                type="text"
                                value={v.name}
                                onChange={(e) => {
                                  const list = [...variantsList];
                                  list[idx].name = e.target.value;
                                  setVariantsList(list);
                                }}
                                className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-semibold text-slate-900 dark:text-white px-1 py-0.5"
                              />
                            </td>
                            <td className="p-2 font-mono">
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => {
                                  const list = [...variantsList];
                                  list[idx].sku = e.target.value.toUpperCase();
                                  setVariantsList(list);
                                }}
                                className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-mono px-1 py-0.5"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => {
                                  const list = [...variantsList];
                                  list[idx].price = Number(e.target.value) || 0;
                                  setVariantsList(list);
                                }}
                                className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-semibold px-1 py-0.5"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) => {
                                  const list = [...variantsList];
                                  list[idx].stock = Number(e.target.value) || 0;
                                  setVariantsList(list);
                                }}
                                className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none px-1 py-0.5"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...variantsList];
                                  list[idx].isActive = !v.isActive;
                                  setVariantsList(list);
                                }}
                              >
                                <Badge variant={v.isActive ? 'success' : 'warning'}>
                                  {v.isActive ? 'Active' : 'Draft'}
                                </Badge>
                              </button>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setVariantsList(variantsList.filter((_, i) => i !== idx));
                                  toast('Variant removed from list', 'info');
                                }}
                                className="text-red-500 hover:text-red-750 font-bold"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <DialogFooter className="border-t border-slate-100 pt-4 dark:border-slate-800/40">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editProduct ? 'Save All Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
