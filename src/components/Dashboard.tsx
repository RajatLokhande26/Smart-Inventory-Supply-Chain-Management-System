import React from 'react';
import { 
  Package, 
  IndianRupee, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  ShoppingCart, 
  Layers, 
  Boxes, 
  TrendingUp, 
  FileText,
  Warehouse
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { Product, Warehouse as WarehouseType, Supplier, PurchaseOrder, SalesOrder } from '../types';
import { INVENTORY_TRENDS, CATEGORY_DISTRIBUTION, SUPPLIER_RATINGS, MONTHLY_FINANCIALS } from '../data/mockData';

interface DashboardProps {
  products: Product[];
  warehouses: WarehouseType[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  onNavigate: (tab: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard({ 
  products, 
  warehouses, 
  suppliers, 
  purchaseOrders, 
  salesOrders,
  onNavigate 
}: DashboardProps) {
  
  // Calculate KPIs
  const totalProducts = products.length;
  
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.buyingPrice), 0);
  
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length;
  
  const outOfStockItems = products.filter(p => p.quantity === 0).length;
  
  const activeSuppliers = suppliers.length;
  
  // Orders created today (simulated as POs/SOs created recently or just total orders)
  const todayOrdersCount = purchaseOrders.filter(po => po.status === 'Pending Approval' || po.status === 'Sent to Supplier').length +
                           salesOrders.filter(so => so.status === 'Created' || so.status === 'Shipped').length;
                           
  const totalWarehouseCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const averageUtilization = Math.round(warehouses.reduce((sum, w) => sum + w.currentUtilization, 0) / warehouses.length);
  
  // Calculate dynamic monthly revenue/expenses from our sales and purchase orders
  const activeSalesTotal = salesOrders.reduce((sum, so) => sum + so.totalAmount, 0);
  const activePurchasesTotal = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);

  // Prep dynamic warehouse utilization chart data
  const warehouseChartData = warehouses.map(w => ({
    name: w.code,
    Capacity: w.capacity,
    Utilized: Math.round((w.capacity * w.currentUtilization) / 100),
    'Utilization %': w.currentUtilization
  }));

  // Dynamic Category Distribution
  const categoryCountMap: { [key: string]: number } = {};
  products.forEach(p => {
    categoryCountMap[p.category] = (categoryCountMap[p.category] || 0) + p.quantity;
  });
  const dynamicCategoryData = Object.keys(categoryCountMap).map(key => ({
    name: key,
    value: categoryCountMap[key]
  }));

  const categoryDataToRender = dynamicCategoryData.length > 0 ? dynamicCategoryData : CATEGORY_DISTRIBUTION;

  return (
    <div className="space-y-6" id="dashboard-module">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Supply Chain & Operations Control</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Real-time telemetry, capacity utilization, and predictive demand analytics.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 self-start md:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Status: Online & Synchronized
        </div>
      </div>

      {/* Modern High-Density KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products Card */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="group cursor-pointer p-5 rounded-xl border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-neutral-800 dark:bg-neutral-900"
          id="kpi-total-products"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Catalog SKUs</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{totalProducts}</h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +4.2%
              </span>
              vs previous month
            </p>
          </div>
        </div>

        {/* Total Valuation Card */}
        <div 
          onClick={() => onNavigate('reports')}
          className="group cursor-pointer p-5 rounded-xl border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-neutral-800 dark:bg-neutral-900"
          id="kpi-inventory-value"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Asset Value</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              ₹{totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +12.4%
              </span>
              live stock evaluation
            </p>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div 
          onClick={() => onNavigate('monitoring')}
          className="group cursor-pointer p-5 rounded-xl border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-neutral-800 dark:bg-neutral-900"
          id="kpi-low-stock"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Stock Alerts (Low/Out)</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {lowStockItems} <span className="text-sm font-normal text-neutral-400">low</span> / {outOfStockItems} <span className="text-sm font-normal text-red-500">empty</span>
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" /> Action Needed
              </span>
              reorder recommendations pending
            </p>
          </div>
        </div>

        {/* Warehouse Utilization Card */}
        <div 
          onClick={() => onNavigate('warehouses')}
          className="group cursor-pointer p-5 rounded-xl border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-neutral-800 dark:bg-neutral-900"
          id="kpi-warehouse-utilization"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Warehouse Capacity</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Warehouse className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{averageUtilization}% <span className="text-sm font-normal text-neutral-400">avg</span></h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <span className="font-semibold">{totalWarehouseCapacity.toLocaleString()}</span> total units max capacity
            </p>
          </div>
        </div>
      </div>

      {/* Operational Highlights Mini Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200/70 bg-neutral-50/50 dark:border-neutral-800/70 dark:bg-neutral-950/30 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Active Supply Lines</div>
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{activeSuppliers} Contracted Suppliers</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-neutral-200/70 bg-neutral-50/50 dark:border-neutral-800/70 dark:bg-neutral-950/30 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Pending Actions Queue</div>
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{todayOrdersCount} Pending Shipments/Approvals</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-neutral-200/70 bg-neutral-50/50 dark:border-neutral-800/70 dark:bg-neutral-950/30 flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Recent Capital Flow</div>
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Purchases: ₹{activePurchasesTotal.toLocaleString()} | Sales: ₹{activeSalesTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Growth - AreaChart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-neutral-900 dark:text-white">Capital Cashflow Analytics</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Comparison of Purchase Orders (Capital Out) vs Sales Orders (Revenue In)</p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Historic Fiscal</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_FINANCIALS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Revenue (Sales)" />
                <Area type="monotone" dataKey="Purchases" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPurchases)" name="Cost (Purchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution - PieChart */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white">Category Density</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Aggregate volume of units allocated across classifications.</p>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDataToRender}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDataToRender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} units`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-neutral-800 dark:text-white">
                {products.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Total Units</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {categoryDataToRender.map((entry, index) => {
              const total = categoryDataToRender.reduce((sum, item) => sum + item.value, 0);
              const percentage = Math.round((entry.value / (total || 1)) * 100);
              return (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-white">{percentage}% ({entry.value.toLocaleString()})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Warehouse Capacity - Double BarChart */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col">
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white">Warehouse Capacity Utilization</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Total volume allocations vs physical limits by facility code.</p>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Capacity" fill="#475569" radius={[4, 4, 0, 0]} name="Max Capacity" />
                <Bar dataKey="Utilized" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Utilized Units" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Lead Time & Performance Ratings */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-neutral-900 dark:text-white">Supplier Quality Index</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">On-time delivery completion rate vs standard vendor lead times.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUPPLIER_RATINGS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="onTimeRate" fill="#10b981" radius={[4, 4, 0, 0]} name="On-Time Rate %" />
                <Bar dataKey="leadTime" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Lead Time (Days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Stock Levels Highlight Panel */}
      <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white">Urgent Stock Deficits</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Active SKUs requiring immediate logistics replenishment.</p>
          </div>
          <button 
            onClick={() => onNavigate('monitoring')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Review Deficits →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-500 dark:text-neutral-400">
            <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-300">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-center">Qty / Min Buffer</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {products.filter(p => p.quantity <= p.minStock).map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{p.name}</td>
                  <td className="px-4 py-3 font-mono">{p.sku}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-neutral-900 dark:text-white">{p.quantity}</span> / {p.minStock}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">₹{p.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    {p.quantity === 0 ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/30">
                        OUT OF STOCK
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                        CRITICAL LOW
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {products.filter(p => p.quantity <= p.minStock).length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-neutral-400 dark:text-neutral-600">
                    No active stock deficits. All products are above minimum safety thresholds!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
