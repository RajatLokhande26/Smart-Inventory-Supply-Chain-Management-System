import { User, Product, Warehouse, Supplier, PurchaseOrder, SalesOrder, AuditLog, SystemNotification, ForecastData } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'u-1', name: 'Pradip Lokhande', email: 'pradip.lokhande@tushar.com', role: 'Super Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', lastLogin: '2026-06-29 08:12' },
  { id: 'u-2', name: 'Sarah Jenkins', email: 'sarah.j@enterprise.com', role: 'Warehouse Manager', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', lastLogin: '2026-06-29 07:45' },
  { id: 'u-3', name: 'Logix Corp Partner', email: 'portal@logixcorp.com', role: 'Supplier', status: 'Active', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', lastLogin: '2026-06-28 14:20' },
  { id: 'u-4', name: 'Marcus Miller', email: 'm.miller@enterprise.com', role: 'Inventory Staff', status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', lastLogin: '2026-06-29 08:01' },
  { id: 'u-5', name: 'Diana Sterling', email: 'diana.sterling@enterprise.com', role: 'Finance Manager', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', lastLogin: '2026-06-29 06:30' },
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 'w-1', name: 'Global Logistics Hub - Seattle', code: 'WH-SEA-01', capacity: 15000, currentUtilization: 78, address: '4200 Logistics Way, Seattle, WA 98101', zones: ['Zone A (High Density)', 'Zone B (Temperature Controlled)', 'Zone C (Hazmat)', 'Zone D (General Bulky)'] },
  { id: 'w-2', name: 'Midwest Distribution Depot - Chicago', code: 'WH-CHI-02', capacity: 10000, currentUtilization: 62, address: '1800 Industrial Blvd, Chicago, IL 60611', zones: ['Zone A (Pallets)', 'Zone B (E-commerce Fulfillment)', 'Zone C (Cold Storage)'] },
  { id: 'w-3', name: 'East Coast Gateway - New York', code: 'WH-NYC-03', capacity: 8000, currentUtilization: 91, address: '85 Port Authority Ave, Elizabeth, NJ 07201', zones: ['Zone A (Air Freight)', 'Zone B (Rapid Transit)', 'Zone C (Secure Cargo)'] }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's-1', name: 'Apex Tech Components', company: 'Apex Technology Corp', gstNumber: 'GST-US-992384', email: 'supply@apextech.com', phone: '+1 (555) 123-4567', address: '101 Silicon Valley Road', country: 'United States', rating: 4.8, productsSupplied: ['Microchips', 'Sensors', 'Printed Circuit Boards'], leadTime: 5 },
  { id: 's-2', name: 'Prism Plastics Co.', company: 'Prism Industries LLC', gstNumber: 'GST-US-773412', email: 'orders@prismplastics.com', phone: '+1 (555) 987-6543', address: '500 Molding Blvd', country: 'United States', rating: 4.2, productsSupplied: ['Polymer Casings', 'Custom Acrylic Brackets', 'Rubber Gaskets'], leadTime: 9 },
  { id: 's-3', name: 'Kobe Heavy Alloys Ltd', company: 'Kobe Heavy Industries', gstNumber: 'GST-JP-443211', email: 'sales@kobealloys.jp', phone: '+81 (3) 5550-1289', address: '2-1 Chiyoda-ku', country: 'Japan', rating: 4.9, productsSupplied: ['Titanium Bars', 'Grade-A Aluminum Plates', 'Reinforced Screws'], leadTime: 14 },
  { id: 's-4', name: 'Vanguard Assembly S.A.', company: 'Vanguard Manufacturing group', gstNumber: 'GST-DE-882200', email: 'contact@vanguardassembly.de', phone: '+49 (89) 1120-432', address: '12 Siemensstraße, Munich', country: 'Germany', rating: 3.5, productsSupplied: ['Solder Core Reels', 'Wire Harnesses', 'Electric Actuators'], leadTime: 7 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Industrial Microchip Core X4',
    sku: 'PRD-MCH-COREX4',
    barcode: '4006381333931',
    category: 'Electronics',
    warehouseId: 'w-1',
    quantity: 1250,
    minStock: 300,
    maxStock: 5000,
    buyingPrice: 45.00,
    sellingPrice: 89.99,
    supplierId: 's-1',
    expiryDate: '2030-12-31',
    batchNumber: 'BT-CORE-2026A',
    description: 'High-performance microchip core optimized for heavy machinery compute modules and automation processing units.',
    location: 'Zone A-Shelf 4-Bin C'
  },
  {
    id: 'p-2',
    name: 'Reinforced Titanium Bracket T3',
    sku: 'PRD-ALL-TIBRACT3',
    barcode: '4006381442107',
    category: 'Hardware Alloys',
    warehouseId: 'w-1',
    quantity: 180,
    minStock: 250, // Low Stock Alert
    maxStock: 1000,
    buyingPrice: 12.50,
    sellingPrice: 24.50,
    supplierId: 's-3',
    expiryDate: '2045-06-30',
    batchNumber: 'BT-TITAN-09',
    description: 'Aircraft-grade titanium alloy bracket, ultra-high stress tolerance with aerospace verification stamps.',
    location: 'Zone D-Shelf 1-Bin A'
  },
  {
    id: 'p-3',
    name: 'Thermal Polymer Enclosure V2',
    sku: 'PRD-PLS-THERMENV2',
    barcode: '4006381221443',
    category: 'Plastics',
    warehouseId: 'w-2',
    quantity: 15,
    minStock: 100, // Low Stock / Critical Alert
    maxStock: 800,
    buyingPrice: 4.80,
    sellingPrice: 9.99,
    supplierId: 's-2',
    expiryDate: '2028-10-15',
    batchNumber: 'BT-POLY-55X',
    description: 'Injected heat-insulating polymer case designed for modular electric components housing.',
    location: 'Zone B-Shelf 9-Bin F'
  },
  {
    id: 'p-4',
    name: 'Lithium Ion Battery Pack 48V',
    sku: 'PRD-MCH-LITH48V',
    barcode: '4006381119429',
    category: 'Electronics',
    warehouseId: 'w-3',
    quantity: 450,
    minStock: 80,
    maxStock: 1200,
    buyingPrice: 120.00,
    sellingPrice: 249.99,
    supplierId: 's-1',
    expiryDate: '2027-08-18', // Near Expiry Alert
    batchNumber: 'BT-LITH-883A',
    description: 'Rechargeable safety-capped 48V cell array with integrated thermal management sensors.',
    location: 'Zone C-Shelf 2-Bin B'
  },
  {
    id: 'p-5',
    name: 'Industrial Wire Harness WH-80',
    sku: 'PRD-ALL-WIREH80',
    barcode: '4006381555197',
    category: 'Electronics',
    warehouseId: 'w-1',
    quantity: 0, // Out of Stock Alert
    minStock: 150,
    maxStock: 1500,
    buyingPrice: 8.50,
    sellingPrice: 18.90,
    supplierId: 's-4',
    expiryDate: '2035-01-01',
    batchNumber: 'BT-WIRE-011',
    description: 'Multi-connection high-gauge harness for automotive dashboards and controls coupling.',
    location: 'Zone D-Shelf 12-Bin E'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-001',
    supplierId: 's-1',
    status: 'Delivered',
    items: [
      { productId: 'p-1', name: 'Industrial Microchip Core X4', quantity: 500, price: 45.00 }
    ],
    totalAmount: 22500,
    createdAt: '2026-06-10 10:00',
    updatedAt: '2026-06-15 14:30',
    trackingNumber: 'TRK-FEDEX-88391',
    shipmentStatus: 'Arrived at destination hub'
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-002',
    supplierId: 's-3',
    status: 'Pending Approval',
    items: [
      { productId: 'p-2', name: 'Reinforced Titanium Bracket T3', quantity: 600, price: 12.50 }
    ],
    totalAmount: 7500,
    createdAt: '2026-06-28 09:15',
    updatedAt: '2026-06-28 09:15'
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-003',
    supplierId: 's-4',
    status: 'Sent to Supplier',
    items: [
      { productId: 'p-5', name: 'Industrial Wire Harness WH-80', quantity: 800, price: 8.50 }
    ],
    totalAmount: 6800,
    createdAt: '2026-06-25 11:30',
    updatedAt: '2026-06-26 15:40',
    trackingNumber: 'TRK-DHL-99238',
    shipmentStatus: 'In Transit - Customs Cleared'
  }
];

export const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-1',
    soNumber: 'SO-2026-101',
    customerName: 'Boeing Procurement Dept',
    customerEmail: 'b.orders@boeing.com',
    status: 'Delivered',
    items: [
      { productId: 'p-1', name: 'Industrial Microchip Core X4', quantity: 200, price: 89.99 },
      { productId: 'p-2', name: 'Reinforced Titanium Bracket T3', quantity: 150, price: 24.50 }
    ],
    totalAmount: 21673,
    createdAt: '2026-06-20 13:45',
    shippingAddress: '7755 Marginal Way S, Seattle, WA 98108',
    trackingNumber: 'TRK-UPS-12002'
  },
  {
    id: 'so-2',
    soNumber: 'SO-2026-102',
    customerName: 'Tesla Gigafactory 5',
    customerEmail: 'giga5-procure@tesla.com',
    status: 'Shipped',
    items: [
      { productId: 'p-4', name: 'Lithium Ion Battery Pack 48V', quantity: 100, price: 249.99 }
    ],
    totalAmount: 24999,
    createdAt: '2026-06-28 14:00',
    shippingAddress: '1 Tesla Road, Austin, TX 78725',
    trackingNumber: 'TRK-UPS-99182'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', userId: 'u-1', userName: 'Pradip Lokhande', userRole: 'Super Admin', action: 'CREATE_PRODUCT', details: 'Added new product Industrial Microchip Core X4 to database', oldValue: '-', newValue: 'SKU: PRD-MCH-COREX4, Qty: 1250', timestamp: '2026-06-29 08:15:32', ipAddress: '192.168.1.55' },
  { id: 'log-2', userId: 'u-4', userName: 'Marcus Miller', userRole: 'Inventory Staff', action: 'ADJUST_STOCK', details: 'Adjusted quantity for Reinforced Titanium Bracket T3 due to manual recount (-20 units)', oldValue: 'Qty: 200', newValue: 'Qty: 180', timestamp: '2026-06-29 08:05:12', ipAddress: '192.168.1.102' },
  { id: 'log-3', userId: 'u-5', userName: 'Diana Sterling', userRole: 'Finance Manager', action: 'SUBMIT_PO', details: 'Generated purchase order PO-2026-002 for Kobe Heavy Alloys Ltd', oldValue: '-', newValue: 'PO Amount: ₹7,500.00', timestamp: '2026-06-28 09:15:00', ipAddress: '192.168.1.24' }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  { id: 'n-1', title: 'Low Stock Alert', message: 'Reinforced Titanium Bracket T3 has fallen below safety buffer of 250 (Current: 180).', type: 'warning', timestamp: '2026-06-29 08:05', read: false },
  { id: 'n-2', title: 'Out of Stock Alert', message: 'Industrial Wire Harness WH-80 is completely out of stock. Standard lead time is 7 days.', type: 'danger', timestamp: '2026-06-29 08:00', read: false },
  { id: 'n-3', title: 'Near Expiry Alert', message: 'Lithium Ion Battery Pack 48V (Batch BT-LITH-883A) expires within 60 days.', type: 'info', timestamp: '2026-06-29 07:30', read: true },
  { id: 'n-4', title: 'Supplier Shipment Delayed', message: 'Vanguard Assembly S.A. reported a custom clearance delay for Wire Harnesses shipment.', type: 'warning', timestamp: '2026-06-28 17:10', read: false }
];

// Seed charts data
export const INVENTORY_TRENDS = [
  { month: 'Jan', stockValue: 85000, itemsCount: 2200 },
  { month: 'Feb', stockValue: 92000, itemsCount: 2450 },
  { month: 'Mar', stockValue: 110000, itemsCount: 2900 },
  { month: 'Apr', stockValue: 105000, itemsCount: 2800 },
  { month: 'May', stockValue: 125000, itemsCount: 3100 },
  { month: 'Jun', stockValue: 135000, itemsCount: 3350 }
];

export const MONTHLY_FINANCIALS = [
  { name: 'Jan', Purchases: 45000, Sales: 65000, Profit: 20000 },
  { name: 'Feb', Purchases: 52000, Sales: 78000, Profit: 26000 },
  { name: 'Mar', Purchases: 68000, Sales: 91000, Profit: 23000 },
  { name: 'Apr', Purchases: 49000, Sales: 84000, Profit: 35000 },
  { name: 'May', Purchases: 72000, Sales: 112000, Profit: 40000 },
  { name: 'Jun', Purchases: 55000, Sales: 128000, Profit: 73000 }
];

export const CATEGORY_DISTRIBUTION = [
  { name: 'Electronics', value: 55 },
  { name: 'Hardware Alloys', value: 25 },
  { name: 'Plastics', value: 20 }
];

export const SUPPLIER_RATINGS = [
  { name: 'Apex Tech', rating: 4.8, leadTime: 5, onTimeRate: 98 },
  { name: 'Prism Plastics', rating: 4.2, leadTime: 9, onTimeRate: 91 },
  { name: 'Kobe Heavy', rating: 4.9, leadTime: 14, onTimeRate: 96 },
  { name: 'Vanguard Assembly', rating: 3.5, leadTime: 7, onTimeRate: 82 }
];

export const DEMAND_FORECASTS: ForecastData[] = [
  { period: 'Jul W1', actual: 480, predicted: 490, seasonalTrend: 450 },
  { period: 'Jul W2', actual: 520, predicted: 510, seasonalTrend: 470 },
  { period: 'Jul W3', actual: 495, predicted: 525, seasonalTrend: 490 },
  { period: 'Jul W4', actual: 0, predicted: 540, seasonalTrend: 520 },
  { period: 'Aug W1', actual: 0, predicted: 580, seasonalTrend: 550 },
  { period: 'Aug W2', actual: 0, predicted: 610, seasonalTrend: 580 },
  { period: 'Aug W3', actual: 0, predicted: 590, seasonalTrend: 560 },
  { period: 'Aug W4', actual: 0, predicted: 620, seasonalTrend: 590 }
];
