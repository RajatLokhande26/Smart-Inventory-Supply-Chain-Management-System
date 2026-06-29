import React from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle, 
  Trash2, 
  Clock, 
  ShieldAlert, 
  Info, 
  Boxes,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Product, Supplier, Warehouse } from '../types';

interface StockMonitorProps {
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  onTriggerReorder: (productId: string, quantity: number) => void;
  userRole: string;
}

export default function StockMonitor({
  products,
  suppliers,
  warehouses,
  onTriggerReorder,
  userRole
}: StockMonitorProps) {

  // Dynamic classifications
  const lowStockAlerts = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock);
  const outOfStockAlerts = products.filter(p => p.quantity === 0);
  const overstockAlerts = products.filter(p => p.quantity >= p.maxStock);
  
  // Expiry tracking (Mocking near-expiry for items expiring in 2027 or earlier)
  const expiryAlerts = products.filter(p => {
    if (!p.expiryDate) return false;
    const year = parseInt(p.expiryDate.split('-')[0], 10);
    return year <= 2027; // simulated threshold
  });

  // Dead stock detection: products with high stock but slow-moving tag or zero transactions (simulated)
  const deadStockItems = products.filter(p => {
    // Simulating items in specific locations with low turnover
    return (p.quantity >= p.minStock && (p.category === 'Plastics' || p.sku.includes('PLS')));
  });

  // Automated reorder suggestions block
  const handleAutoReorderAll = () => {
    const deficitCount = lowStockAlerts.length + outOfStockAlerts.length;
    if (deficitCount === 0) {
      alert("All inventory items are currently above safety thresholds. No reorders needed!");
      return;
    }

    if (confirm(`Repleminishment Engine has detected ${deficitCount} stock deficits.\n\nGenerate purchase order drafts automatically?`)) {
      [...lowStockAlerts, ...outOfStockAlerts].forEach(p => {
        const recommendedQty = Math.round(p.maxStock - p.quantity);
        onTriggerReorder(p.id, recommendedQty);
      });
      alert(`Successfully dispatched replenishment order drafts for ${deficitCount} products to the Purchase Order registry.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Logistics & Buffer Monitoring</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Proactive scanning of stock deficits, expiry hazards, overstock overhead, and dead stock shelf age.</p>
        </div>
        <button
          onClick={handleAutoReorderAll}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs self-start md:self-auto"
        >
          <Zap className="h-4 w-4 animate-pulse text-amber-100" /> Automated Buffer Replenish All
        </button>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low and Out Stock Alerts */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
            <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 animate-bounce" /> Stock Deficits Alert Panel ({lowStockAlerts.length + outOfStockAlerts.length})
            </h3>
            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-sm dark:bg-red-950/40 dark:text-red-400">IMMEDIATE ACTION</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {[...outOfStockAlerts, ...lowStockAlerts].map((p) => {
              const wh = warehouses.find(w => w.id === p.warehouseId);
              const isOut = p.quantity === 0;
              
              return (
                <div key={p.id} className="p-3.5 rounded-xl border border-neutral-150 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/20 text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-neutral-900 dark:text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">SKU: {p.sku} | Facility: {wh?.code}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-neutral-500">Current Qty</div>
                    <span className={`text-base font-black ${isOut ? 'text-red-500' : 'text-amber-500'}`}>{p.quantity}</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Min safety: {p.minStock}</span>
                  </div>

                  <button
                    onClick={() => {
                      const recommended = Math.round(p.maxStock - p.quantity);
                      onTriggerReorder(p.id, recommended);
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    PO Draft
                  </button>
                </div>
              );
            })}
            {[...outOfStockAlerts, ...lowStockAlerts].length === 0 && (
              <div className="text-center py-12 text-neutral-400 dark:text-neutral-600 font-medium flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                No stock deficits found. All levels are secure!
              </div>
            )}
          </div>
        </div>

        {/* Expiry Tracking Hazard Alerts */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
            <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500 animate-pulse" /> Material Expiry Risks ({expiryAlerts.length})
            </h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-sm dark:bg-amber-950/40 dark:text-amber-400">FIFO QUEUES</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {expiryAlerts.map((p) => {
              const wh = warehouses.find(w => w.id === p.warehouseId);
              return (
                <div key={p.id} className="p-3.5 rounded-xl border border-neutral-150 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/20 text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-neutral-900 dark:text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">Batch ID: {p.batchNumber} | Location: {p.location}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-neutral-400">Expiry Date</div>
                    <span className="font-mono text-xs font-bold text-red-500">{p.expiryDate}</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Count: {p.quantity} units</span>
                  </div>
                </div>
              );
            })}
            {expiryAlerts.length === 0 && (
              <div className="text-center py-12 text-neutral-400 dark:text-neutral-600 font-medium">
                No active material expiry risks.
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dead Stock Audits */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
            <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-neutral-500" /> Dead Stock Auditing (Low Turnover)
            </h3>
            <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-sm dark:bg-neutral-800 dark:text-neutral-300">Space Audits</span>
          </div>

          <div className="space-y-3 max-h-70 overflow-y-auto pr-1">
            {deadStockItems.map((p) => {
              const wh = warehouses.find(w => w.id === p.warehouseId);
              return (
                <div key={p.id} className="p-3.5 rounded-xl border border-neutral-150 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/20 text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-neutral-900 dark:text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">Category: {p.category} | Shelf Age: 180 Days</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-neutral-400">Tied Capital</div>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{(p.quantity * p.buyingPrice).toLocaleString()}</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Space: {p.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overstock Alert Overhead */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
            <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
              <Boxes className="h-5 w-5 text-blue-500" /> Overstock Buffer Alerts ({overstockAlerts.length})
            </h3>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-sm dark:bg-blue-950/40 dark:text-blue-400">HOLDING COSTS</span>
          </div>

          <div className="space-y-3 max-h-70 overflow-y-auto pr-1">
            {overstockAlerts.map((p) => {
              const wh = warehouses.find(w => w.id === p.warehouseId);
              return (
                <div key={p.id} className="p-3.5 rounded-xl border border-neutral-150 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/20 text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-neutral-900 dark:text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">SKU: {p.sku} | Facility: {wh?.code}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-neutral-400">Current Qty</div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{p.quantity}</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Max allowed: {p.maxStock}</span>
                  </div>
                </div>
              );
            })}
            {overstockAlerts.length === 0 && (
              <div className="text-center py-12 text-neutral-400 dark:text-neutral-600 font-medium">
                No active overstock buffer alerts.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
