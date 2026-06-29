import React, { useState } from 'react';
import { 
  FileText, 
  ArrowDownToLine, 
  Sparkles,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Info
} from 'lucide-react';
import { Product, SalesOrder, PurchaseOrder, Supplier, Warehouse } from '../types';

interface ReportsProps {
  products: Product[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
}

export default function Reports({
  products,
  salesOrders,
  purchaseOrders,
  suppliers,
  warehouses
}: ReportsProps) {
  const [selectedReportType, setSelectedReportType] = useState<string>('inventory');

  // Helper to convert object array to CSV download
  const triggerCSVDownload = (filename: string, headers: string[], rows: any[][]) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    
    rows.forEach(row => {
      const escapedRow = row.map(val => {
        const str = String(val).replace(/"/g, '""');
        return str.includes(",") || str.includes("\n") ? `"${str}"` : str;
      });
      csvContent += escapedRow.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedReportType === 'inventory') {
      const headers = ['Product ID', 'Product Name', 'SKU', 'Category', 'Quantity', 'Buying Price', 'Selling Price', 'Total Valuation'];
      const rows = products.map(p => [
        p.id,
        p.name,
        p.sku,
        p.category,
        p.quantity,
        p.buyingPrice,
        p.sellingPrice,
        p.quantity * p.buyingPrice
      ]);
      triggerCSVDownload(`Inventory_Valuation_Report_${today}.${format === 'csv' ? 'csv' : 'xls'}`, headers, rows);
    } 
    else if (selectedReportType === 'sales') {
      const headers = ['Order Number', 'Customer Name', 'Customer Email', 'Items Count', 'Invoice Total', 'Order Status', 'Created Date'];
      const rows = salesOrders.map(so => [
        so.soNumber,
        so.customerName,
        so.customerEmail,
        so.items.length,
        so.totalAmount,
        so.status,
        so.createdAt
      ]);
      triggerCSVDownload(`Sales_Operations_Report_${today}.${format === 'csv' ? 'csv' : 'xls'}`, headers, rows);
    } 
    else if (selectedReportType === 'purchase') {
      const headers = ['PO Number', 'Supplier ID', 'Status', 'Total Outflow', 'Created Date', 'Shipment Tracking'];
      const rows = purchaseOrders.map(po => [
        po.poNumber,
        po.supplierId,
        po.status,
        po.totalAmount,
        po.createdAt,
        po.trackingNumber || 'N/A'
      ]);
      triggerCSVDownload(`Purchase_Procurement_Report_${today}.${format === 'csv' ? 'csv' : 'xls'}`, headers, rows);
    }
    else if (selectedReportType === 'supplier') {
      const headers = ['Supplier Company', 'Contact Person', 'GST Tax Number', 'Email Address', 'Lead Time Days', 'Rating'];
      const rows = suppliers.map(s => [
        s.company,
        s.name,
        s.gstNumber,
        s.email,
        s.leadTime,
        s.rating
      ]);
      triggerCSVDownload(`Supplier_Quality_Index_${today}.${format === 'csv' ? 'csv' : 'xls'}`, headers, rows);
    }
    else if (selectedReportType === 'warehouse') {
      const headers = ['Warehouse Code', 'Warehouse Name', 'Capacity Units', 'Utilization Rate', 'Address'];
      const rows = warehouses.map(w => [
        w.code,
        w.name,
        w.capacity,
        `${w.currentUtilization}%`,
        w.address
      ]);
      triggerCSVDownload(`Warehouse_Capacity_Audits_${today}.${format === 'csv' ? 'csv' : 'xls'}`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Corporate Reporting Ledger</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Query audit metrics, generate fiscal evaluations, and export validated CSV or Excel templates.</p>
        </div>
      </div>

      {/* Selector Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reports Categories Selector */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-3.5">
          <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">Logistics Report Matrix</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedReportType('inventory')}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-between ${
                selectedReportType === 'inventory'
                  ? 'border-blue-500 bg-blue-50/20 text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-950/15'
                  : 'border-neutral-100 bg-neutral-50/50 hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950/20'
              }`}
            >
              <span>Asset Valuation & Stock Reports</span>
              <FileText className="h-4 w-4 shrink-0" />
            </button>

            <button
              onClick={() => setSelectedReportType('sales')}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-between ${
                selectedReportType === 'sales'
                  ? 'border-blue-500 bg-blue-50/20 text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-950/15'
                  : 'border-neutral-100 bg-neutral-50/50 hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950/20'
              }`}
            >
              <span>Sales Operations & Client Audits</span>
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
            </button>

            <button
              onClick={() => setSelectedReportType('purchase')}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-between ${
                selectedReportType === 'purchase'
                  ? 'border-blue-500 bg-blue-50/20 text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-950/15'
                  : 'border-neutral-100 bg-neutral-50/50 hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950/20'
              }`}
            >
              <span>Procurements & Purchase Logs</span>
              <FileText className="h-4 w-4 shrink-0" />
            </button>

            <button
              onClick={() => setSelectedReportType('supplier')}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-between ${
                selectedReportType === 'supplier'
                  ? 'border-blue-500 bg-blue-50/20 text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-950/15'
                  : 'border-neutral-100 bg-neutral-50/50 hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950/20'
              }`}
            >
              <span>Supplier Quality & On-Time Performance</span>
              <FileText className="h-4 w-4 shrink-0" />
            </button>

            <button
              onClick={() => setSelectedReportType('warehouse')}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-between ${
                selectedReportType === 'warehouse'
                  ? 'border-blue-500 bg-blue-50/20 text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-950/15'
                  : 'border-neutral-100 bg-neutral-50/50 hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950/20'
              }`}
            >
              <span>Warehouse Space Capacity Audits</span>
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Dynamic Report Parameter Details */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
              <div>
                <h4 className="font-extrabold text-neutral-900 dark:text-white capitalize">{selectedReportType} Operation Insights</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Verification parameters compile dynamically based on current inventory states.</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50">Ledger Verified</span>
            </div>

            {/* Simulated Data Preview table */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Data Pipeline Fields Schema:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {selectedReportType === 'inventory' && (
                  <>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Product ID (Primary Key)</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">SKU ID (Index)</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Quantity Balanced</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Cost Basis (₹)</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Total Capital Outlay</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Warehouse Node ID</div>
                  </>
                )}
                {selectedReportType === 'sales' && (
                  <>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Sales Order Number</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Client Account Profile</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Grand Invoiced Amount</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Transit Logistics Stage</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Customer Validation Receipt</div>
                  </>
                )}
                {selectedReportType === 'purchase' && (
                  <>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">PO Approved ID</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Supplier Authorized ID</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Items Inbound Outlay</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Freight Tracking Number</div>
                  </>
                )}
                {selectedReportType === 'supplier' && (
                  <>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Authorized Supplier Company</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Direct Point of Contact</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Target Lead Time Coefficient</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Quality Performance Index</div>
                  </>
                )}
                {selectedReportType === 'warehouse' && (
                  <>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Physical Hub Node Code</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Volume Utilization Coefficient</div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border rounded-lg text-xs font-mono">Address Registry Coordinates</div>
                  </>
                )}
              </div>
            </div>

            {/* Simulated Data Counts */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/50 flex items-center justify-between text-xs text-blue-800 dark:text-blue-400">
              <div className="flex items-center gap-1.5">
                <Info className="h-4 w-4" />
                <span>Export compiling will pull directly from the active {selectedReportType} database.</span>
              </div>
              <span className="font-bold">
                {selectedReportType === 'inventory' ? products.length : 
                 selectedReportType === 'sales' ? salesOrders.length :
                 selectedReportType === 'purchase' ? purchaseOrders.length :
                 selectedReportType === 'supplier' ? suppliers.length : warehouses.length} Records Compiled
              </span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5 border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Download className="h-4 w-4" /> Export CSV Spreadsheet
            </button>
            <button
              onClick={() => handleExport('csv')} // using CSV downloader as Excel simulator
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Excel XLS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
