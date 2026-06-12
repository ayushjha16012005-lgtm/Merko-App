import { z } from 'zod';

// Category Validation Schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  masterImageUrl: z.string().optional(),
  masterImage1: z.string().optional(),
  masterImage2: z.string().optional(),
  masterImage3: z.string().optional(),
  masterImage4: z.string().optional(),
  masterImage5: z.string().optional(),
  masterImage6: z.string().optional(),
  masterImage7: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Product Variant nested schema
export const productVariantInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  stock: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// Product Image nested schema
export const productImageInputSchema = z.object({
  id: z.string().uuid().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  altText: z.string().optional(),
  sortOrder: z.number().int().optional().default(0),
});

// Product Validation Schemas
export const createProductSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  shortDescription: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  basePrice: z.number().min(0, 'Price must be non-negative'),
  images: z.array(productImageInputSchema).optional(),
  variants: z.array(productVariantInputSchema).optional(),
  cropConfig: z.string().optional(),
  discountType: z.enum(['NONE', 'PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().min(0).optional(),
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  image4: z.string().optional(),
  image5: z.string().optional(),
  image6: z.string().optional(),
  image7: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Product Variant Validation Schemas
export const createProductVariantSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  name: z.string().min(1).max(100),
  sku: z.string().min(1).max(100).regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
  price: z.number().min(0, 'Price must be non-negative'),
  stock: z.number().int().min(0).optional(),
});

export const updateProductVariantSchema = createProductVariantSchema.partial();

export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;

const coerceInt = z.preprocess((val) => {
  if (val === undefined || val === null || val === '') return undefined;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? undefined : num;
}, z.number().int().optional());

const coerceBoolean = z.preprocess((val) => {
  if (val === 'true' || val === '1') return true;
  if (val === 'false' || val === '0') return false;
  return undefined;
}, z.boolean().optional());

// Pagination Query Schema
export const paginationSchema = z.object({
  page: coerceInt.transform(val => val ?? 1).default(1),
  limit: coerceInt.transform(val => val ?? 20).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Category Search Query
export const categoriesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  isActive: coerceBoolean,
});

export type CategoriesQueryInput = z.infer<typeof categoriesQuerySchema>;

// Product Search Query
export const productsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: coerceBoolean,
  minPrice: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  maxPrice: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
});

export type ProductsQueryInput = z.infer<typeof productsQuerySchema>;

// Authentication Validation Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional().or(z.literal('')),
  role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional().or(z.literal('')),
});

// Address Validation Schemas
export const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  addressLine1: z.string().min(3, 'Address Line 1 must be at least 3 characters'),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional().default(false),
});

// Cart Validation Schemas
export const addToCartSchema = z.object({
  productVariantId: z.string().uuid('Invalid product variant ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  designFileUrl: z.string().url('Invalid design file URL').optional(),
  designFileName: z.string().optional(),
  designFileType: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Order Validation Schemas
export const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid('Invalid shipping address ID'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['DESIGN_APPROVED', 'PRINTING_STARTED', 'PRINTING_COMPLETED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
});

// Payment Validation Schemas
export const initiatePaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

// Shipment Validation Schemas
export const createShipmentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  courierName: z.string().min(1, 'Courier name is required'),
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  trackingUrl: z.string().optional().or(z.literal('')),
  estimatedDelivery: z.string().optional().or(z.literal('')),
});

export const addShipmentEventSchema = z.object({
  status: z.enum([
    'CREATED',
    'PROCESSING',
    'PRINTED',
    'PACKED',
    'DISPATCHED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ]),
  description: z.string().min(1, 'Description is required'),
  location: z.string().optional().or(z.literal('')),
});

// Return Validation Schemas
export const createReturnRequestSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const updateReturnRequestStatusSchema = z.object({
  status: z.enum([
    'RETURN_REQUESTED',
    'RETURN_UNDER_REVIEW',
    'RETURN_APPROVED',
    'RETURN_REJECTED',
    'PICKUP_SCHEDULED',
    'PICKED_UP',
    'RETURN_RECEIVED',
    'CLOSED',
  ]),
  description: z.string().max(1000).optional(),
});

// Refund Validation Schemas
export const createRefundSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  returnRequestId: z.string().uuid('Invalid return request ID').optional(),
  amount: z.number().positive('Refund amount must be positive'),
  reason: z.string().max(500).optional(),
});

