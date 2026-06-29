import React, { useState } from 'react';
import { 
  FileText, 
  ShoppingCart, 
  Plus, 
  CheckCircle, 
  Send, 
  Truck, 
  Inbox, 
  FileCheck,
  Printer,
  Mail,
  User,
  ShoppingBag,
  DollarSign,
  Briefcase,
  AlertCircle,
  X
} from 'lucide-react';
import { PurchaseOrder, SalesOrder, Product, Supplier, POStatus, SOStatus } from '../types';

interface OrdersProps {
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  products: Product[];
  suppliers: Supplier[];
  onAddPO: (po: Omit<PurchaseOrder, 'id'>) => void;
  onUpdatePOStatus: (id: string, status: POStatus) => void;
  onAddSO: (so: Omit<SalesOrder, 'id'>) => void;
  onUpdateSOStatus: (id: string, status: SOStatus) => void;
  userRole: string;
}

export default function Orders({
  purchaseOrders,
  salesOrders,
  products,
  suppliers,
  onAddPO,
  onUpdatePOStatus,
  onAddSO,
  onUpdateSOStatus,
  userRole
}: OrdersProps) {
  const [activeSubTab, setActiveSubTab] = useState<'po' | 'so'>('po');
  const [poOpen, setPoOpen] = useState(false);
  const [soOpen, setSoOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<{ type: 'po' | 'so'; data: any } | null>(null);

  // Purchase Order Form State
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<Array<{ productId: string; quantity: number; price: number }>>([
    { productId: products[0]?.id || '', quantity: 100, price: products[0]?.buyingPrice || 10 }
  ]);

  // Sales Order Form State
  const [soCustomerName, setSoCustomerName] = useState('');
  const [soCustomerEmail, setSoCustomerEmail] = useState('');
  const [soAddress, setSoAddress] = useState('');
  const [soItems, setSoItems] = useState<Array<{ productId: string; quantity: number; price: number }>>([
    { productId: products[0]?.id || '', quantity: 10, price: products[0]?.sellingPrice || 19.99 }
  ]);

  // PO handlers
  const handleAddPOItem = () => {
    setPoItems([...poItems, { productId: products[0]?.id || '', quantity: 50, price: products[0]?.buyingPrice || 10 }]);
  };

  const handleRemovePOItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handlePOItemChange = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    if (field === 'productId') {
      const p = products.find(prod => prod.id === value);
      updated[index].productId = value;
      updated[index].price = p ? p.buyingPrice : 10;
    } else if (field === 'quantity') {
      updated[index].quantity = parseInt(value) || 0;
    } else if (field === 'price') {
      updated[index].price = parseFloat(value) || 0;
    }
    setPoItems(updated);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedItems = poItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      return {
        productId: item.productId,
        name: p ? p.name : 'Unknown Product',
        quantity: item.quantity,
        price: item.price
      };
    });

    const total = formattedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const orderNum = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    onAddPO({
      poNumber: orderNum,
      supplierId: poSupplierId,
      status: 'Pending Approval', // Default state for authorization flow
      items: formattedItems,
      totalAmount: total,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    setPoOpen(false);
    setPoItems([{ productId: products[0]?.id || '', quantity: 100, price: products[0]?.buyingPrice || 10 }]);
  };

  // SO handlers
  const handleAddSOItem = () => {
    setSoItems([...soItems, { productId: products[0]?.id || '', quantity: 5, price: products[0]?.sellingPrice || 19.99 }]);
  };

  const handleRemoveSOItem = (index: number) => {
    setSoItems(soItems.filter((_, i) => i !== index));
  };

  const handleSOItemChange = (index: number, field: string, value: any) => {
    const updated = [...soItems];
    if (field === 'productId') {
      const p = products.find(prod => prod.id === value);
      updated[index].productId = value;
      updated[index].price = p ? p.sellingPrice : 20;
    } else if (field === 'quantity') {
      updated[index].quantity = parseInt(value) || 0;
    } else if (field === 'price') {
      updated[index].price = parseFloat(value) || 0;
    }
    setSoItems(updated);
  };

  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate stock levels before creating order!
    let overdrawn = false;
    let overdrawMsg = '';

    const formattedItems = soItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p && p.quantity < item.quantity) {
        overdrawn = true;
        overdrawMsg = `Insufficient inventory for ${p.name}. Available: ${p.quantity}, Requested: ${item.quantity}`;
      }
      return {
        productId: item.productId,
        name: p ? p.name : 'Unknown Product',
        quantity: item.quantity,
        price: item.price
      };
    });

    if (overdrawn) {
      alert(`Sales Order Validation Failed:\n${overdrawMsg}`);
      return;
    }

    const total = formattedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const orderNum = `SO-2026-${Math.floor(100 + Math.random() * 900)}`;

    onAddSO({
      soNumber: orderNum,
      customerName: soCustomerName,
      customerEmail: soCustomerEmail,
      status: 'Created',
      items: formattedItems,
      totalAmount: total,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      shippingAddress: soAddress
    });

    setSoOpen(false);
    setSoCustomerName('');
    setSoCustomerEmail('');
    setSoAddress('');
    setSoItems([{ productId: products[0]?.id || '', quantity: 10, price: products[0]?.sellingPrice || 19.99 }]);
  };

  const getPOStatusStyle = (status: POStatus) => {
    switch (status) {
      case 'Draft': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
      case 'Pending Approval': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400';
      case 'Approved': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400';
      case 'Sent to Supplier': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400';
      case 'Delivered': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400';
      case 'Received': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Closed': return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  };

  const getSOStatusStyle = (status: SOStatus) => {
    switch (status) {
      case 'Created': return 'bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400';
      case 'Out for Delivery': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400';
    }
  };

  // Role permissions helpers
  const isFinance = userRole === 'Super Admin' || userRole === 'Finance Manager';
  const isInventory = userRole === 'Super Admin' || userRole === 'Inventory Staff' || userRole === 'Warehouse Manager';

  return (
    <div className="space-y-6">
      {/* Tab Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Fulfillment & Orders Control</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Generate component purchase approvals and manage outbound shipments.</p>
        </div>

        {/* Create buttons based on active subtab */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'po' ? (
            isFinance && (
              <button
                onClick={() => setPoOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <Plus className="h-4 w-4" /> Issue Purchase Order
              </button>
            )
          ) : (
            isInventory && (
              <button
                onClick={() => setSoOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <Plus className="h-4 w-4" /> Create Sales Invoice
              </button>
            )
          )}
        </div>
      </div>

      {/* Segment Switcher */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 pb-px">
        <button
          onClick={() => setActiveSubTab('po')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-all duration-200 ${
            activeSubTab === 'po' 
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <ShoppingCart className="h-4 w-4" /> Purchase Orders (Inbound Logs)
        </button>
        <button
          onClick={() => setActiveSubTab('so')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-all duration-200 ${
            activeSubTab === 'so' 
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Briefcase className="h-4 w-4" /> Sales Orders (Client Outflow)
        </button>
      </div>

      {/* PURCHASE ORDERS VIEW */}
      {activeSubTab === 'po' && (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-500 dark:text-neutral-400">
              <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                <tr>
                  <th className="px-6 py-4">PO Number / Date</th>
                  <th className="px-6 py-4">Supplier Partner</th>
                  <th className="px-6 py-4">Allocated Items</th>
                  <th className="px-6 py-4 text-right">Total Outflow</th>
                  <th className="px-6 py-4 text-center">Workflow Stage</th>
                  <th className="px-6 py-4 text-center">Shipping Status</th>
                  <th className="px-6 py-4 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {purchaseOrders.map((po) => {
                  const supplier = suppliers.find(s => s.id === po.supplierId);
                  return (
                    <tr key={po.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-950 dark:text-white">{po.poNumber}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{po.createdAt}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-neutral-800 dark:text-neutral-200">{supplier ? supplier.company : 'Unknown'}</div>
                        <div className="text-[10px] text-neutral-400">{supplier ? supplier.name : ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          {po.items.map((item, index) => (
                            <div key={index} className="text-neutral-800 dark:text-neutral-300">
                              • {item.name} <span className="font-mono font-bold">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-neutral-900 dark:text-white">
                        ₹{po.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPOStatusStyle(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-neutral-500">
                        {po.trackingNumber ? (
                          <div className="flex flex-col items-center">
                            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">{po.trackingNumber}</span>
                            <span className="text-[9px] text-neutral-400 truncate max-w-[120px]">{po.shipmentStatus}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-400">Not Dispatched</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Approval workflows based on role */}
                          {po.status === 'Pending Approval' && isFinance && (
                            <button
                              onClick={() => {
                                onUpdatePOStatus(po.id, 'Approved');
                                // Move status forward automatically
                                setTimeout(() => onUpdatePOStatus(po.id, 'Sent to Supplier'), 100);
                              }}
                              className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                            >
                              <FileCheck className="h-3.5 w-3.5" /> Approve
                            </button>
                          )}

                          {po.status === 'Sent to Supplier' && isInventory && (
                            <button
                              onClick={() => onUpdatePOStatus(po.id, 'Delivered')}
                              className="px-2 py-1 text-[10px] font-bold rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                              title="Mark Arrived"
                            >
                              <Truck className="h-3.5 w-3.5" /> Mark Delivered
                            </button>
                          )}

                          {po.status === 'Delivered' && isInventory && (
                            <button
                              onClick={() => {
                                onUpdatePOStatus(po.id, 'Received');
                              }}
                              className="px-2 py-1 text-[10px] font-bold rounded bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1"
                              title="Verify Items & Stock In"
                            >
                              <Inbox className="h-3.5 w-3.5" /> Stock In
                            </button>
                          )}

                          {/* Print voucher */}
                          <button
                            onClick={() => setSelectedVoucher({ type: 'po', data: { po, supplier } })}
                            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                            title="Print PO Voucher"
                          >
                            <Printer className="h-4 w-4" />
                          </button>

                          {/* Email simulation */}
                          <button
                            onClick={() => alert(`Email purchase receipt successfully triggered for ${supplier?.company} (contact: ${supplier?.email})`)}
                            className="p-1 text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400"
                            title="Email PO Document"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SALES ORDERS VIEW */}
      {activeSubTab === 'so' && (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-500 dark:text-neutral-400">
              <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                <tr>
                  <th className="px-6 py-4">Sales Order / Date</th>
                  <th className="px-6 py-4">Client Customer Details</th>
                  <th className="px-6 py-4">Purchased Catalog SKUs</th>
                  <th className="px-6 py-4 text-right">Invoice Value</th>
                  <th className="px-6 py-4 text-center">Shipping Logistics</th>
                  <th className="px-6 py-4 text-center">Status Badge</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-950 dark:text-white">{so.soNumber}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{so.createdAt}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">{so.customerName}</div>
                      <div className="text-[10px] text-neutral-400">{so.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {so.items.map((item, idx) => (
                          <div key={idx} className="text-neutral-800 dark:text-neutral-300">
                            • {item.name} <span className="font-mono font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-neutral-900 dark:text-white">
                      ₹{so.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center text-[11px]">
                      <div className="truncate max-w-[150px] text-neutral-700 dark:text-neutral-300">{so.shippingAddress}</div>
                      {so.trackingNumber && <span className="text-[9px] font-mono font-semibold text-neutral-400">Tracking: {so.trackingNumber}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSOStatusStyle(so.status)}`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {so.status === 'Created' && isInventory && (
                          <button
                            onClick={() => onUpdateSOStatus(so.id, 'Shipped')}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                          >
                            <Send className="h-3.5 w-3.5" /> Ship Out
                          </button>
                        )}

                        {so.status === 'Shipped' && isInventory && (
                          <button
                            onClick={() => onUpdateSOStatus(so.id, 'Delivered')}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Confirm Delivery
                          </button>
                        )}

                        {/* Invoice rendering */}
                        <button
                          onClick={() => setSelectedVoucher({ type: 'so', data: so })}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                          title="Generate Client Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER DRAWER */}
      {poOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overflow-y-auto py-8">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-xl shadow-2xl relative my-auto">
            <button 
              onClick={() => setPoOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Issue Corporate Purchase Order</h3>
            <p className="text-xs text-neutral-400 mb-6">Create structural component procurement contracts with approved suppliers.</p>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1.5 font-semibold text-neutral-700 dark:text-neutral-300">Target Supplier Account *</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.company} (Representative: {s.name})</option>
                  ))}
                </select>
              </div>

              {/* Items multi-row */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-850 pb-1.5">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Procured Components Listing</label>
                  <button
                    type="button"
                    onClick={handleAddPOItem}
                    className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Row
                  </button>
                </div>

                {poItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block mb-1 text-[10px] text-neutral-400">Product SKU *</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handlePOItemChange(index, 'productId', e.target.value)}
                        className="w-full p-1.5 rounded border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block mb-1 text-[10px] text-neutral-400">Order Quantity *</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handlePOItemChange(index, 'quantity', e.target.value)}
                        className="w-full p-1.5 rounded border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white font-bold"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block mb-1 text-[10px] text-neutral-400">Buying Unit Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handlePOItemChange(index, 'price', e.target.value)}
                        className="w-full p-1.5 rounded border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white font-mono"
                      />
                    </div>
                    {poItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePOItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total estimation widget */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 rounded-lg text-right text-xs font-bold text-neutral-900 dark:text-white">
                Estimated Capital Commitment: ₹{poItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPoOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit PO to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SALES ORDER DRAWER */}
      {soOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overflow-y-auto py-8">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-xl shadow-2xl relative my-auto">
            <button 
              onClick={() => setSoOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Create Sales Order & Invoicing</h3>
            <p className="text-xs text-neutral-400 mb-6">Issue an outbound shipping request. Note: available inventory levels will be automatically verified before submission.</p>

            <form onSubmit={handleCreateSO} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-neutral-700 dark:text-neutral-300">Client / Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Boeing Procurement"
                    value={soCustomerName}
                    onChange={(e) => setSoCustomerName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-neutral-700 dark:text-neutral-300">Client Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. procurement@boeing.com"
                    value={soCustomerEmail}
                    onChange={(e) => setSoCustomerEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-neutral-700 dark:text-neutral-300">Fulfillment Shipping Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7755 Marginal Way S, Seattle, WA 98108"
                  value={soAddress}
                  onChange={(e) => setSoAddress(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                />
              </div>

              {/* SO Items multi-row */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-850 pb-1.5">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Products Committed</label>
                  <button
                    type="button"
                    onClick={handleAddSOItem}
                    className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Row
                  </button>
                </div>

                {soItems.map((item, index) => {
                  const p = products.find(prod => prod.id === item.productId);
                  return (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block mb-1 text-[10px] text-neutral-400">Available Inventory SKU *</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleSOItemChange(index, 'productId', e.target.value)}
                          className="w-full p-1.5 rounded border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.sku} - {p.name} (Avail: {p.quantity})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block mb-1 text-[10px] text-neutral-400">Sales Qty *</label>
                        <input
                          type="number"
                          min={1}
                          max={p?.quantity || 1}
                          value={item.quantity}
                          onChange={(e) => handleSOItemChange(index, 'quantity', e.target.value)}
                          className="w-full p-1.5 rounded border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white font-bold"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block mb-1 text-[10px] text-neutral-400">Selling Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleSOItemChange(index, 'price', e.target.value)}
                          className="w-full p-1.5 rounded border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white font-mono"
                        />
                      </div>
                      {soItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSOItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total estimation widget */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 rounded-lg text-right text-xs font-bold text-neutral-900 dark:text-white">
                Calculated Invoice Total: ₹{soItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSoOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirm & Commit Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP PRINTABLE VOUCHER overlay */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-neutral-900 p-8 rounded-2xl border border-neutral-300 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedVoucher(null)}
              className="absolute right-4 top-4 p-1 rounded bg-neutral-100 text-neutral-500 hover:bg-neutral-200 no-print"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Voucher layout wrapper (highly professional invoice) */}
            <div className="space-y-6 text-xs" id="printable-voucher-document">
              {/* Logo / Header block */}
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-5">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-neutral-950">Tushar Enterprises Supply Chain</h2>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Corporate Operations & Logistics Division</p>
                  <p className="text-[9px] text-neutral-400">100 Logistics Terminal Blvd, Seattle WA 98101</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-black uppercase tracking-widest text-neutral-600">
                    {selectedVoucher.type === 'po' ? 'Purchase Voucher' : 'Customer Invoice'}
                  </h3>
                  <p className="font-mono font-bold mt-1">
                    {selectedVoucher.type === 'po' ? selectedVoucher.data.po.poNumber : selectedVoucher.data.soNumber}
                  </p>
                  <p className="text-neutral-400 mt-0.5">
                    Date: {selectedVoucher.type === 'po' ? selectedVoucher.data.po.createdAt : selectedVoucher.data.createdAt}
                  </p>
                </div>
              </div>

              {/* Addresses section */}
              <div className="grid grid-cols-2 gap-6 border-b border-neutral-100 pb-5">
                <div>
                  <h4 className="font-extrabold text-neutral-500 uppercase tracking-wider text-[9px] mb-2">Ship From / Authorized Vendor</h4>
                  {selectedVoucher.type === 'po' ? (
                    <div>
                      <div className="font-bold text-sm text-neutral-950">{selectedVoucher.data.supplier?.company}</div>
                      <div>Contact: {selectedVoucher.data.supplier?.name}</div>
                      <div>Email: {selectedVoucher.data.supplier?.email}</div>
                      <div>Phone: {selectedVoucher.data.supplier?.phone}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-sm text-neutral-950">Tushar Logistics Hub</div>
                      <div>Contact: Operations Desk</div>
                      <div>Seattle Logistics Depot WH-SEA-01</div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-neutral-500 uppercase tracking-wider text-[9px] mb-2">Ship To / Destination Delivery</h4>
                  {selectedVoucher.type === 'po' ? (
                    <div>
                      <div className="font-bold text-sm text-neutral-950">Tushar Seattle Hub</div>
                      <div>4200 Logistics Way</div>
                      <div>Seattle, WA 98101</div>
                      <div className="text-[10px] text-neutral-500 font-semibold mt-1">Status: {selectedVoucher.data.po.status}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-sm text-neutral-950">{selectedVoucher.data.customerName}</div>
                      <div>Email: {selectedVoucher.data.customerEmail}</div>
                      <div>Shipping Address: {selectedVoucher.data.shippingAddress}</div>
                      <div className="text-[10px] text-neutral-500 font-semibold mt-1">Status: {selectedVoucher.data.status}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items listing table */}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800 pb-2 text-[10px] font-bold uppercase text-neutral-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Unit Price</th>
                    <th className="py-2 text-center">Quantity</th>
                    <th className="py-2 text-right">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(selectedVoucher.type === 'po' ? selectedVoucher.data.po.items : selectedVoucher.data.items).map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="py-3 font-semibold text-neutral-950">{item.name}</td>
                      <td className="py-3 text-center font-mono">₹{item.price.toFixed(2)}</td>
                      <td className="py-3 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="py-3 text-right font-mono font-bold text-neutral-950">₹{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total calculations */}
              <div className="border-t border-neutral-800 pt-4 flex justify-between items-start">
                <div className="text-[10px] text-neutral-400 max-w-[300px]">
                  <strong>Terms of Contract:</strong> Payments are net-30 days unless otherwise agreed. Physical components must include structural safety compliance stamps on packaging boxes.
                </div>
                <div className="text-right space-y-1.5">
                  <div className="text-xs text-neutral-500">Subtotal: <span className="font-mono font-bold text-neutral-850">₹{(selectedVoucher.type === 'po' ? selectedVoucher.data.po.totalAmount : selectedVoucher.data.totalAmount).toLocaleString()}</span></div>
                  <div className="text-xs text-neutral-500">Taxes (GST/ST 0%): <span className="font-mono font-bold text-neutral-850">₹0.00</span></div>
                  <div className="text-sm font-extrabold text-neutral-950 border-t border-dashed border-neutral-300 pt-1.5">
                    Grand Total: ₹{(selectedVoucher.type === 'po' ? selectedVoucher.data.po.totalAmount : selectedVoucher.data.totalAmount).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-2 no-print">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Document Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
