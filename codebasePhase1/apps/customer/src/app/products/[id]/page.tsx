'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Button, useToast, Input, Card, CardHeader, CardTitle } from '@merko/ui';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useWishlist } from '@/hooks/useWishlist';
import { apiClient } from '@/lib/api-client';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Palette, 
  ChevronRight, 
  Check, 
  Heart, 
  Shield, 
  RotateCcw, 
  Truck,
  Star,
  Type,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SavedDraft {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName: string;
  name: string;
  fileUrl: string;
  fileType: string;
  config: {
    uploadedImageUrl: string | null;
    uploadedImageScale: number;
    uploadedImageOffset: { x: number; y: number };
    textElements: {
      id: string;
      text: string;
      x: number;
      y: number;
      fontSize: number;
      textColor: string;
      fontFamily: string;
      alignment: 'left' | 'center' | 'right';
    }[];
    selectedShape: 'square' | 'rounded' | 'circle';
  };
  createdAt: string;
}

const COLOR_PRESETS = [
  { name: 'Pitch Black', value: '#000000' },
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Slate Gray', value: '#475569' },
  { name: 'Crimson Red', value: '#DC2626' },
  { name: 'Orange Glow', value: '#EA580C' },
  { name: 'Gold Yellow', value: '#EAB308' },
  { name: 'Emerald Green', value: '#16A34A' },
  { name: 'Royal Blue', value: '#2563EB' },
  { name: 'Royal Purple', value: '#9333EA' },
  { name: 'Pink Glow', value: '#DB2777' },
];

const FONT_OPTIONS = [
  { name: 'Outfit', value: 'Outfit' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Impact', value: 'Impact' },
  { name: 'Courier New', value: 'Courier New' },
];

import { useLanguage } from '@/contexts/language-context';

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = React.use(params);
  const { toast } = useToast();
  const { addToCart, isAdding } = useCart();
  const { addProduct } = useRecentlyViewed();
  const { setCartDrawerOpen } = useUiStore();
  const { orders } = useOrders();
  const { language, t } = useLanguage();
  const { data: product, isLoading: productLoading, isError: productError } = useProduct(id);

  React.useEffect(() => {
    if (product?.id) {
      addProduct(product.id);
    }
  }, [product?.id, addProduct]);

  // States
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const { wishlistedIds, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = product?.id ? wishlistedIds.has(product.id) : false;
  const [uploading, setUploading] = React.useState(false);
  const [designFile, setDesignFile] = React.useState<{ url: string; name: string; type: string } | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  // Customization studio states
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [canvasShape, setCanvasShape] = React.useState<'square' | 'rounded' | 'circle'>('square');
  const [customImage, setCustomImage] = React.useState<string | null>(null);
  const [imageScale, setImageScale] = React.useState(100);
  const [imageOffset, setImageOffset] = React.useState({ x: 0, y: 0 });

  const [textElements, setTextElements] = React.useState<{
    id: string;
    text: string;
    x: number; // percentage (0-100) inside safe printable area
    y: number; // percentage (0-100) inside safe printable area
    fontSize: number; // px
    textColor: string;
    fontFamily: string;
    alignment: 'left' | 'center' | 'right';
  }[]>([]);
  const [selectedElementId, setSelectedElementId] = React.useState<string | null>(null); // "image" or text element id
  const [newTextVal, setNewTextVal] = React.useState('');
  const [activeStudioTab, setActiveStudioTab] = React.useState<'upload' | 'text' | 'shape'>('upload');

  // Save design modal states
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [designName, setDesignName] = React.useState('');
  const [isSavingDesign, setIsSavingDesign] = React.useState(false);

  // Drag states
  const [draggedElementId, setDraggedElementId] = React.useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = React.useState({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = React.useState({ x: 0, y: 0 });

  // Get search params for draft pre-loading
  const [searchParams, setSearchParams] = React.useState<URLSearchParams | null>(null);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search));
    }
  }, []);

  const draftId = searchParams?.get('draftId');

  // Load draft configuration if provided
  React.useEffect(() => {
    if (draftId && product?.id) {
      const authState = useAuthStore.getState();
      const userId = authState.user?.id || 'guest';
      const draftsStr = localStorage.getItem(`merko_saved_designs_${userId}`);
      if (draftsStr) {
        try {
          const drafts: SavedDraft[] = JSON.parse(draftsStr);
          const draft = drafts.find((d) => d.id === draftId);
          if (draft && draft.productId === product.id) {
            if (draft.variantId) {
              setSelectedVariantId(draft.variantId);
            }
            if (draft.config) {
              setCustomImage(draft.config.uploadedImageUrl || null);
              setImageScale(draft.config.uploadedImageScale ?? 100);
              setImageOffset(draft.config.uploadedImageOffset ?? { x: 0, y: 0 });
              setTextElements(draft.config.textElements ?? []);
              setCanvasShape(draft.config.selectedShape ?? 'square');
              setIsCustomizing(true);
            }
            toast(`Loaded saved draft: ${draft.name}`, 'info');
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [draftId, product?.id, searchParams]);

  // Set default variant once loaded
  React.useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product]);

  // Global mouse up / touch end drag cancel
  React.useEffect(() => {
    const handleUp = () => setDraggedElementId(null);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  // Handle Drag Move Action
  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedElementId) return;
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    
    if (draggedElementId === 'image') {
      setImageOffset({
        x: dragStartOffset.x + dx,
        y: dragStartOffset.y + dy
      });
    } else {
      const container = document.getElementById('printable-safe-area');
      if (container) {
        const rect = container.getBoundingClientRect();
        const pctDx = (dx / rect.width) * 100;
        const pctDy = (dy / rect.height) * 100;
        
        setTextElements(prev => prev.map(t => {
          if (t.id === draggedElementId) {
            return {
              ...t,
              x: Math.min(100, Math.max(0, dragStartOffset.x + pctDx)),
              y: Math.min(100, Math.max(0, dragStartOffset.y + pctDy))
            };
          }
          return t;
        }));
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!draggedElementId || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartPos.x;
    const dy = touch.clientY - dragStartPos.y;
    
    if (draggedElementId === 'image') {
      setImageOffset({
        x: dragStartOffset.x + dx,
        y: dragStartOffset.y + dy
      });
    } else {
      const container = document.getElementById('printable-safe-area');
      if (container) {
        const rect = container.getBoundingClientRect();
        const pctDx = (dx / rect.width) * 100;
        const pctDy = (dy / rect.height) * 100;
        
        setTextElements(prev => prev.map(t => {
          if (t.id === draggedElementId) {
            return {
              ...t,
              x: Math.min(100, Math.max(0, dragStartOffset.x + pctDx)),
              y: Math.min(100, Math.max(0, dragStartOffset.y + pctDy))
            };
          }
          return t;
        }));
      }
    }
  };

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => handleMouseMove(e);
    const handleTMove = (e: TouchEvent) => handleTouchMove(e);
    
    if (draggedElementId) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleTMove, { passive: false });
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTMove);
    };
  }, [draggedElementId, dragStartPos, dragStartOffset]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast('File size exceeds 10MB limit', 'error');
      return;
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'svg', 'ai', 'psd', 'webp'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      toast(`Unsupported file extension. Allowed: ${allowedExtensions.join(', ')}`, 'error');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const fileData = (event.target?.result as string).split(',')[1];
          const response = await apiClient.post('/upload', {
            fileName: file.name,
            fileType: file.type || `image/${extension}`,
            fileData,
          });
          const uploaded = response.data.data;
          
          if (isCustomizing) {
            setCustomImage(uploaded.fileUrl);
            setSelectedElementId('image');
            toast('Artwork added to canvas preview!', 'success');
          } else {
            setDesignFile({
              url: uploaded.fileUrl,
              name: uploaded.fileName,
              type: uploaded.fileType,
            });
            toast('Artwork uploaded successfully!', 'success');
          }
        } catch (err: unknown) {
          console.error(err);
          const errorPayload = err as { response?: { data?: { message?: string } } };
          const errMsg = errorPayload.response?.data?.message || 'Failed to upload artwork';
          toast(errMsg, 'error');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast('Failed to process file', 'error');
      setUploading(false);
    }
  };

  // Nudging coordinates positions controls
  const nudgeImage = (dir: 'up' | 'down' | 'left' | 'right') => {
    const step = 5;
    setImageOffset(prev => {
      switch(dir) {
        case 'up': return { ...prev, y: prev.y - step };
        case 'down': return { ...prev, y: prev.y + step };
        case 'left': return { ...prev, x: prev.x - step };
        case 'right': return { ...prev, x: prev.x + step };
      }
    });
  };

  const nudgeText = (id: string, dir: 'up' | 'down' | 'left' | 'right') => {
    const step = 1;
    setTextElements(prev => prev.map(t => {
      if (t.id === id) {
        switch(dir) {
          case 'up': return { ...t, y: Math.max(0, t.y - step) };
          case 'down': return { ...t, y: Math.min(100, t.y + step) };
          case 'left': return { ...t, x: Math.max(0, t.x - step) };
          case 'right': return { ...t, x: Math.min(100, t.x + step) };
        }
      }
      return t;
    }));
  };

  // Canvas drawing mockup compiler
  const generateMergedMockupUrl = (): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        const bgImg = new window.Image();
        bgImg.crossOrigin = 'anonymous';

        bgImg.onload = async () => {
          ctx.drawImage(bgImg, 0, 0, 1000, 1000);

          const areaSize = 400;
          const areaX = 300;
          const areaY = 300;

          ctx.save();

          if (canvasShape === 'circle') {
            ctx.beginPath();
            ctx.arc(areaX + areaSize/2, areaY + areaSize/2, areaSize/2, 0, Math.PI * 2);
            ctx.clip();
          } else if (canvasShape === 'rounded') {
            ctx.beginPath();
            const radius = 40;
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(areaX, areaY, areaSize, areaSize, radius);
            } else {
              ctx.rect(areaX, areaY, areaSize, areaSize);
            }
            ctx.clip();
          } else {
            ctx.beginPath();
            ctx.rect(areaX, areaY, areaSize, areaSize);
            ctx.clip();
          }

          if (customImage) {
            const customImg = new window.Image();
            customImg.crossOrigin = 'anonymous';

            await new Promise((res) => {
              customImg.onload = res;
              customImg.onerror = res;
              customImg.src = customImage;
            });

            if (customImg.complete && customImg.naturalWidth > 0) {
              const w = areaSize * (imageScale / 100);
              const h = areaSize * (imageScale / 100);
              const x = areaX + areaSize/2 - w/2 + imageOffset.x * (areaSize / 320);
              const y = areaY + areaSize/2 - h/2 + imageOffset.y * (areaSize / 320);
              ctx.drawImage(customImg, x, y, w, h);
            }
          }

          ctx.restore();

          textElements.forEach((el) => {
            ctx.font = `bold ${el.fontSize * 1.5}px ${el.fontFamily}, sans-serif`;
            ctx.fillStyle = el.textColor;
            ctx.textAlign = el.alignment;

            const textX = areaX + (el.x / 100) * areaSize;
            const textY = areaY + (el.y / 100) * areaSize;

            ctx.fillText(el.text, textX, textY);
          });

          try {
            const dataUrl = canvas.toDataURL('image/png');
            const base64Data = dataUrl.split(',')[1];
            const response = await apiClient.post('/upload', {
              fileName: `mockup-custom-${Date.now()}.png`,
              fileType: 'image/png',
              fileData: base64Data,
            });
            resolve(response.data.data.fileUrl);
          } catch (uploadErr) {
            console.error('Canvas compilation upload failed', uploadErr);
            resolve(canvas.toDataURL('image/png'));
          }
        };

        bgImg.onerror = () => {
          console.error('Error loading background mockup template');
          resolve(null);
        };

        bgImg.src = activeImage;
      } catch (err) {
        console.error(err);
        resolve(null);
      }
    });
  };

  const handleReset = () => {
    setCustomImage(null);
    setTextElements([]);
    setImageScale(100);
    setImageOffset({ x: 0, y: 0 });
    setCanvasShape('square');
    setSelectedElementId(null);
    toast('Design reset successfully.', 'info');
  };

  const handleSaveDesign = async () => {
    if (!product) return;
    const authState = useAuthStore.getState();
    if (!authState.isAuthenticated) {
      toast('Please sign in to save your custom designs.', 'error');
      return;
    }

    if (!designName.trim()) {
      toast('Please enter a custom name for your design.', 'error');
      return;
    }

    setIsSavingDesign(true);
    try {
      const mergedUrl = await generateMergedMockupUrl();
      if (!mergedUrl) {
        toast('Failed to render preview mockup.', 'error');
        setIsSavingDesign(false);
        return;
      }

      const newDraft = {
        id: draftId || `saved-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        variantId: selectedVariantId,
        variantName: activeVariant?.name || 'Standard',
        name: designName.trim(),
        fileUrl: mergedUrl,
        fileType: 'image/png',
        config: {
          uploadedImageUrl: customImage,
          uploadedImageScale: imageScale,
          uploadedImageOffset: imageOffset,
          textElements,
          selectedShape: canvasShape,
        },
        createdAt: new Date().toISOString(),
      };

      const userId = authState.user?.id || 'guest';
      const draftsStr = localStorage.getItem(`merko_saved_designs_${userId}`);
      let drafts: SavedDraft[] = [];
      if (draftsStr) {
        try {
          drafts = JSON.parse(draftsStr);
        } catch {
          drafts = [];
        }
      }

      const existingIndex = drafts.findIndex((d) => d.id === newDraft.id);
      if (existingIndex > -1) {
        drafts[existingIndex] = newDraft;
      } else {
        drafts.unshift(newDraft);
      }

      localStorage.setItem(`merko_saved_designs_${userId}`, JSON.stringify(drafts));
      toast(`Design "${designName}" saved successfully to Saved Designs library!`, 'success');
      setShowSaveModal(false);
    } catch (err) {
      console.error(err);
      toast('Failed to save design draft.', 'error');
    } finally {
      setIsSavingDesign(false);
    }
  };

  const handleCustomAddToCart = async () => {
    if (!product || !selectedVariantId) return;
    setUploading(true);
    try {
      toast('Compiling final print mockup...', 'info');
      const mergedUrl = await generateMergedMockupUrl();
      if (!mergedUrl) {
        toast('Failed to render mockup configuration.', 'error');
        setUploading(false);
        return;
      }

      await addToCart({
        productVariantId: selectedVariantId,
        quantity,
        designFileUrl: mergedUrl,
        designFileName: `${product.name.replace(/\s+/g, '-').toLowerCase()}-studio-custom.png`,
        designFileType: 'image/png',
        mockupUrl: mergedUrl,
        designConfig: JSON.stringify({
          customerNotes: designName || 'No specific notes provided.'
        })
      });

      toast(`Added custom ${quantity}x ${product.name} to order!`, 'success');
      setCartDrawerOpen(true);
      setIsCustomizing(false);
    } catch (err) {
      console.error(err);
      toast('Failed to add custom product to cart.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Add text element to layers
  const addTextElement = () => {
    const content = newTextVal.trim() || 'Custom Text';
    const newEl = {
      id: `text-${Date.now()}`,
      text: content,
      x: 50,
      y: 50,
      fontSize: 22,
      textColor: '#EA580C',
      fontFamily: 'Outfit',
      alignment: 'center' as const
    };
    setTextElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
    setNewTextVal('');
  };

  // Query related products under the same category
  const categoryId = product?.categoryId;
  const { data: relatedData } = useProducts({
    categoryId,
    limit: 5,
  });

  const relatedProducts = (relatedData?.data || []).filter((p) => p.id !== id);

  if (productLoading) {
    return (
      <div className="space-y-8 py-8 animate-pulse bg-white text-slate-900 min-h-screen">
        <div className="h-5 w-48 rounded bg-slate-100" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square rounded-2xl bg-slate-100" />
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-xl bg-slate-100" />
              <div className="h-16 w-16 rounded-xl bg-slate-100" />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-6">
            <div className="h-4 w-1/4 rounded bg-slate-100" />
            <div className="h-8 w-3/4 rounded bg-slate-100" />
            <div className="h-6 w-1/3 rounded bg-slate-100" />
            <div className="h-20 w-full rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="py-20 text-center bg-white text-slate-900 min-h-screen">
        <div className="text-3xl">⚠️</div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Product Not Found</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
          The requested product does not exist, has been deleted, or the database is down.
        </p>
        <Button size="sm" className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9 px-4" asChild>
          <Link href="/products" className="flex items-center gap-1.5 justify-center">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Link>
        </Button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', imageUrl: product.category?.masterImageUrl || product.category?.imageUrl || 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600', altText: product.name }];

  const activeImage = images[activeImageIndex]?.imageUrl || images[0].imageUrl;
  const activeVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const currentPrice = activeVariant ? Number(activeVariant.price) : Number(product.basePrice);
  const currentStock = activeVariant ? activeVariant.stock : 0;

  // Rating and review generator
  const getRatingData = (prodId: string) => {
    const sum = prodId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = (4.4 + (sum % 7) * 0.1).toFixed(1);
    const count = 120 + (sum % 800);
    return { rating, count };
  };

  const { rating, count } = getRatingData(product.id);

  const handleAddToCart = async () => {
    if (!selectedVariantId) return;
    try {
      await addToCart({
        productVariantId: selectedVariantId,
        quantity,
        ...(designFile && {
          designFileUrl: designFile.url,
          designFileName: designFile.name,
          designFileType: designFile.type,
        }),
      });
      toast(`Added ${quantity}x ${product.name} to order!`, 'success');
      setCartDrawerOpen(true);
    } catch {
      toast('Failed to add item to cart. Please sign in or try again.', 'error');
    }
  };

  const handleWishlist = async () => {
    if (!product?.id) return;
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast(`Removed "${product.name}" from wishlist`, 'info');
      } else {
        await addToWishlist(product.id);
        toast(`Added "${product.name}" to wishlist`, 'success');
      }
    } catch {
      toast('Failed to update wishlist.', 'error');
    }
  };

  // ==========================================
  // CANVAS UI RENDER SUB-METHODS
  // ==========================================

  const renderLeftSidebar = () => {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="flex border-b border-slate-150 dark:border-slate-800">
          {(['upload', 'text', 'shape'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStudioTab(tab)}
              className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition ${
                activeStudioTab === tab 
                  ? 'border-orange-500 text-orange-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeStudioTab === 'upload' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Upload Logo/Graphics</h3>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
                  dragActive ? 'border-orange-500 bg-orange-50/10' : 'border-slate-200 hover:border-slate-350'
                }`}
              >
                <input
                  type="file"
                  id="canvas-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.svg,.ai,.psd,.webp"
                  disabled={uploading}
                />
                <label htmlFor="canvas-upload" className="cursor-pointer block space-y-2">
                  <Palette className="mx-auto h-8 w-8 text-orange-500" />
                  <div className="text-[11px] font-bold">Drag files here, or <span className="text-orange-500 underline">browse</span></div>
                  <div className="text-[9px] text-slate-400">PNG, SVG, JPG, WEBP (Max 10MB)</div>
                </label>
              </div>

              {customImage && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <img src={customImage} className="w-8 h-8 object-contain bg-white border rounded" alt="uploaded thumbnail" />
                    <span className="text-[10px] font-bold truncate max-w-[120px]">Active Design Overlay</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-red-500 hover:text-red-750 hover:bg-red-50/50"
                    onClick={() => { setCustomImage(null); if(selectedElementId==='image') setSelectedElementId(null); }}
                  >
                    Delete
                  </Button>
                </div>
              )}

              {/* Previously Ordered Designs Library */}
              {orders && orders.length > 0 && (() => {
                interface PreviousDesignItem {
                  id: string;
                  fileName: string;
                  fileUrl: string;
                  orderNumber: string;
                }
                const previousDesigns = orders.reduce<PreviousDesignItem[]>((acc, order) => {
                  if (order.designFiles && order.designFiles.length > 0) {
                    order.designFiles.forEach(df => {
                      if (!acc.some(x => x.fileUrl === df.fileUrl)) {
                        acc.push({
                          id: df.id,
                          fileName: df.fileName,
                          fileUrl: df.fileUrl,
                          orderNumber: order.orderNumber,
                        });
                      }
                    });
                  }
                  return acc;
                }, []);

                if (previousDesigns.length === 0) return null;

                return (
                  <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-850">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reuse Ordered Artworks</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {previousDesigns.map((design: PreviousDesignItem) => (
                        <button
                          key={design.id}
                          type="button"
                          className="relative aspect-square border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 p-1 hover:border-orange-500 transition group"
                          onClick={() => {
                            setCustomImage(design.fileUrl);
                            setSelectedElementId('image');
                            toast('Loaded artwork design from library!', 'success');
                          }}
                          title={`Reuse artwork from Order ${design.orderNumber}: ${design.fileName}`}
                        >
                          <img
                            src={design.fileUrl}
                            alt={design.fileName}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded">
                            <span className="text-[8px] font-bold text-white uppercase">Use</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Saved Drafts for this product */}
              {(() => {
                const authState = useAuthStore.getState();
                const userId = authState.user?.id || 'guest';
                const draftsStr = typeof window !== 'undefined' ? localStorage.getItem(`merko_saved_designs_${userId}`) : null;
                if (!draftsStr) return null;
                try {
                  const drafts: SavedDraft[] = JSON.parse(draftsStr);
                  const productDrafts = drafts.filter(d => d.productId === product?.id);
                  if (productDrafts.length === 0) return null;

                  return (
                    <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-850">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Load Saved Drafts</h4>
                      <div className="space-y-1.5">
                        {productDrafts.map((draft) => (
                          <div
                            key={draft.id}
                            className="flex items-center justify-between p-2 rounded-lg border border-slate-200/60 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 text-[10px]"
                          >
                            <span className="font-bold text-slate-700 dark:text-slate-350 truncate max-w-[120px]">{draft.name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[9px] font-bold border-orange-500 text-orange-500 hover:bg-orange-50"
                              onClick={() => {
                                if (draft.config) {
                                  setCustomImage(draft.config.uploadedImageUrl || null);
                                  setImageScale(draft.config.uploadedImageScale ?? 100);
                                  setImageOffset(draft.config.uploadedImageOffset ?? { x: 0, y: 0 });
                                  setTextElements(draft.config.textElements ?? []);
                                  setCanvasShape(draft.config.selectedShape ?? 'square');
                                  setIsCustomizing(true);
                                  toast(`Loaded saved draft: ${draft.name}`, 'info');
                                }
                              }}
                            >
                              Load
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch(e) {
                  return null;
                }
              })()}
            </div>
          )}

          {activeStudioTab === 'text' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Add Text Layer</h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter text..."
                  value={newTextVal}
                  onChange={(e) => setNewTextVal(e.target.value)}
                  className="text-xs h-9 flex-1"
                  onKeyDown={(e) => { if(e.key === 'Enter') addTextElement(); }}
                />
                <Button size="sm" onClick={addTextElement} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-9">
                  Add
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dynamic Layers</div>
                {textElements.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-slate-400">No text layers added yet.</div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {textElements.map(el => (
                      <div
                        key={el.id}
                        onClick={() => setSelectedElementId(el.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                          selectedElementId === el.id 
                            ? 'border-orange-500 bg-orange-50/20' 
                            : 'border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Type className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-bold truncate max-w-[140px]">{el.text}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextElements(prev => prev.filter(t => t.id !== el.id));
                            if (selectedElementId === el.id) setSelectedElementId(null);
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeStudioTab === 'shape' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Select Shape Mask</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['square', 'rounded', 'circle'] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setCanvasShape(shape)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                      canvasShape === shape 
                        ? 'border-orange-500 bg-orange-50/20 text-orange-600' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className={`w-8 h-8 bg-slate-350 ${
                      shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-lg' : 'rounded-none'
                    }`} />
                    <span className="text-[10px] font-bold capitalize">{shape}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                Applying a shape mask dynamically clips the printable artwork area, perfect for custom decals, mugs, stickers, or stamps.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRightSidebar = () => {
    if (!selectedElementId) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white dark:bg-slate-900">
          <Palette className="h-10 w-10 text-slate-200 dark:text-slate-800 mb-3" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Workspace Settings</h4>
          <p className="text-[10px] max-w-[200px] mt-1">Select an overlay layer (image or text) on the mockup canvas to style it here.</p>
        </div>
      );
    }

    if (selectedElementId === 'image') {
      return (
        <div className="p-4 space-y-5 bg-white dark:bg-slate-900 h-full text-slate-900 dark:text-slate-100">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Image Layer Properties</h3>
            <span className="text-[9px] font-bold text-orange-500">IMAGE OVERLAY ACTIVE</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Scale Overlay</span>
              <span>{imageScale}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              value={imageScale}
              onChange={(e) => setImageScale(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Position Nudge</span>
            <div className="grid grid-cols-3 gap-1.5 w-28 mx-auto">
              <div />
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => nudgeImage('up')}>▲</Button>
              <div />
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => nudgeImage('left')}>◀</Button>
              <div className="h-8 w-8 flex items-center justify-center text-[9px] font-bold text-slate-400">Move</div>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => nudgeImage('right')}>▶</Button>
              <div />
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => nudgeImage('down')}>▼</Button>
              <div />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-between gap-2">
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-500 hover:bg-red-50 text-xs h-9 font-bold"
              onClick={() => { setCustomImage(null); setSelectedElementId(null); }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Remove Image
            </Button>
          </div>
        </div>
      );
    }

    const textEl = textElements.find(t => t.id === selectedElementId);
    if (!textEl) return null;

    return (
      <div className="p-4 space-y-5 bg-white dark:bg-slate-900 h-full text-slate-900 dark:text-slate-100">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Text Layer Properties</h3>
          <span className="text-[9px] font-bold text-orange-500">TEXT OVERLAY ACTIVE</span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Edit Text Content</label>
          <Input
            type="text"
            value={textEl.text}
            onChange={(e) => {
              setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, text: e.target.value } : t));
            }}
            className="text-xs h-9"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Typography Font</label>
          <select
            value={textEl.fontFamily}
            onChange={(e) => {
              setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, fontFamily: e.target.value } : t));
            }}
            className="w-full text-xs h-9 rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"
          >
            {FONT_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>Font Size</span>
            <span>{textEl.fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="64"
            value={textEl.fontSize}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, fontSize: val } : t));
            }}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Text Alignment</label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map(align => (
              <Button
                key={align}
                variant={textEl.alignment === align ? 'default' : 'outline'}
                size="sm"
                className="flex-1 py-1 text-xs h-8"
                onClick={() => {
                  setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, alignment: align } : t));
                }}
              >
                {align === 'left' && <AlignLeft className="h-3.5 w-3.5" />}
                {align === 'center' && <AlignCenter className="h-3.5 w-3.5" />}
                {align === 'right' && <AlignRight className="h-3.5 w-3.5" />}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-sans">Font Color Swatches</label>
          <div className="grid grid-cols-5 gap-1.5">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, textColor: color.value } : t));
                }}
                className={`w-6 h-6 rounded-full border border-slate-300 transition-all ${
                  textEl.textColor === color.value ? 'scale-110 ring-2 ring-orange-500' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Custom Hex:</span>
            <input
              type="text"
              value={textEl.textColor}
              onChange={(e) => {
                setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, textColor: e.target.value } : t));
              }}
              className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded font-mono w-20"
            />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Position Nudge</span>
          <div className="grid grid-cols-3 gap-1.5 w-28 mx-auto">
            <div />
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => nudgeText(textEl.id, 'up')}>▲</Button>
            <div />
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => nudgeText(textEl.id, 'left')}>◀</Button>
            <div className="h-8 w-8 flex items-center justify-center text-[9px] font-bold text-slate-400">Move</div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => nudgeText(textEl.id, 'right')}>▶</Button>
            <div />
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => nudgeText(textEl.id, 'down')}>▼</Button>
            <div />
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-500 hover:bg-red-50 text-xs h-9 font-bold"
            onClick={() => {
              setTextElements(prev => prev.filter(t => t.id !== selectedElementId));
              setSelectedElementId(null);
            }}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Remove Element
          </Button>
        </div>
      </div>
    );
  };

  const renderInteractiveCanvas = () => {
    return (
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[380px] md:h-[380px] rounded-2xl border border-slate-200 bg-white shadow-xl flex items-center justify-center overflow-hidden dark:border-slate-800">
        <img
          src={activeImage}
          alt="product mockup canvas template"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        <div
          id="printable-safe-area"
          onClick={() => setSelectedElementId(null)}
          className={`absolute w-3/5 h-3/5 border border-dashed border-orange-500/50 flex items-center justify-center overflow-hidden transition-colors ${
            selectedElementId === null ? 'bg-orange-500/5' : 'bg-transparent'
          } ${
            canvasShape === 'circle' ? 'rounded-full' : canvasShape === 'rounded' ? 'rounded-2xl' : 'rounded-none'
          }`}
          style={{
            clipPath: canvasShape === 'circle' ? 'circle(50% at 50% 50%)' : 'none',
          }}
        >
          {customImage && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId('image');
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggedElementId('image');
                setDragStartPos({ x: e.clientX, y: e.clientY });
                setDragStartOffset({ x: imageOffset.x, y: imageOffset.y });
                setSelectedElementId('image');
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (e.touches.length > 0) {
                  setDraggedElementId('image');
                  setDragStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                  setDragStartOffset({ x: imageOffset.x, y: imageOffset.y });
                  setSelectedElementId('image');
                }
              }}
              style={{
                transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale / 100})`,
                cursor: 'move',
              }}
              className={`absolute max-w-[85%] max-h-[85%] transition-transform duration-75 select-none ${
                selectedElementId === 'image' ? 'ring-2 ring-orange-500 ring-offset-2 bg-slate-50/10' : ''
              }`}
            >
              <img
                src={customImage}
                alt="custom overlay"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          )}

          {textElements.map((el) => {
            const isSelected = selectedElementId === el.id;
            return (
              <div
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElementId(el.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedElementId(el.id);
                  setDragStartPos({ x: e.clientX, y: e.clientY });
                  setDragStartOffset({ x: el.x, y: el.y });
                  setSelectedElementId(el.id);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (e.touches.length > 0) {
                    setDraggedElementId(el.id);
                    setDragStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                    setDragStartOffset({ x: el.x, y: el.y });
                    setSelectedElementId(el.id);
                  }
                }}
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: el.fontFamily,
                  fontSize: `${el.fontSize}px`,
                  color: textElSelectedColor(el.id, el.textColor),
                  textAlign: el.alignment,
                  cursor: 'move',
                }}
                className={`absolute select-none whitespace-nowrap p-1 rounded font-black tracking-tight transition-transform duration-75 ${
                  isSelected ? 'ring-2 ring-orange-500 bg-white/80 dark:bg-slate-900/80 shadow-md scale-105' : 'hover:bg-white/20'
                }`}
              >
                {el.text}
              </div>
            );
          })}
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/65 backdrop-blur-xs px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest text-white uppercase pointer-events-none select-none">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
          Safe Print Zone
        </div>
      </div>
    );
  };

  const textElSelectedColor = (id: string, defaultColor: string) => {
    // If the element text is white and selected, make it readable on white preview background if selected
    return defaultColor;
  };

  const renderTabletControls = () => {
    return (
      <div className="flex h-full bg-white dark:bg-slate-900 border-t border-slate-200">
        <div className="w-48 border-r border-slate-100 flex flex-col p-3 gap-2 flex-shrink-0">
          {(['upload', 'text', 'shape'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeStudioTab === tab ? 'default' : 'ghost'}
              size="sm"
              className="justify-start text-xs h-9 capitalize"
              onClick={() => setActiveStudioTab(tab)}
            >
              {tab === 'upload' && <Palette className="mr-2 h-4 w-4" />}
              {tab === 'text' && <Type className="mr-2 h-4 w-4" />}
              {tab === 'shape' && <Sparkles className="mr-2 h-4 w-4" />}
              {tab} Settings
            </Button>
          ))}
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          {renderTabletActivePanel()}
        </div>
        <div className="w-64 border-l border-slate-100 p-4 flex flex-col justify-between flex-shrink-0 bg-slate-50/50">
          {renderRightSidebar()}
        </div>
      </div>
    );
  };

  const renderTabletActivePanel = () => {
    switch(activeStudioTab) {
      case 'upload':
        return (
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Tablet File Upload</h4>
            <div className="flex items-center gap-4">
              <label htmlFor="tablet-canvas-upload" className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center justify-center gap-1.5">
                <Palette className="h-4 w-4" /> Choose File
              </label>
              <input
                type="file"
                id="tablet-canvas-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.svg,.ai,.psd,.webp"
              />
              <span className="text-[10px] text-slate-450">PNG, SVG, JPG, WEBP (Max 10MB)</span>
            </div>
            {customImage && (
              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" /> Active Graphic layer loaded. Tap it to position.
              </div>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Tablet Text Overlay</h4>
            <div className="flex gap-2 max-w-sm">
              <Input
                type="text"
                placeholder="Enter text value..."
                value={newTextVal}
                onChange={(e) => setNewTextVal(e.target.value)}
                className="text-xs h-9 flex-grow"
              />
              <Button size="sm" onClick={addTextElement} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                Add Text
              </Button>
            </div>
          </div>
        );
      case 'shape':
        return (
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Tablet Shape Masks</h4>
            <div className="flex gap-3">
              {(['square', 'rounded', 'circle'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setCanvasShape(shape)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition ${
                    canvasShape === shape ? 'border-orange-500 bg-orange-50/20 text-orange-600' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  <div className={`w-4 h-4 bg-slate-350 ${
                    shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-xs' : 'rounded-none'
                  }`} />
                  <span className="text-xs font-bold capitalize">{shape}</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  const renderMobileControls = () => {
    return (
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200">
        <div className="flex justify-around items-center h-12 border-b border-slate-100">
          <button
            onClick={() => { setActiveStudioTab('upload'); setSelectedElementId(null); }}
            className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-black uppercase tracking-wide transition ${
              activeStudioTab === 'upload' ? 'text-orange-500 bg-slate-50/50' : 'text-slate-400'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => { setActiveStudioTab('text'); setSelectedElementId(null); }}
            className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-black uppercase tracking-wide transition ${
              activeStudioTab === 'text' ? 'text-orange-500 bg-slate-50/50' : 'text-slate-400'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => { setActiveStudioTab('shape'); setSelectedElementId(null); }}
            className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] font-black uppercase tracking-wide transition ${
              activeStudioTab === 'shape' ? 'text-orange-500 bg-slate-50/50' : 'text-slate-400'
            }`}
          >
            Shapes
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-48 overflow-y-auto">
          {selectedElementId ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Active Properties</span>
                <Button variant="ghost" size="sm" className="h-6 text-slate-400" onClick={() => setSelectedElementId(null)}>Close X</Button>
              </div>
              
              {selectedElementId === 'image' ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold block">Scale: {imageScale}%</span>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={imageScale}
                      onChange={(e) => setImageScale(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-500 hover:bg-red-50 text-[10px] h-8 px-2"
                    onClick={() => { setCustomImage(null); setSelectedElementId(null); }}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={textElements.find(t => t.id === selectedElementId)?.text || ''}
                      onChange={(e) => {
                        setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, text: e.target.value } : t));
                      }}
                      className="text-xs h-8 flex-1"
                    />
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-500 text-[10px] h-8 px-2"
                      onClick={() => {
                        setTextElements(prev => prev.filter(t => t.id !== selectedElementId));
                        setSelectedElementId(null);
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={textElements.find(t => t.id === selectedElementId)?.fontFamily || 'Outfit'}
                      onChange={(e) => {
                        setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, fontFamily: e.target.value } : t));
                      }}
                      className="text-[10px] h-8 rounded border border-slate-200 bg-white px-2"
                    >
                      {FONT_OPTIONS.map(f => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                      ))}
                    </select>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={textElements.find(t => t.id === selectedElementId)?.fontSize || 18}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setTextElements(prev => prev.map(t => t.id === selectedElementId ? { ...t, fontSize: val } : t));
                      }}
                      className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer self-center"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {activeStudioTab === 'upload' && (
                <div className="flex items-center gap-3">
                  <label htmlFor="mobile-canvas-upload" className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-8 px-3 rounded flex items-center justify-center">
                    Upload Graphic
                  </label>
                  <input
                    type="file"
                    id="mobile-canvas-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf,.svg,.ai,.psd,.webp"
                  />
                  <span className="text-[9px] text-slate-400">PNG, SVG, JPG, WEBP (Max 10MB)</span>
                </div>
              )}

              {activeStudioTab === 'text' && (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter text overlay value..."
                    value={newTextVal}
                    onChange={(e) => setNewTextVal(e.target.value)}
                    className="text-xs h-8 flex-1"
                  />
                  <Button size="sm" onClick={addTextElement} className="bg-orange-500 text-white h-8 text-[11px] font-bold">
                    Add Text
                  </Button>
                </div>
              )}

              {activeStudioTab === 'shape' && (
                <div className="flex gap-2 justify-around">
                  {(['square', 'rounded', 'circle'] as const).map((shape) => (
                    <Button
                      key={shape}
                      variant={canvasShape === shape ? 'default' : 'outline'}
                      size="sm"
                      className="text-[10px] capitalize flex-1 h-8"
                      onClick={() => setCanvasShape(shape)}
                    >
                      {shape}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSaveModal = () => {
    if (!showSaveModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <Card className="w-full max-w-sm border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 p-6 space-y-4">
          <CardHeader className="p-0 pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-black uppercase tracking-wider">Save Design Configuration</CardTitle>
          </CardHeader>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Design Title</label>
            <Input
              type="text"
              placeholder="My Custom Sticker, etc."
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="text-xs h-9"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveModal(false)}
              className="text-xs h-8"
              disabled={isSavingDesign}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveDesign}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 font-bold"
              disabled={isSavingDesign}
            >
              {isSavingDesign ? 'Saving...' : 'Save design'}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // ==========================================
  // CUSTOMIZER INTERFACE TOGGLE RENDER
  // ==========================================

  if (isCustomizing) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 font-sans">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCustomizing(false)} className="text-xs h-8">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Exit Studio
            </Button>
            <span className="text-slate-200">|</span>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-md">
              {product.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-8 text-slate-500 hover:text-slate-700">
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setDesignName(`${product.name} Custom`); setShowSaveModal(true); }} className="text-xs h-8 font-semibold">
              Save Design
            </Button>
            <Button size="sm" onClick={handleCustomAddToCart} disabled={uploading || isAdding} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 font-black">
              {uploading ? 'Processing...' : 'Add to Cart'}
            </Button>
          </div>
        </header>

        {/* Desktop Viewport Layout */}
        <div className="hidden lg:flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
          <aside className="w-80 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col flex-shrink-0 overflow-y-auto">
            {renderLeftSidebar()}
          </aside>
          
          <main className="flex-1 bg-slate-100 dark:bg-slate-950/80 p-8 flex items-center justify-center overflow-auto relative">
            {renderInteractiveCanvas()}
          </main>

          <aside className="w-80 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col flex-shrink-0 overflow-y-auto">
            {renderRightSidebar()}
          </aside>
        </div>

        {/* Tablet Viewport Layout */}
        <div className="hidden md:flex lg:hidden flex-col flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
          <div className="bg-slate-100 flex-1 flex items-center justify-center p-6 overflow-auto">
            {renderInteractiveCanvas()}
          </div>
          <div className="h-64 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col flex-shrink-0">
            {renderTabletControls()}
          </div>
        </div>

        {/* Mobile Viewport Layout */}
        <div className="flex md:hidden flex-col flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
          <div className="flex items-center justify-between bg-white px-4 py-2 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex-shrink-0">
            <div>
              <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">{activeVariant?.name || 'Standard'}</span>
              <div className="text-xs font-black">₹{currentPrice.toFixed(0)}</div>
            </div>
            <span className="text-[9px] font-medium text-slate-400">Drag items to position</span>
          </div>
          <div className="flex-1 bg-slate-100 dark:bg-slate-950/80 flex items-center justify-center p-4 overflow-auto">
            {renderInteractiveCanvas()}
          </div>
          <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col flex-shrink-0">
            {renderMobileControls()}
          </div>
        </div>
        
        {renderSaveModal()}
      </div>
    );
  }

  // ==========================================
  // NORMAL CATALOG DETAIL PAGE RENDER
  // ==========================================

  return (
    <div className="space-y-8 py-4 bg-white text-slate-900 min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link href="/" className="hover:text-orange-500 transition">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link href="/products" className="hover:text-orange-500 transition">Catalog</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-slate-600 dark:text-slate-300 line-clamp-1">{product.name}</span>
      </nav>

      {/* Main product specs section */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Side: Product Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative h-full w-full"
              >
                {(() => {
                  let cropStyle: React.CSSProperties = {};
                  if (product.cropConfig) {
                    try {
                      const crop = JSON.parse(product.cropConfig);
                      const width = crop.width || 100;
                      const height = crop.height || 100;
                      const left = crop.left || 0;
                      const top = crop.top || 0;
                      const scaleX = 100 / width;
                      const scaleY = 100 / height;
                      cropStyle = {
                        width: `${scaleX * 100}%`,
                        height: `${scaleY * 100}%`,
                        left: `${-left * scaleX}%`,
                        top: `${-top * scaleY}%`,
                        maxWidth: 'none',
                        position: 'absolute'
                      };
                    } catch (e) {}
                  }
                  return (
                    <div
                      className="absolute inset-0"
                      style={Object.keys(cropStyle).length > 0 ? cropStyle : undefined}
                    >
                      <Image
                        src={activeImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
            <div className="absolute top-4 left-4">
              <Badge className="bg-orange-500 text-white font-black text-[9px] tracking-widest px-2.5 py-0.5 rounded-full border-none">
                PREMIUM BLANK
              </Badge>
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    activeImageIndex === idx
                      ? 'border-orange-500 shadow-sm'
                      : 'border-slate-100 opacity-70 hover:opacity-100'
                  }`}
                >
                  {(() => {
                    let cropStyle: React.CSSProperties = {};
                    if (product.cropConfig) {
                      try {
                        const crop = JSON.parse(product.cropConfig);
                        const width = crop.width || 100;
                        const height = crop.height || 100;
                        const left = crop.left || 0;
                        const top = crop.top || 0;
                        const scaleX = 100 / width;
                        const scaleY = 100 / height;
                        cropStyle = {
                          width: `${scaleX * 100}%`,
                          height: `${scaleY * 100}%`,
                          left: `${-left * scaleX}%`,
                          top: `${-top * scaleY}%`,
                          maxWidth: 'none',
                          position: 'absolute'
                        };
                      } catch (e) {}
                    }
                    return (
                      <div
                        className="absolute inset-0"
                        style={Object.keys(cropStyle).length > 0 ? cropStyle : undefined}
                      >
                        <Image
                          src={img.imageUrl}
                          alt={img.altText || `thumbnail ${idx}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    );
                  })()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Action Panel */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-1.5">
            <Badge className="bg-orange-50 text-orange-600 dark:bg-orange-950/20 font-bold border-none text-[9px] tracking-wider rounded px-2 py-0.5">
              {product.category?.name || 'CUSTOM MERCHANDISE'}
            </Badge>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
              <span className="text-slate-400 font-medium">({count} reviews)</span>
            </div>

            <p className="text-lg font-black text-slate-900 dark:text-white pt-1">
              ₹{currentPrice.toFixed(0)}
              <span className="text-[10px] text-slate-450 font-medium ml-1">/unit</span>
            </p>
          </div>

          {/* Description & Specifications */}
          <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/40">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description</h3>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {product.description || product.shortDescription}
              </p>
            </div>
            
            {/* Specifications list */}
            {(product.material || product.thickness || product.finish || product.printingMethod || product.printingType || product.waterResistant !== undefined || product.customizationSupport) && (
              <div className="space-y-2 pt-2 border-t border-slate-100/50 dark:border-slate-800/20">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                  {product.material && (
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Material</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{product.material}</span>
                    </div>
                  )}
                  {product.thickness && (
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Thickness</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{product.thickness}</span>
                    </div>
                  )}
                  {product.finish && (
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Finish</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{product.finish}</span>
                    </div>
                  )}
                  {product.printingMethod && (
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Printing Method</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{product.printingMethod}</span>
                    </div>
                  )}
                  {product.printingType && (
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Printing Type</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{product.printingType}</span>
                    </div>
                  )}
                  {product.waterResistant !== undefined && (
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Water Resistant</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{product.waterResistant ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {product.customizationSupport && (
                    <div className="flex justify-between border-b border-slate-50 pb-1 sm:col-span-2">
                      <span className="text-slate-400">Customization Support</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{product.customizationSupport}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Option Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5 border-t border-slate-100 pt-4 dark:border-slate-800/40">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">{language === 'hi' ? 'विकल्प चुनें' : 'Select Option'}</h3>
                {activeVariant && (
                  <span className={`text-[10px] font-bold ${activeVariant.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {activeVariant.stock > 0 
                      ? (language === 'hi' ? `स्टॉक में (${activeVariant.stock} शेष)` : `In Stock (${activeVariant.stock} left)`)
                      : (language === 'hi' ? 'स्टॉक में नहीं' : 'Out of Stock')
                    }
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      selectedVariantId === v.id
                        ? 'border-orange-500 bg-orange-50/40 text-orange-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {selectedVariantId === v.id && <Check className="h-3.5 w-3.5 text-orange-600" />}
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Canvas Studio Launch Button */}
          {product.customizationAvailable && (
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800/40">
              <Button
                onClick={() => setIsCustomizing(true)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-xs h-12 shadow-md flex items-center justify-center gap-2 tracking-wide uppercase"
              >
                <Palette className="h-4.5 w-4.5 text-slate-900" /> {language === 'hi' ? 'कस्टमाइज़ेशन शुरू करें' : 'Start Customization'}
              </Button>
            </div>
          )}

          {/* Design / Artwork Upload section */}
          {product.customizationAvailable && (
            <div className="space-y-2.5 border-t border-slate-100 pt-4 dark:border-slate-800/40">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">{language === 'hi' ? 'या तैयार डिज़ाइन अपलोड करें' : 'Or Upload Finished Design'}</h3>
                <span className="text-[9px] text-slate-400">PDF, SVG, PNG, JPG, AI (Max 10MB)</span>
              </div>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-orange-500 bg-orange-50/15 shadow-inner scale-[0.98]'
                    : designFile
                    ? 'border-emerald-500 bg-emerald-50/10'
                    : 'border-slate-250 bg-slate-50/30 hover:border-slate-350'
                }`}
              >
                <input
                  type="file"
                  id="artwork-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.svg,.ai,.psd"
                  disabled={uploading}
                />
                
                {uploading ? (
                  <div className="space-y-1.5">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                    <p className="text-[11px] font-bold text-slate-500">{language === 'hi' ? 'आपका आर्टवर्क अपलोड हो रहा है...' : 'Uploading your artwork...'}</p>
                  </div>
                ) : designFile ? (
                  <div className="space-y-2 w-full">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[280px] mx-auto">
                        {designFile.name}
                      </p>
                      <p className="text-[10px] text-slate-450 font-medium">
                        {language === 'hi' ? 'आर्टवर्क सफलतापूर्वक लिंक हो गया।' : 'Artwork linked successfully.'}
                      </p>
                    </div>
                    <div className="flex justify-center gap-2 text-[10px] font-bold">
                      <label htmlFor="artwork-upload" className="cursor-pointer text-orange-500 hover:text-orange-600">
                        {language === 'hi' ? 'फ़ाइल बदलें' : 'Replace File'}
                      </label>
                      <span className="text-slate-200">|</span>
                      <button type="button" onClick={() => setDesignFile(null)} className="text-red-500 hover:text-red-650">
                        {language === 'hi' ? 'हटाएं' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="artwork-upload"
                    className="group cursor-pointer flex flex-col items-center justify-center space-y-1.5 w-full h-full"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm transition group-hover:scale-105">
                      <Palette className="h-4.5 w-4.5 text-orange-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-700">
                        {language === 'hi' ? 'यहाँ आर्टवर्क खींचें और छोड़ें, या ' : 'Drag & drop artwork here, or '}<span className="text-orange-500 underline group-hover:no-underline">{language === 'hi' ? 'ब्राउज़ करें' : 'browse'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {language === 'hi' ? 'तैयार AI/SVG, PDF, PNG या JPG फाइलें' : 'Ready to print AI/SVG, PDF, PNG or JPG files'}
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Quantity stepper and Primary actions */}
          <div className="flex flex-wrap gap-3 items-center border-t border-slate-100 pt-4 dark:border-slate-800/40">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 text-md font-bold hover:bg-slate-100 rounded"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-8 w-8 text-md font-bold hover:bg-slate-100 rounded"
              >
                +
              </button>
            </div>

            {/* CTA buttons */}
            <div className="flex-1 flex gap-2">
              <Button
                onClick={handleAddToCart}
                disabled={currentStock === 0 || isAdding}
                className={`flex-1 flex items-center justify-center gap-1.5 ${currentStock === 0 ? 'bg-slate-100 text-slate-450 hover:bg-slate-100 border-none cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' : 'bg-orange-500 hover:bg-orange-600 text-white'} font-bold text-xs h-10 shadow-sm`}
              >
                <ShoppingBag className="h-4 w-4" /> {isAdding ? (language === 'hi' ? 'जोड़ा जा रहा है...' : 'Adding...') : currentStock === 0 ? (language === 'hi' ? 'बिक गया' : 'Sold Out') : (language === 'hi' ? 'ऑर्डर में जोड़ें' : 'Add to Order')}
              </Button>
              <Button
                variant="outline"
                className={`p-2.5 h-10 w-10 shrink-0 ${isWishlisted ? 'text-red-500 border-red-200 bg-red-50/20' : 'text-slate-450 border-slate-200 hover:bg-slate-50'}`}
                onClick={handleWishlist}
              >
                <Heart className="h-4.5 w-4.5 fill-current" />
              </Button>
            </div>
          </div>

          {/* Brand Guarantee Checklist */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400">
            <div className="space-y-1">
              <Truck className="mx-auto h-4 w-4 text-orange-500" />
              <div className="font-bold text-slate-700">{language === 'hi' ? 'तेज़ शिपिंग' : 'Fast Shipping'}</div>
              <div>{language === 'hi' ? '48 घंटे में प्रेषित' : 'Dispatched 48h'}</div>
            </div>
            <div className="space-y-1">
              <Shield className="mx-auto h-4 w-4 text-orange-500" />
              <div className="font-bold text-slate-700">{language === 'hi' ? 'प्रीमियम ब्लैंक्स' : 'Premium Blanks'}</div>
              <div>{language === 'hi' ? 'गुणवत्ता सुनिश्चित' : 'QA Guaranteed'}</div>
            </div>
            <div className="space-y-1">
              <RotateCcw className="mx-auto h-4 w-4 text-orange-500" />
              <div className="font-bold text-slate-700">{language === 'hi' ? 'आसान पुन: सबमिशन' : 'Easy Resubmit'}</div>
              <div>{language === 'hi' ? 'मुफ्त प्रूफिंग लेआउट' : 'Free proofing layout'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 border-t border-slate-100 pt-8 dark:border-slate-800/40">
          <div>
            <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/10 font-bold border-none text-[9px] tracking-wide rounded-full px-2 py-0.5">
              {language === 'hi' ? 'बंडल पूरा करें' : 'Complete the bundle'}
            </Badge>
            <h2 className="mt-1 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'hi' ? 'संबंधित उत्पाद' : 'Related Products'}
            </h2>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((rp) => {
              const rpImage = rp.images?.[0]?.imageUrl || rp.category?.masterImageUrl || rp.category?.imageUrl || 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400';
              const { rating: rpRating, count: rpCount } = getRatingData(rp.id);
              
              let rpBadgeText = 'NEW';
              if (rp.category?.slug.includes('creative')) rpBadgeText = 'POPULAR';
              else if (rp.category?.slug.includes('modern')) rpBadgeText = 'BEST SELLER';

              // Parse crop config for related product
              let rpCropStyle: React.CSSProperties = {};
              if (rp.cropConfig) {
                try {
                  const crop = JSON.parse(rp.cropConfig);
                  const width = crop.width || 100;
                  const height = crop.height || 100;
                  const left = crop.left || 0;
                  const top = crop.top || 0;
                  const scaleX = 100 / width;
                  const scaleY = 100 / height;
                  rpCropStyle = {
                    width: `${scaleX * 100}%`,
                    height: `${scaleY * 100}%`,
                    left: `${-left * scaleX}%`,
                    top: `${-top * scaleY}%`,
                    maxWidth: 'none',
                    position: 'absolute'
                  };
                } catch (e) {}
              }

              return (
                <div 
                  key={rp.id} 
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div
                      className="absolute inset-0"
                      style={Object.keys(rpCropStyle).length > 0 ? rpCropStyle : undefined}
                    >
                      <Image
                        src={rpImage}
                        alt={rp.name}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        sizes="220px"
                      />
                    </div>
                    <div className="absolute left-2.5 top-2.5">
                      <Badge className="bg-orange-500 text-white font-black text-[8px] tracking-widest px-2 py-0.5 rounded-full border-none">
                        {rpBadgeText}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 flex flex-1 flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-orange-500">
                        {rp.category?.name || 'CUSTOM BLANKS'}
                      </span>
                      <h4 className="font-bold text-xs text-slate-850 dark:text-white line-clamp-1 group-hover:text-orange-500 transition mt-0.5">
                        <Link href={`/products/${rp.id}`}>{rp.name}</Link>
                      </h4>
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-slate-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{rpRating}</span>
                        <span className="text-slate-400 font-medium">({rpCount})</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        ₹{Number(rp.basePrice).toFixed(0)}
                        <span className="text-[8px] text-slate-400 font-medium ml-0.5">/unit</span>
                      </span>
                      <Button size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 font-bold text-[10px] h-7 px-2.5" asChild>
                        <Link href={`/products/${rp.id}`}>Configure</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
