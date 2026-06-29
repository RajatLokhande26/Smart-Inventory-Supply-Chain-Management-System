import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  QrCode, 
  Barcode, 
  Upload, 
  Search, 
  SlidersHorizontal, 
  RefreshCw,
  PlusCircle,
  MinusCircle,
  X,
  FileSpreadsheet,
  FileCode,
  ScanBarcode,
  Info
} from 'lucide-react';
import { Product, Warehouse, Supplier } from '../types';

interface InventoryProps {
  products: Product[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (productId: string, quantityChange: number, reason: string) => void;
  userRole: string;
}

export default function Inventory({
  products,
  warehouses,
  suppliers,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
  userRole
}: InventoryProps) {
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [stockStatus, setStockStatus] = useState('All'); // All, Low, Out, Overstock
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Selected product for edit/QR
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  
  // Form values
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Electronics',
    warehouseId: warehouses[0]?.id || '',
    quantity: 100,
    minStock: 20,
    maxStock: 500,
    buyingPrice: 10,
    sellingPrice: 19.99,
    supplierId: suppliers[0]?.id || '',
    expiryDate: '',
    batchNumber: '',
    description: '',
    location: 'Zone A-Shelf 1-Bin A'
  });

  // Stock Adjustment values
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Manual recount');

  // Scanner Simulator states
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<Product | null>(null);

  // Bulk Import simulation helper
  const [bulkFileType, setBulkFileType] = useState<'csv' | 'excel'>('csv');
  const [bulkFileContent, setBulkFileContent] = useState('');

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // RBAC permissions helper
  const canModify = userRole === 'Super Admin' || userRole === 'Inventory Staff';

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesWarehouse = selectedWarehouse === 'All' || p.warehouseId === selectedWarehouse;
    
    let matchesStock = true;
    if (stockStatus === 'Low') {
      matchesStock = p.quantity > 0 && p.quantity <= p.minStock;
    } else if (stockStatus === 'Out') {
      matchesStock = p.quantity === 0;
    } else if (stockStatus === 'Overstock') {
      matchesStock = p.quantity >= p.maxStock;
    }

    return matchesSearch && matchesCategory && matchesWarehouse && matchesStock;
  });

  // Generator Helpers
  const generateSKUAndBarcode = (prodName: string, category: string) => {
    const prefix = 'PRD';
    const catCode = category.substring(0, 3).toUpperCase();
    const nameCode = prodName.replace(/[^a-zA-Z]/g, '').substring(0, 5).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${catCode}-${nameCode}`;
    const barcode = `400638${rand}${Math.floor(10 + Math.random() * 90)}`;
    return { sku, barcode };
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      category: 'Electronics',
      warehouseId: warehouses[0]?.id || '',
      quantity: 50,
      minStock: 10,
      maxStock: 1000,
      buyingPrice: 15,
      sellingPrice: 29.99,
      supplierId: suppliers[0]?.id || '',
      expiryDate: '2028-12-31',
      batchNumber: `BT-NEW-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      location: 'Zone B-Shelf 4-Bin C'
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let sku = formData.sku;
    let barcode = formData.barcode;
    if (!sku || !barcode) {
      const generated = generateSKUAndBarcode(formData.name, formData.category);
      sku = sku || generated.sku;
      barcode = barcode || generated.barcode;
    }
    onAddProduct({
      ...formData,
      sku,
      barcode
    });
    setIsAddOpen(false);
  };

  const handleOpenEdit = (p: Product) => {
    setActiveProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      warehouseId: p.warehouseId,
      quantity: p.quantity,
      minStock: p.minStock,
      maxStock: p.maxStock,
      buyingPrice: p.buyingPrice,
      sellingPrice: p.sellingPrice,
      supplierId: p.supplierId,
      expiryDate: p.expiryDate || '',
      batchNumber: p.batchNumber || '',
      description: p.description,
      location: p.location
    });
    setAdjustAmount(0);
    setAdjustReason('Manual recount');
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    
    // Check if simple quantity adjustment was made directly in edit form
    if (adjustAmount !== 0) {
      onAdjustStock(activeProduct.id, adjustAmount, adjustReason);
    }

    onEditProduct({
      ...activeProduct,
      ...formData,
      quantity: activeProduct.quantity + (adjustAmount || 0) // quantity is safety managed by stock adjustment
    });
    setIsEditOpen(false);
  };

  // Barcode / QR rendering helper
  const drawBarcodeSVG = (code: string) => {
    // Simulating simple elegant code 128 barcode
    return (
      <svg className="w-48 h-12" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="30" fill="none" />
        {Array.from(code).map((char, index) => {
          const val = parseInt(char, 10) || 3;
          const isOdd = index % 2 === 0;
          const strokeWidth = isOdd ? (val % 3) + 1 : (val % 2) + 0.5;
          return (
            <line
              key={index}
              x1={10 + index * 6}
              y1="4"
              x2={10 + index * 6}
              y2="24"
              stroke="#000"
              strokeWidth={strokeWidth}
            />
          );
        })}
        <text x="50" y="29" fontSize="4.5" textAnchor="middle" fontFamily="monospace" fill="#555">{code}</text>
      </svg>
    );
  };

  // Simulate scanning input
  const handleScannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = products.find(p => p.sku === scannedCode || p.barcode === scannedCode);
    if (found) {
      setScanResult(found);
    } else {
      setScanResult(null);
    }
  };

  // Simulated CSV upload parser
  const handleCSVImport = () => {
    if (!bulkFileContent.trim()) return;
    
    const lines = bulkFileContent.split('\n');
    let importCount = 0;
    
    lines.forEach((line, index) => {
      if (index === 0) return; // skip header
      const parts = line.split(',');
      if (parts.length >= 5) {
        const name = parts[0]?.trim();
        const category = parts[1]?.trim() || 'Electronics';
        const qty = parseInt(parts[2]?.trim(), 10) || 10;
        const buy = parseFloat(parts[3]?.trim()) || 5.0;
        const sell = parseFloat(parts[4]?.trim()) || 9.99;
        
        const generated = generateSKUAndBarcode(name, category);
        
        onAddProduct({
          name,
          sku: generated.sku,
          barcode: generated.barcode,
          category,
          warehouseId: warehouses[0]?.id || 'w-1',
          quantity: qty,
          minStock: Math.round(qty * 0.2),
          maxStock: qty * 5,
          buyingPrice: buy,
          sellingPrice: sell,
          supplierId: suppliers[0]?.id || 's-1',
          expiryDate: '2029-12-31',
          batchNumber: `BT-BULK-${index}`,
          description: 'Imported via spreadsheet batch process.',
          location: 'Zone B-Shelf 2-Bin A'
        });
        importCount++;
      }
    });

    alert(`Successfully imported ${importCount} products into database.`);
    setIsBulkOpen(false);
    setBulkFileContent('');
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Quick Action Bars */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Active Catalog Matrix</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Add, edit, structure, scan barcodes, and handle bulk CSV/Excel supply data ingestion.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-700/50"
          >
            <ScanBarcode className="h-4 w-4" /> Simulate Scanner
          </button>
          
          {canModify && (
            <>
              <button
                onClick={() => setIsBulkOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-700/50"
              >
                <Upload className="h-4 w-4" /> Bulk Import
              </button>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" /> Add New SKU
              </button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by SKU, product name, barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
            >
              <option value="All">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.code}</option>
              ))}
            </select>

            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="col-span-2 sm:col-span-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
            >
              <option value="All">Stock Filters</option>
              <option value="Low">Low Stock Alerts</option>
              <option value="Out">Out of Stock</option>
              <option value="Overstock">Overstock Buffer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Core Catalog Table View */}
      <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-500 dark:text-neutral-400">
            <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-300">
              <tr>
                <th className="px-6 py-4">Item Name / Details</th>
                <th className="px-6 py-4">SKU / Barcode</th>
                <th className="px-6 py-4 text-center">Warehouse</th>
                <th className="px-6 py-4 text-center">In-Stock / Limit</th>
                <th className="px-6 py-4 text-right">Unit Pricing (Buy/Sell)</th>
                <th className="px-6 py-4 text-center">Location Details</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredProducts.map((p) => {
                const wh = warehouses.find(w => w.id === p.warehouseId);
                const isLow = p.quantity > 0 && p.quantity <= p.minStock;
                const isOut = p.quantity === 0;
                
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-950 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span className="font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300">{p.category}</span>
                        {p.batchNumber && <span>Batch: {p.batchNumber}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <div className="text-neutral-900 dark:text-neutral-300 font-bold">{p.sku}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Barcode className="h-3 w-3 shrink-0" /> {p.barcode}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 font-bold font-mono text-neutral-700 dark:text-neutral-300">
                        {wh ? wh.code : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-neutral-900 dark:text-white'}`}>
                          {p.quantity.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-neutral-400">Min: {p.minStock} / Max: {p.maxStock}</span>
                        {isOut && (
                          <span className="mt-1 text-[9px] font-bold bg-red-100 text-red-800 px-1.5 py-0.2 rounded dark:bg-red-950/30 dark:text-red-400">Out Of Stock</span>
                        )}
                        {isLow && (
                          <span className="mt-1 text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded dark:bg-amber-950/30 dark:text-amber-400">Low Stock Buffer</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-neutral-900 dark:text-white">Sell: ₹{p.sellingPrice.toFixed(2)}</div>
                      <div className="text-[10px] text-neutral-400">Cost: ₹{p.buyingPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-neutral-800 dark:text-neutral-200 font-medium">{p.location}</div>
                      <div className="text-[9px] text-neutral-400">Shelf allocation</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setActiveProduct(p);
                            setIsQRModalOpen(true);
                          }}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                          title="Generate QR Label"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400"
                          title="Edit Stock / Record"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {canModify && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you absolutely sure you want to delete SKU: ${p.sku}?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
                            title="Delete Stock"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400 dark:text-neutral-600 font-medium">
                    No matching products found. Refine your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR label overlay modal */}
      {isQRModalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-96 text-center shadow-2xl relative">
            <button 
              onClick={() => setIsQRModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Smart Inventory Label</h3>
            <p className="text-xs text-neutral-400 mb-6">Affix generated tag to shelf box or plastic envelope bin.</p>

            {/* QR Visual */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center gap-3">
              <div className="bg-white p-3 rounded-lg shadow-xs flex items-center justify-center">
                {/* SVG mock QR code */}
                <svg className="w-36 h-36" viewBox="0 0 100 100">
                  <rect x="0" y="0" width="100" height="100" fill="#fff" />
                  {/* Position markers */}
                  <rect x="5" y="5" width="25" height="25" fill="#000" />
                  <rect x="10" y="10" width="15" height="15" fill="#fff" />
                  <rect x="13" y="13" width="9" height="9" fill="#000" />

                  <rect x="70" y="5" width="25" height="25" fill="#000" />
                  <rect x="75" y="10" width="15" height="15" fill="#fff" />
                  <rect x="78" y="13" width="9" height="9" fill="#000" />

                  <rect x="5" y="70" width="25" height="25" fill="#000" />
                  <rect x="10" y="75" width="15" height="15" fill="#fff" />
                  <rect x="13" y="78" width="9" height="9" fill="#000" />

                  {/* Alignment marker */}
                  <rect x="75" y="75" width="10" height="10" fill="#000" />
                  <rect x="78" y="78" width="4" height="4" fill="#fff" />

                  {/* Randomized QR pixels */}
                  <rect x="35" y="5" width="5" height="15" fill="#000" />
                  <rect x="45" y="10" width="15" height="5" fill="#000" />
                  <rect x="35" y="25" width="10" height="10" fill="#000" />
                  <rect x="55" y="20" width="10" height="15" fill="#000" />
                  
                  <rect x="5" y="35" width="15" height="5" fill="#000" />
                  <rect x="25" y="35" width="10" height="15" fill="#000" />
                  <rect x="40" y="40" width="20" height="5" fill="#000" />
                  <rect x="70" y="35" width="25" height="5" fill="#000" />

                  <rect x="5" y="55" width="15" height="10" fill="#000" />
                  <rect x="45" y="50" width="10" height="20" fill="#000" />
                  <rect x="60" y="55" width="15" height="5" fill="#000" />
                  <rect x="80" y="50" width="15" height="15" fill="#000" />

                  <rect x="35" y="70" width="5" height="15" fill="#000" />
                  <rect x="55" y="80" width="15" height="10" fill="#000" />
                  <rect x="75" y="70" width="5" height="5" fill="#000" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{activeProduct.name}</div>
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{activeProduct.sku}</div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2">{activeProduct.location}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Print Barcode Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overflow-y-auto py-8">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-2xl shadow-2xl relative my-auto">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Create New Catalog Record</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Copper Connection Bushing"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Hardware Alloys">Hardware Alloys</option>
                    <option value="Plastics">Plastics</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Packing Cargo">Packing Cargo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">SKU (Auto-Generated if blank)</label>
                  <input
                    type="text"
                    placeholder="e.g. PRD-COP-BUSH99"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Barcode (Auto-Generated if blank)</label>
                  <input
                    type="text"
                    placeholder="e.g. 4006381299"
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Initial In-Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Min Stock Threshold *</label>
                  <input
                    type="number"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Max Stock Threshold *</label>
                  <input
                    type="number"
                    required
                    value={formData.maxStock}
                    onChange={(e) => setFormData({...formData, maxStock: parseInt(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Buying Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({...formData, buyingPrice: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Assigned Warehouse *</label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({...formData, warehouseId: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Specific Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zone A-Shelf 4-Bin C"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Supplier Account *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Material specs, certifications, storage restrictions..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-850">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product & Stock Adjustment Modal */}
      {isEditOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs overflow-y-auto py-8">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-2xl shadow-2xl relative my-auto">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Modify Catalog Record: {activeProduct.sku}</h3>
            <p className="text-xs text-neutral-400 mb-6">Change descriptive metadata or run automated ledger audits for stock counts.</p>

            {/* QUICK Stock Adjustment Panel */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 mb-6">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-3">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin-slow" /> Rapid Stock Adjustment Engine
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Current physical count: <span className="text-sm font-bold text-neutral-900 dark:text-white">{activeProduct.quantity} units</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setAdjustAmount(prev => prev - 10)}
                    className="p-1 rounded bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    -10
                  </button>
                  <input
                    type="number"
                    placeholder="Qty Change"
                    value={adjustAmount || ''}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                    className="w-16 p-1 text-center font-bold text-neutral-900 bg-white border border-neutral-200 rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                  <button 
                    type="button" 
                    onClick={() => setAdjustAmount(prev => prev + 10)}
                    className="p-1 rounded bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    +10
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Audit reason (e.g., damaged box)"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full p-1.5 text-xs bg-white border border-neutral-200 rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2">
                * Note: Registering an adjustment will append a real-time Audit Log tracking entry with your IP signature.
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Hardware Alloys">Hardware Alloys</option>
                    <option value="Plastics">Plastics</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Packing Cargo">Packing Cargo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">SKU Code</label>
                  <input
                    type="text"
                    disabled
                    value={formData.sku}
                    className="w-full p-2 rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Barcode Code</label>
                  <input
                    type="text"
                    disabled
                    value={formData.barcode}
                    className="w-full p-2 rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Min Stock Threshold *</label>
                  <input
                    type="number"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Max Stock Threshold *</label>
                  <input
                    type="number"
                    required
                    value={formData.maxStock}
                    onChange={(e) => setFormData({...formData, maxStock: parseInt(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Buying Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({...formData, buyingPrice: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Specific Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Product Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-850">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Simulator Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setIsBulkOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Bulk Logistics Import Engine</h3>
            <p className="text-xs text-neutral-400 mb-6">Parse large external supplier inventory files instantly.</p>

            <div className="flex gap-4 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <button
                type="button"
                onClick={() => setBulkFileType('csv')}
                className={`text-xs font-semibold flex items-center gap-1.5 pb-1 border-b-2 ${bulkFileType === 'csv' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-neutral-400'}`}
              >
                <FileCode className="h-4 w-4" /> CSV Template
              </button>
              <button
                type="button"
                onClick={() => setBulkFileType('excel')}
                className={`text-xs font-semibold flex items-center gap-1.5 pb-1 border-b-2 ${bulkFileType === 'excel' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-neutral-400'}`}
              >
                <FileSpreadsheet className="h-4 w-4" /> Excel/XLS Simulator
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-lg font-mono text-[10px] text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                <div>Header Layout:</div>
                <div className="font-bold text-neutral-700 dark:text-neutral-300 mt-1">ProductName,Category,Quantity,BuyingCost,SellingPrice</div>
                <div className="mt-2 text-[9px] text-neutral-400">
                  Example Row:<br/>
                  Steel Bracket Premium,Raw Materials,200,4.50,12.00<br/>
                  Copper Terminal Pin,Electronics,1200,0.40,1.90
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-semibold">Paste raw CSV contents below:</label>
                <textarea
                  rows={5}
                  value={bulkFileContent}
                  onChange={(e) => setBulkFileContent(e.target.value)}
                  placeholder="Paste multi-row CSV text here..."
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/50">
                <Info className="h-4 w-4 shrink-0" />
                <span>Default settings will allocate these items to {warehouses[0]?.code} Zone B automatically.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsBulkOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVImport}
                  disabled={!bulkFileContent.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  Parse & Ingest Bulk Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Simulator Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => {
                setIsScannerOpen(false);
                setScannedCode('');
                setScanResult(null);
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Simulated Barcode Scanner</h3>
            <p className="text-xs text-neutral-400 mb-6">Scan or input an item SKU or Barcode sequence directly to query live database records.</p>

            <form onSubmit={handleScannerSubmit} className="space-y-4 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter SKU (e.g., PRD-MCH-COREX4) or Barcode..."
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  className="flex-1 p-2.5 rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white font-mono text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Locate SKU
                </button>
              </div>

              {/* Laser Line Simulating Active Camera Scanner */}
              <div className="relative h-28 bg-neutral-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-neutral-800">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>
                <div className="opacity-10 pointer-events-none select-none">
                  {drawBarcodeSVG('4006381333')}
                </div>
                <span className="absolute bottom-2 text-[9px] font-mono tracking-widest text-neutral-500">LASER APERTURE OPTICAL SENSOR ACTIVE</span>
              </div>

              {/* Scanning Results Display */}
              {scanResult ? (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-800 dark:text-green-400 text-sm">{scanResult.name}</span>
                    <span className="font-mono text-[10px] bg-green-100 text-green-900 px-2 py-0.5 rounded font-bold dark:bg-green-900/40 dark:text-green-300">SKU FOUND</span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-neutral-600 dark:text-neutral-400">
                    <div>SKU Number: <span className="font-mono text-neutral-900 dark:text-white font-semibold">{scanResult.sku}</span></div>
                    <div>Stock Count: <span className="text-neutral-900 dark:text-white font-bold">{scanResult.quantity} units</span></div>
                    <div>Specific Bin: <span className="text-neutral-900 dark:text-white font-semibold font-mono text-[11px]">{scanResult.location}</span></div>
                    <div>Buying Price: <span className="text-neutral-900 dark:text-white font-semibold">₹{scanResult.buyingPrice.toFixed(2)}</span></div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-green-200/50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsScannerOpen(false);
                        handleOpenEdit(scanResult);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-700 text-white hover:bg-green-800"
                    >
                      Audit / Adjust Stock
                    </button>
                  </div>
                </div>
              ) : scannedCode && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 text-center text-xs text-red-800 dark:text-red-400">
                  No matching SKU or Barcode found in inventory records.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
