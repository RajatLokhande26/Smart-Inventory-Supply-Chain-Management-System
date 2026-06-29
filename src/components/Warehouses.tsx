import React, { useState } from 'react';
import { 
  Warehouse as WarehouseIcon, 
  Layers, 
  MoveHorizontal, 
  MapPin, 
  Sparkles,
  ChevronRight,
  Gauge,
  Info,
  ArrowRight,
  Boxes,
  X
} from 'lucide-react';
import { Product, Warehouse } from '../types';

interface WarehousesProps {
  products: Product[];
  warehouses: Warehouse[];
  onTransferStock: (productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, targetLocation: string) => void;
  userRole: string;
}

export default function Warehouses({
  products,
  warehouses,
  onTransferStock,
  userRole
}: WarehousesProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [transferOpen, setTransferOpen] = useState(false);
  
  // Transfer Form State
  const [transferProduct, setTransferProduct] = useState('');
  const [transferFromWh, setTransferFromWh] = useState('');
  const [transferToWh, setTransferToWh] = useState('');
  const [transferQty, setTransferQty] = useState(10);
  const [transferTargetLoc, setTransferTargetLoc] = useState('Zone A-Shelf 2-Bin B');

  const activeWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];
  const activeWarehouseProducts = products.filter(p => p.warehouseId === selectedWarehouseId);

  // Filter products that have quantities > 0 in the source warehouse for transferring
  const sourceProducts = products.filter(p => p.warehouseId === transferFromWh && p.quantity > 0);
  const selectedProductObj = products.find(p => p.id === transferProduct);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProduct || !transferFromWh || !transferToWh || transferQty <= 0) return;
    
    onTransferStock(transferProduct, transferFromWh, transferToWh, transferQty, transferTargetLoc);
    setTransferOpen(false);
    
    // Reset form
    setTransferProduct('');
    setTransferFromWh('');
    setTransferToWh('');
  };

  const handleFromWhChange = (val: string) => {
    setTransferFromWh(val);
    const availableInWh = products.filter(p => p.warehouseId === val && p.quantity > 0);
    if (availableInWh.length > 0) {
      setTransferProduct(availableInWh[0].id);
    } else {
      setTransferProduct('');
    }
  };

  // Helper to get capacity color class
  const getCapacityColor = (utilPct: number) => {
    if (utilPct >= 90) return 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200';
    if (utilPct >= 75) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200';
    return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200';
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Fulfillment Hubs & Bins</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Track multiple warehouses, explore micro-bin capacity allocations, and coordinate intra-hub stock transfers.</p>
        </div>
        
        <button
          onClick={() => {
            setTransferFromWh(warehouses[0]?.id || '');
            handleFromWhChange(warehouses[0]?.id || '');
            setTransferToWh(warehouses[1]?.id || '');
            setTransferOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs self-start md:self-auto"
        >
          <MoveHorizontal className="h-4 w-4" /> Transfer Stock
        </button>
      </div>

      {/* Warehouse Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map((w) => {
          const isSelected = selectedWarehouseId === w.id;
          const totalUnits = products.filter(p => p.warehouseId === w.id).reduce((sum, p) => sum + p.quantity, 0);
          
          return (
            <div
              key={w.id}
              onClick={() => setSelectedWarehouseId(w.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50/20 shadow-md ring-2 ring-blue-500/10 dark:border-blue-400 dark:bg-blue-950/10' 
                  : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono text-neutral-400 uppercase">{w.code}</span>
                  <WarehouseIcon className={`h-5 w-5 ${isSelected ? 'text-blue-500' : 'text-neutral-400'}`} />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">{w.name}</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" /> {w.address}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-neutral-500">Utilization Space:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{w.currentUtilization}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${w.currentUtilization >= 90 ? 'bg-red-500' : w.currentUtilization >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${w.currentUtilization}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400 mt-2">
                  <span>Count: {totalUnits.toLocaleString()} units</span>
                  <span>Limit: {w.capacity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Selected Warehouse Details Panel */}
      {activeWarehouse && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Warehouse Zones & Capacities Map */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white">Active Warehouse Floor Plan Heatmap</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Micro-bin allocation clusters. Click zone cluster to see stock breakdown.</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300">Layout 3D Mockup</span>
            </div>

            {/* Simulated Zone Heatmap */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeWarehouse.zones.map((zoneName, index) => {
                // mock utilization for visual diversity
                const zoneUtil = index === 0 ? 88 : index === 1 ? 52 : index === 2 ? 12 : 74;
                const capColor = getCapacityColor(zoneUtil);
                
                return (
                  <div key={zoneName} className={`p-4 rounded-xl border border-dashed flex flex-col justify-between h-32 ${capColor}`}>
                    <div>
                      <div className="font-bold text-sm tracking-tight">{zoneName}</div>
                      <div className="text-[10px] opacity-85 mt-0.5">Physical Shelving</div>
                    </div>
                    <div>
                      <div className="text-xl font-black">{zoneUtil}%</div>
                      <div className="text-[9px] uppercase tracking-wider opacity-80">Utilization Index</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mini Legend */}
            <div className="flex items-center gap-4 text-[10px] text-neutral-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Optimized Space (&lt; 75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>Approaching Threshold (75% - 90%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span>Space Deficit Alert (&gt; 90%)</span>
              </div>
            </div>
          </div>

          {/* Quick stock lookup within this warehouse */}
          <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-neutral-900 dark:text-white mb-3">Facility Allocations</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">A list of raw products situated inside {activeWarehouse.code}.</p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activeWarehouseProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded bg-neutral-50 dark:bg-neutral-950/40">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{p.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{p.sku} | {p.location}</div>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white font-mono shrink-0">{p.quantity.toLocaleString()}</span>
                  </div>
                ))}
                {activeWarehouseProducts.length === 0 && (
                  <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
                    No active stock elements inside this facility.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Transfers are fully monitored with real-time capacity auto-recalculation.</span>
            </div>
          </div>

        </div>
      )}

      {/* Stock Transfer Popup Overlay */}
      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setTransferOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Execute Inter-Hub Transfer</h3>
            <p className="text-xs text-neutral-400 mb-6">Re-allocate physical components from one fulfillment hub to another.</p>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Source Warehouse (From)</label>
                  <select
                    value={transferFromWh}
                    onChange={(e) => handleFromWhChange(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Target Warehouse (To)</label>
                  <select
                    value={transferToWh}
                    onChange={(e) => setTransferToWh(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id} disabled={w.id === transferFromWh}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Select SKU to Move</label>
                <select
                  value={transferProduct}
                  required
                  onChange={(e) => setTransferProduct(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                >
                  <option value="">-- Choose available product --</option>
                  {sourceProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku}) | Max Avail: {p.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Transfer Volume (Units)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedProductObj?.quantity || 1}
                    value={transferQty}
                    onChange={(e) => setTransferQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Target Specific Location Bin</label>
                  <input
                    type="text"
                    required
                    value={transferTargetLoc}
                    onChange={(e) => setTransferTargetLoc(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              {selectedProductObj && (
                <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[11px] flex items-center justify-between">
                  <span>Balance after transfer:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>From: {(selectedProductObj.quantity - transferQty)}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>To: +{transferQty}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTransferOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!transferProduct || transferFromWh === transferToWh}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
