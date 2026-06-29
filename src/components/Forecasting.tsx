import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Zap, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Gauge,
  ArrowRight,
  ArrowDownToLine,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Product, Supplier, Warehouse } from '../types';
import { DEMAND_FORECASTS } from '../data/mockData';

interface ForecastingProps {
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  onTriggerReorder: (productId: string, quantity: number) => void;
  userRole: string;
}

export default function Forecasting({
  products,
  suppliers,
  warehouses,
  onTriggerReorder,
  userRole
}: ForecastingProps) {

  // Safety Stock = (Max Daily Sales * Max Lead Time) - (Average Daily Sales * Average Lead Time)
  // Let's calculate standard metrics for our products
  const forecastInsights = products.map(p => {
    const s = suppliers.find(sup => sup.id === p.supplierId);
    const w = warehouses.find(wh => wh.id === p.warehouseId);
    
    // Simulate Daily Sales Velocity based on category
    const avgDailySales = p.category === 'Electronics' ? 12 : p.category === 'Plastics' ? 22 : 8;
    const maxDailySales = Math.round(avgDailySales * 1.5);
    
    const leadTime = s ? s.leadTime : 7;
    const maxLeadTime = leadTime + 3;

    const safetyStock = Math.round((maxDailySales * maxLeadTime) - (avgDailySales * leadTime));
    
    // Suggest reorder if quantity is approaching min threshold
    const shouldReorder = p.quantity <= p.minStock || p.quantity <= safetyStock;
    const recommendedReorderQty = Math.round(p.maxStock - p.quantity);

    return {
      product: p,
      supplier: s,
      warehouse: w,
      avgDailySales,
      safetyStock,
      shouldReorder,
      recommendedReorderQty,
      velocity: p.quantity > 500 ? 'Fast Moving' : p.quantity === 0 ? 'Out of Stock' : p.quantity < 100 ? 'Slow Moving' : 'Stable'
    };
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Predictive Demand Intelligence</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Review historical run-rates, safety buffer formulas, and automated seasonal forecast trend lines.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40">
          <Sparkles className="h-4 w-4 animate-pulse text-blue-500" />
          Powered by Tushar ML Predictive Analytics
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ML Forecast graph */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-neutral-900 dark:text-white">Seasonal Run-Rate Forecast</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">ML multi-variable prediction vs actual sales trend across 8 fiscal periods.</p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Predictive Modeling</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DEMAND_FORECASTS} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-neutral-800" />
                <XAxis dataKey="period" stroke="#a3a3a3" fontSize={11} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Actual Shipments" />
                <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} name="Predicted Demand" />
                <Line type="monotone" dataKey="seasonalTrend" stroke="#a855f7" strokeWidth={2} dot={false} name="Seasonal Index" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic calculation index card */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-2">Safety Buffer Parameters</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Standard variables computed automatically by the replenishment engine.</p>
          </div>

          <div className="space-y-4 my-6 text-xs text-neutral-700 dark:text-neutral-300">
            <div className="flex items-start gap-2.5">
              <div className="rounded-lg bg-emerald-50 text-emerald-600 p-1.5 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="font-bold">Safety Stock Formula</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">(Max Sales × Max Lead) - (Avg Sales × Lead)</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="rounded-lg bg-blue-50 text-blue-600 p-1.5 dark:bg-blue-950/40 dark:text-blue-400">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="font-bold">Lead Time Coefficient</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Calculated dynamically from live partner freight reports.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="rounded-lg bg-amber-50 text-amber-600 p-1.5 dark:bg-amber-950/40 dark:text-amber-400">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="font-bold">Sales Velocity Index</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Updated hourly based on client invoice run-rates.</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 text-[11px] text-neutral-500 leading-relaxed border border-dashed border-neutral-200 dark:border-neutral-800">
            Tushar monitors buffer states dynamically to prevent costly production lines stoppages.
          </div>
        </div>

      </div>

      {/* Reorder Suggestions Grid */}
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-white text-base">ML Auto-Replenishment Queue</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Recommended logistics pipeline orders calculated via lead-times and run-rate levels.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecastInsights.map((insight) => {
            const p = insight.product;
            
            return (
              <div 
                key={p.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                  insight.shouldReorder 
                    ? 'border-amber-300 bg-amber-50/10 dark:border-amber-900/60 dark:bg-amber-950/10 shadow-xs' 
                    : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-xs truncate text-neutral-900 dark:text-white">{p.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      insight.velocity === 'Fast Moving' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : insight.velocity === 'Out of Stock'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}>
                      {insight.velocity}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-neutral-400 mb-4">{p.sku} | Facility: {insight.warehouse?.code}</div>

                  <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 border-t border-dashed border-neutral-200 dark:border-neutral-850 pt-3">
                    <div className="flex justify-between">
                      <span>Available Stock:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{p.quantity.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum Safety Stock:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{insight.safetyStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vendor Lead Time:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{insight.supplier?.leadTime} Days</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <div className="text-neutral-400 text-[10px]">Recommended Reorder</div>
                    <div className="font-extrabold text-neutral-900 dark:text-white">{insight.recommendedReorderQty.toLocaleString()} units</div>
                  </div>

                  {insight.shouldReorder ? (
                    <button
                      onClick={() => {
                        onTriggerReorder(p.id, insight.recommendedReorderQty);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    >
                      <ArrowDownToLine className="h-3.5 w-3.5 animate-bounce" /> Replenish PO
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Levels Secure
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
