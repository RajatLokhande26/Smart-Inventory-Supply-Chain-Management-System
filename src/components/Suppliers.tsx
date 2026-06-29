import React, { useState } from 'react';
import { 
  Users, 
  Star, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Edit2, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Building,
  DollarSign,
  X
} from 'lucide-react';
import { Supplier, PurchaseOrder } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdatePOShipment: (poId: string, status: string, tracking?: string) => void;
  userRole: string;
}

export default function Suppliers({
  suppliers,
  purchaseOrders,
  onAddSupplier,
  onUpdatePOShipment,
  userRole
}: SuppliersProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [addOpen, setAddOpen] = useState(false);
  const [updatePOOpen, setUpdatePOOpen] = useState(false);
  const [activePOId, setActivePOId] = useState<string>('');
  
  // Update PO Delivery State
  const [newShipmentStatus, setNewShipmentStatus] = useState('In Transit - Departed facility');
  const [trackingNumber, setTrackingNumber] = useState('TRK-FEDEX-99882');

  // Supplier Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    gstNumber: '',
    email: '',
    phone: '',
    address: '',
    country: 'United States',
    rating: 4.5,
    productsSupplied: ['Steel Bars'],
    leadTime: 7
  });

  const activeSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
  const activeSupplierPOs = purchaseOrders.filter(po => po.supplierId === selectedSupplierId);

  // Filter pending deliveries (e.g. Sent to Supplier or Approved)
  const pendingDeliveries = activeSupplierPOs.filter(po => po.status === 'Sent to Supplier' || po.status === 'Approved');

  const handleSubmitSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSupplier({
      ...formData,
      productsSupplied: typeof formData.productsSupplied === 'string' 
        ? (formData.productsSupplied as string).split(',').map(p => p.trim()) 
        : formData.productsSupplied
    });
    setAddOpen(false);
  };

  const handleUpdatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePOId) return;
    onUpdatePOShipment(activePOId, newShipmentStatus, trackingNumber);
    setUpdatePOOpen(false);
  };

  // Star Rating generator
  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4.5 w-4.5 ${i <= floor ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-700'}`} 
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const canModify = userRole === 'Super Admin' || userRole === 'Finance Manager';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Supplier Partnerships</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage supply chains, track lead times, review vendor quality indexes, and audit capital histories.</p>
        </div>

        {canModify && (
          <button
            onClick={() => {
              setFormData({
                name: '',
                company: '',
                gstNumber: '',
                email: '',
                phone: '',
                address: '',
                country: 'United States',
                rating: 4.0,
                productsSupplied: ['Printed Circuit Boards'],
                leadTime: 10
              });
              setAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs self-start md:self-auto"
          >
            <Plus className="h-4 w-4" /> Onboard Supplier
          </button>
        )}
      </div>

      {/* Main Grid: Supplier selector list + Supplier details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Supplier Selector List */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4 lg:col-span-1">
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Onboarded Vendors ({suppliers.length})</h3>
          
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {suppliers.map((s) => {
              const isSelected = selectedSupplierId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSupplierId(s.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-950/15 shadow-sm' 
                      : 'border-neutral-100 hover:border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white text-xs">{s.company}</div>
                      <div className="text-[10px] text-neutral-400 font-medium mt-0.5">{s.name}</div>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40 shrink-0">
                      ★ {s.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 border-t border-dashed border-neutral-200/50 pt-2 dark:border-neutral-800/50">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 shrink-0" /> {s.leadTime} Days</span>
                    <span className="truncate max-w-[120px]">{s.country}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supplier Details & Performance Dashboard */}
        {activeSupplier && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Detailed profile */}
            <div className="p-6 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800/60 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 text-blue-600 p-3 dark:bg-blue-950/50 dark:text-blue-400">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">{activeSupplier.company}</h3>
                    <p className="text-xs text-neutral-400 font-mono">Tax GST ID: {activeSupplier.gstNumber}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                  <span className="text-xs text-neutral-400 font-semibold">Vendor Quality Rating</span>
                  {renderStars(activeSupplier.rating)}
                </div>
              </div>

              {/* Grid Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-600 dark:text-neutral-400 mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span className="truncate">{activeSupplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span>{activeSupplier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span className="truncate">{activeSupplier.address}, {activeSupplier.country}</span>
                </div>
              </div>

              {/* Products supplied Tag block */}
              <div>
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">Scope of Supply Products</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeSupplier.productsSupplied.map((prod) => (
                    <span key={prod} className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                      {prod}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Indicators & Active Shipments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Deliveries Monitoring */}
              <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-3">Pending Logistics Lines</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Active Purchase Orders awaiting supplier delivery.</p>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {pendingDeliveries.map((po) => (
                      <div key={po.id} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-950/20 text-xs flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 dark:text-white">{po.poNumber}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">{po.status}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-400">
                          <span>Amount: ₹{po.totalAmount.toLocaleString()}</span>
                          {po.trackingNumber ? (
                            <span className="font-mono text-blue-600 dark:text-blue-400">Tracking: {po.trackingNumber}</span>
                          ) : (
                            <span className="text-amber-500 font-bold">Unassigned Tracking</span>
                          )}
                        </div>
                        
                        {/* Action for Supplier Role/Manager to simulate updating delivery */}
                        {(userRole === 'Supplier' || userRole === 'Super Admin') && (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePOId(po.id);
                              setUpdatePOOpen(true);
                            }}
                            className="mt-1 inline-flex items-center justify-center gap-1 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 rounded"
                          >
                            <Truck className="h-3 w-3" /> Update Shipping Status
                          </button>
                        )}
                      </div>
                    ))}
                    {pendingDeliveries.length === 0 && (
                      <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
                        No pending purchase order delivery schedules.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Index & Lead Time Performance */}
              <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4">
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm border-b border-neutral-100 dark:border-neutral-800 pb-2">Supply Performance Metrics</h4>
                
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Contract Lead Time:</span>
                    <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {activeSupplier.leadTime} Days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Standard On-Time Rate:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">95.4%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Defect Rate Score:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">0.02% (Optimal)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Accumulated PO Volume:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{activeSupplierPOs.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Onboard Supplier Dialog */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setAddOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Onboard Partner Supplier</h3>

            <form onSubmit={handleSubmitSupplier} className="space-y-4 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Vendor Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kobe Heavy Alloys"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Primary Contact Representative *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kenji Tanaka"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Vendor Tax GST ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GST-JP-99321"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Target Lead Time (Days) *</label>
                  <input
                    type="number"
                    required
                    value={formData.leadTime}
                    onChange={(e) => setFormData({...formData, leadTime: parseInt(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Direct Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. orders@kobe alloys.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Telephone Line *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +81 (3) 555-1212"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2-1 Chiyoda-ku, Tokyo, Japan"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Products Supplied (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steel Sheets, Titanium Alloys, Solder Reels"
                  onChange={(e) => setFormData({...formData, productsSupplied: e.target.value.split(',').map(p => p.trim())})}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-850">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Onboard Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update PO Shipment Dialog */}
      {updatePOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setUpdatePOOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Update Shipment Progress</h3>
            <p className="text-xs text-neutral-400 mb-6">Communicate active transport status to the warehouse logistics team.</p>

            <form onSubmit={handleUpdatePOSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1.5 font-semibold text-neutral-700 dark:text-neutral-300">Transit Status Updates</label>
                <select
                  value={newShipmentStatus}
                  onChange={(e) => setNewShipmentStatus(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                >
                  <option value="In Transit - Departed Supplier Dock">In Transit - Departed Supplier Dock</option>
                  <option value="In Transit - Customs Cleared">In Transit - Customs Cleared</option>
                  <option value="In Transit - Arrived at Local Terminal">In Transit - Arrived at Local Terminal</option>
                  <option value="Out for Local Facility Delivery">Out for Local Facility Delivery</option>
                  <option value="Delivered - Offloaded at Loading Dock">Delivered - Offloaded at Loading Dock</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 font-semibold text-neutral-700 dark:text-neutral-300">Courier Tracking Number</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setUpdatePOOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Post Tracking Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
