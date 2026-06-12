'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useToast,
  Select
} from '@merko/ui';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useToggleCategoryStatus,
  useDeleteCategory
} from '@/hooks/useAdmin';
import { apiClient } from '@/lib/api-client';
import type { CategoryResponseDto } from '@merko/types';
import { Search, Plus, Edit2, Trash2, FolderTree, Sparkles } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { toast } = useToast();

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

  // Modal Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryResponseDto | null>(null);

  // Form Field States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [masterImageUrl, setMasterImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');

  // Fetch Data
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useAdminCategories({
    search,
    isActive: statusFilter === 'active' ? true : statusFilter === 'draft' ? false : undefined,
  });

  const categories = categoriesData?.data || [];

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const statusMutation = useToggleCategoryStatus();
  const deleteMutation = useDeleteCategory();

  // Handlers
  const handleOpenCreateModal = () => {
    setEditCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setMasterImageUrl('');
    setSortOrder('0');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (c: CategoryResponseDto) => {
    setEditCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setImageUrl(c.imageUrl || '');
    setMasterImageUrl(c.masterImageUrl || '');
    setSortOrder(String(c.sortOrder));
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await apiClient.post('/upload', {
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data,
        });
        const fileUrl = res.data.data.fileUrl;
        setMasterImageUrl(fileUrl);
        toast('Master image uploaded successfully!', 'success');
      } catch (err) {
        toast('Failed to upload master image.', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editCategory) {
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
    if (!name || !slug) {
      toast('Please fill out all required fields.', 'error');
      return;
    }

    const payload = {
      name,
      slug,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      masterImageUrl: masterImageUrl || undefined,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      if (editCategory) {
        await updateMutation.mutateAsync({ id: editCategory.id, data: payload });
        toast('Category updated successfully!', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        toast('Category created successfully!', 'success');
      }
      setIsFormOpen(false);
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
      toast('Category activation toggled!', 'success');
    } catch {
      toast('Failed to toggle category status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This operation is permanent.')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      toast('Category deleted successfully!', 'success');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { message?: string } } }).response?.data;
        toast(responseData?.message || 'Cannot delete category that contains products', 'error');
      } else {
        toast('Cannot delete category that contains products', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Define product taxonomies, organize catalog filters, and specify sorting rankings.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-1.5 self-start sm:self-center font-bold text-xs h-9">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Control Filters Block */}
      <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap flex-1 gap-3 max-w-xl">
            {/* Search */}
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filter categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-transparent"
              />
            </div>
            {/* Status Selector */}
            <div className="w-40">
              <Select
                value={statusFilter}
                onChange={(val: string) => setStatusFilter(val as 'all' | 'active' | 'draft')}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Inactive' },
                ]}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-450 dark:text-slate-400">
            Total {categories.length} taxonomy nodes defined
          </div>
        </CardContent>
      </Card>

      {/* Table grid block */}
      <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Category Detail</th>
                  <th className="p-4">SEO Slug</th>
                  <th className="p-4 text-center">Sort Order</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categoriesLoading ? (
                  [1, 2, 3].map((n) => (
                    <tr key={n}>
                      <td colSpan={5} className="p-6 text-center">
                        <div className="h-5 animate-pulse bg-slate-100 dark:bg-slate-800 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-slate-500">
                      <FolderTree className="h-10 w-10 text-indigo-500 mx-auto opacity-70 mb-3" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">No Categories Created</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">Create categories to structure and filter catalog items.</p>
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="h-9 w-9 overflow-hidden rounded bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm flex items-center justify-center" title="Thumbnail Image">
                              {c.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={c.imageUrl} alt="" className="object-cover h-full w-full" />
                              ) : (
                                '📁'
                              )}
                            </div>
                            <div className="h-9 w-9 overflow-hidden rounded bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-sm flex items-center justify-center" title="Master Category Sheet Image">
                              {c.masterImageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={c.masterImageUrl} alt="" className="object-cover h-full w-full" />
                              ) : (
                                '🖼️'
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="font-bold text-slate-905 dark:text-slate-100 block text-xs">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 max-w-sm truncate">
                              {c.description || 'No description provided.'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-500">
                        {c.slug}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                        {c.sortOrder}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(c.id, c.isActive)}
                          className="focus:outline-none"
                        >
                          <Badge variant={c.isActive ? 'success' : 'warning'} className="text-[9px] font-extrabold py-0.5 px-2">
                            {c.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(c)}
                          className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE / EDIT DIALOG FORM MODAL */}
      <Dialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            {editCategory ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
          <DialogDescription>
            {editCategory ? 'Modify properties below. Slugs are fixed for routing consistency.' : 'Define settings to add a new category node in the catalog filters.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Category Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category Name *</label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Leather Accessories"
              required
            />
          </div>

          {/* SEO Slug */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO Slug *</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. leather-accessories"
              disabled={!!editCategory}
              required
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sort Display Order</label>
            <Input
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Image URL</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          {/* Master Category Image Upload */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Master Category Image Sheet</label>
            <div className="flex gap-2 items-center">
              <Input
                value={masterImageUrl}
                onChange={(e) => setMasterImageUrl(e.target.value)}
                placeholder="Upload or enter sheet image URL..."
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                className="relative shrink-0 text-xs h-9 font-semibold"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
            </div>
            {masterImageUrl && (
              <div className="mt-2 relative h-20 w-32 border border-slate-200 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={masterImageUrl} alt="Master Sheet Preview" className="object-cover h-full w-full" />
                <button
                  type="button"
                  onClick={() => setMasterImageUrl('')}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 text-[8px] font-bold h-4 w-4 flex items-center justify-center shadow"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the type of goods in this category..."
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 min-h-[90px]"
            />
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4 dark:border-slate-800/40">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="text-xs">
              {editCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
