export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta: PaginationMeta | null;
  errors?: ValidationErrorItem[];
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Shared DTO placeholders for Phase 1 Foundation
export interface CreateUserDto {
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  fcmToken?: string;
}

export interface CreateAddressDto {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface ActivityLogMetadata {
  [key: string]: any;
}
