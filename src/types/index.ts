export type UserRole = 'Super Admin' | 'Warehouse Manager' | 'Supplier' | 'Inventory Staff' | 'Finance Manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  avatar: string;
  lastLogin: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  warehouseId: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  buyingPrice: number;
  sellingPrice: number;
  supplierId: string;
  expiryDate?: string;
  batchNumber?: string;
  description: string;
  location: string; // "Zone-Shelf-Bin" (e.g. "A-12-B")
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  capacity: number; // in cubic meters or total units
  currentUtilization: number;
  address: string;
  zones: string[]; // e.g. ["Zone A", "Zone B", "Zone C"]
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  gstNumber: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  rating: number; // 1 to 5
  productsSupplied: string[]; // Product names or categories
  leadTime: number; // in days
}

export type POStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Sent to Supplier' | 'Delivered' | 'Received' | 'Closed';

export interface PurchaseOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  status: POStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  shipmentStatus?: string;
}

export type SOStatus = 'Created' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export interface SalesOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerName: string;
  customerEmail: string;
  status: SOStatus;
  items: SalesOrderItem[];
  totalAmount: number;
  createdAt: string;
  shippingAddress: string;
  trackingNumber?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  timestamp: string;
  read: boolean;
}

export interface ForecastData {
  period: string; // e.g., "Week 1", "Jul 26"
  actual: number;
  predicted: number;
  seasonalTrend: number;
}
