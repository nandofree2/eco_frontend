export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  visible_menus?: string[];
  created_at: string;
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
}

export enum Membership {
  Regular = 0,
  Member = 1,
  VIP = 2,
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  membership: Membership;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  status_user: UserStatus;
  role_id?: string;
  role?: Role;
  role_name?: string;
  role_ability?: any;
  current_abilities?: any[];
  creator_name?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
}

export interface Category {
  id: string;
  name: string;
  sku: string;
  description?: string;
  created_at: string;
}

export interface Province {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  code: string;
  province_id: string;
  province?: Province;
  description?: string;
  created_at: string;
}

export enum BranchStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2,
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city_id: string;
  city?: City;
  address?: string;
  phone?: string;
  status_branch: BranchStatus;
  description?: string;
  created_at: string;
}

export interface UnitOfMeasurement {
  id: string;
  name: string;
  code: string;
  quantity: number;
  abbreviation: string;
  description?: string;
  created_at: string;
}

export enum ProductStatus {
  Unreleased = 0,
  Expired = 1,
  Active = 2,
  Deactive = 3,
}

export enum ProductType {
  Physical = 0,
  Service = 1,
}

export interface Product {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status_product: ProductStatus;
  product_type: ProductType;
  base_price: number;
  category_id: string;
  category?: Category;
  unit_of_measurement_id: string;
  unit_of_measurement?: UnitOfMeasurement;
  cover_image_url?: string;
  preview_images_urls?: string[];
  created_at: string;
}

export interface StockProduct {
  id: string;
  physical_stock: number;
  marketing_stock: number;
  product_id: string;
  product_name: string;
  branch_id: string;
  branch_name: string;
  created_at: string;
  updated_at: string;
}

export enum AdjustmentType {
  In = "in",
  Out = "out",
}

export enum ApprovalStatus {
  Draft = "draft",
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface AdjustmentProductItem {
  id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
}

export interface AdjustmentProduct {
  id: string;
  branch_id: string;
  branch_name?: string;
  description?: string;
  adjustment_type: AdjustmentType;
  approval_status: ApprovalStatus;
  adjustment_product_items: AdjustmentProductItem[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface PaginationMeta {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DashboardStats {
  products_count: number;
  categories_count: number;
  units_count: number;
  users_count: number;
}