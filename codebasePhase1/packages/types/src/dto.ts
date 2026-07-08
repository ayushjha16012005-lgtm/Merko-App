import type { UserRole } from './user-role';
import type { UserStatus } from './user-status';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password?: string;
  passwordHash?: string;
  role?: UserRole;
  businessName?: string;
  businessAddress?: string;
  status?: UserStatus;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  fcmToken?: string;
  languagePreference?: string;
}

export interface CreateAddressDto {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}


export interface ActivityLogMetadata {
  [key: string]: unknown;
}

// Category DTOs
export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  masterImageUrl?: string;
  masterImage1?: string;
  masterImage2?: string;
  masterImage3?: string;
  masterImage4?: string;
  masterImage5?: string;
  masterImage6?: string;
  masterImage7?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  masterImageUrl?: string;
  masterImage1?: string;
  masterImage2?: string;
  masterImage3?: string;
  masterImage4?: string;
  masterImage5?: string;
  masterImage6?: string;
  masterImage7?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  masterImageUrl?: string;
  masterImage1?: string | null;
  masterImage2?: string | null;
  masterImage3?: string | null;
  masterImage4?: string | null;
  masterImage5?: string | null;
  masterImage6?: string | null;
  masterImage7?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Product DTOs
export interface CreateProductDto {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  images?: { id?: string; imageUrl: string; altText?: string; sortOrder?: number }[];
  variants?: { id?: string; name: string; sku: string; price: number; stock?: number; isActive?: boolean }[];
  cropConfig?: string;
  discountType?: 'NONE' | 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
  image7?: string;
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  basePrice?: number;
  isActive?: boolean;
  images?: { id?: string; imageUrl: string; altText?: string; sortOrder?: number }[];
  variants?: { id?: string; name: string; sku: string; price: number; stock?: number; isActive?: boolean }[];
  cropConfig?: string;
  discountType?: 'NONE' | 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
  image7?: string;
}

export interface ProductResponseDto {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
  subcategoryId?: string | null;
  material?: string | null;
  finish?: string | null;
  printingMethod?: string | null;
  waterResistant?: boolean;
  customizationAvailable?: boolean;
  featuredProduct?: boolean;
  thickness?: string | null;
  printingType?: string | null;
  customizationSupport?: string | null;
  cropConfig?: string | null;
  discountType?: string;
  discountValue?: number;
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
  image7?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: CategoryResponseDto;
  variants?: ProductVariantResponseDto[];
  images?: ProductImageResponseDto[];
}

// Product Variant DTOs
export interface CreateProductVariantDto {
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock?: number;
}

export interface UpdateProductVariantDto {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

export interface ProductVariantResponseDto {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Image DTOs
export interface CreateProductImageDto {
  productId: string;
  imageUrl: string;
  altText?: string;
  sortOrder?: number;
}

export interface ProductImageResponseDto {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  createdAt: Date;
}

// Cart DTOs
export interface AddToCartDto {
  productVariantId: string;
  quantity: number;
  designFileUrl?: string;
  designFileName?: string;
  designFileType?: string;
  mockupUrl?: string;
  designConfig?: string;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartItemResponseDto {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  designFileUrl?: string | null;
  designFileName?: string | null;
  designFileType?: string | null;
  mockupUrl?: string | null;
  designConfig?: string | null;
  productVariant: ProductVariantResponseDto & {
    product: ProductResponseDto;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartResponseDto {
  id: string;
  userId: string;
  items: CartItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

// Order DTOs
export interface CreateOrderDto {
  shippingAddressId: string;
}

export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  productVariantId?: string | null;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
  designConfig?: string | null;
  mockupUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineEventResponseDto {
  id: string;
  orderId: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface OrderResponseDto {
  id: string;
  orderNumber: string;
  userId: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  totalAmount: number;
  status: string;
  items: OrderItemResponseDto[];
  timeline: OrderTimelineEventResponseDto[];
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  payment?: PaymentResponseDto | null;
  shipment?: ShipmentResponseDto | null;
  returnRequests?: ReturnRequestResponseDto[];
  designFiles?: OrderDesignFileResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusDto {
  status: string;
  description?: string;
}

// Payment DTOs
export interface InitiatePaymentDto {
  orderId: string;
}

export interface VerifyPaymentDto {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentTransactionResponseDto {
  id: string;
  paymentId: string;
  transactionId: string;
  status: string;
  rawPayload?: string | null;
  createdAt: string;
}

export interface PaymentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  provider: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  transactions?: PaymentTransactionResponseDto[];
  refunds?: RefundResponseDto[];
  createdAt: string;
  updatedAt: string;
}

// Shipment DTOs
export interface CreateShipmentDto {
  orderId: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string; // ISO date string
}

export interface AddShipmentEventDto {
  status: string;
  description: string;
  location?: string;
}

export interface ShipmentEventResponseDto {
  id: string;
  shipmentId: string;
  status: string;
  description: string;
  location?: string | null;
  createdAt: string;
}

export interface ShipmentResponseDto {
  id: string;
  orderId: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string | null;
  status: string;
  shippedAt?: string | null;
  estimatedDelivery?: string | null;
  events?: ShipmentEventResponseDto[];
  createdAt: string;
  updatedAt: string;
}

// Return DTOs
export interface CreateReturnRequestDto {
  orderId: string;
  reason: string;
}

export interface UpdateReturnRequestStatusDto {
  status: string;
  description?: string;
}

export interface ReturnEventResponseDto {
  id: string;
  returnRequestId: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface ReturnRequestResponseDto {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  events?: ReturnEventResponseDto[];
  createdAt: string;
  updatedAt: string;
}

// Refund DTOs
export interface CreateRefundDto {
  paymentId: string;
  returnRequestId?: string;
  amount: number;
  reason?: string;
}

export interface RefundResponseDto {
  id: string;
  paymentId: string;
  returnRequestId?: string | null;
  amount: number;
  status: string;
  reason?: string | null;
  gatewayRefundId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccessRequestResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  businessName?: string | null;
  businessAddress?: string | null;
  status: UserStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  suspendedBy?: string | null;
  suspendedAt?: string | null;
  permissions?: string[];
  createdAt: string;
}

export interface SuperAdminResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: UserStatus;
  createdAt: string;
}

export interface SuperAdminInvitationResponse {
  id: string;
  userId: string;
  user: SuperAdminResponse;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuditLogResponse {
  id: string;
  userId?: string | null;
  actorRole?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  changes?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
}

export interface OrderDesignFileResponseDto {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}
