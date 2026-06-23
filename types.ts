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
  phone?: string;
  address?: string;
  membership: Membership;
  description?: string;
  receivable?: number;
  payable?: number;
  ordered_amount?: number;
  deposit?: number;
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
  code?: string;
  description?: string;
  created_at: string;
}

export interface Variant {
  id: string;
  name: string;
  code?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
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

export enum ProgressStatus {
  StandBY = "stand_by",
  OnGoing = "on_going",
  Finished = "finished",
}

export enum ApprovalStatus {
  Draft = "draft",
  Approved = "approved",
  Rejected = "rejected",
}

export enum PaymentStatus {
  Unpaid = "unpaid",
  FullyPaid = "fully_paid",
  PartialPayment = "partial_payment",
}

export enum DeadlineStatus {
  Normal = 'normal',
  Overdue = 'overdue',
  Closed = 'closed',
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

export interface SalesOrderItem {
  id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  after_discount_price: number;
  total_price: number;
  code?: string;
  amount: number;
  payment_type: PaymentType;
  payment_date: string;
}

export interface DeliveryOrderItem {
  id?: string;
  sales_order_item_id: string;
  product_id?: string;
  product_name?: string;
  sales_order_quantity?: number;
  quantity: number;
}

export interface SalesOrder {
  id: string;
  code?: string;
  branch_id: string;
  branch_name?: string;
  customer_id: string;
  customer_name?: string;
  description?: string;
  total_price: number;
  discount_price: number;
  shipping_price: number;
  tax_price: number;
  grand_total: number;
  tax_include: boolean;
  approval_status: ApprovalStatus;
  progress_status: ProgressStatus;
  payment_status: PaymentStatus;
  sales_order_items: SalesOrderItem[];
  sales_order_date: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryOrder {
  id: string;
  code?: string;
  branch_id: string;
  branch_name?: string;
  customer_id: string;
  customer_name?: string;
  sales_order_id?: string;
  sales_order_code?: string;
  description?: string;
  approval_status: ApprovalStatus;
  delivery_order_items: DeliveryOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  code?: string;
  branch_id: string;
  branch_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_deposit?: number;
  payment_remaining?: number;
  sales_order_id?: string;
  sales_order_code?: string;
  delivery_order_id?: string;
  delivery_order_code?: string;
  payment_status: PaymentStatus;
  deadline_status: DeadlineStatus;
  payment_bill?: number;
  shipping_price?: number;
  created_at: string;
  updated_at: string;
}

export enum PaymentType {
  Cash = "cash",
  Transfer = "transfer",
}

export interface AccountReceivable {
  id: string;
  code?: string;
  amount: number;
  payment_type: PaymentType;
  payment_date: string;
  approval_status: ApprovalStatus;
  invoice_code?: string;
  customer_name?: string;
  branch_name?: string;
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