import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  Warehouse, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Bot, 
  Bell, 
  Sun, 
  Moon,
  ChevronDown,
  LogOut,
  Sparkles
} from 'lucide-react';

import { 
  INITIAL_PRODUCTS, 
  INITIAL_WAREHOUSES, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_SALES_ORDERS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_USERS 
} from './data/mockData';

import { 
  Product, 
  Warehouse as WarehouseType, 
  Supplier, 
  PurchaseOrder, 
  SalesOrder, 
  AuditLog, 
  SystemNotification, 
  User, 
  UserRole,
  POStatus,
  SOStatus
} from './types';

import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Warehouses from './components/Warehouses';
import Suppliers from './components/Suppliers';
import Orders from './components/Orders';
import Forecasting from './components/Forecasting';
import StockMonitor from './components/StockMonitor';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import AIAssistant from './components/AIAssistant';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>(INITIAL_WAREHOUSES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Active state
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Alexander Wright, Super Admin
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  // Helper to generate next IDs
  const getNextId = (prefix: string, array: any[]) => {
    const ids = array.map(item => parseInt(item.id.replace(prefix + '-', ''))).filter(n => !isNaN(n));
    const max = ids.length > 0 ? Math.max(...ids) : 0;
    return `${prefix}-${max + 1}`;
  };

  // Helper to post an immutable audit log
  const logAction = (action: string, details: string, oldValue = '-', newValue = '-') => {
    const newLog: AuditLog = {
      id: getNextId('log', auditLogs),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      oldValue,
      newValue,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 90)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Notification poster
  const postNotification = (title: string, message: string, type: 'warning' | 'danger' | 'info' | 'success') => {
    const newNotif: SystemNotification = {
      id: getNextId('n', notifications),
      title,
      message,
      type,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Recalculates dynamic warehouse spaces
  const recalculateWarehouseUtilization = (whs: WarehouseType[], prods: Product[]) => {
    return whs.map(w => {
      const totalInWarehouse = prods.filter(p => p.warehouseId === w.id).reduce((sum, p) => sum + p.quantity, 0);
      const util = Math.min(100, Math.round((totalInWarehouse / w.capacity) * 100));
      return {
        ...w,
        currentUtilization: util
      };
    });
  };

  // ----------------------------------------------------
  // CENTRAL STATE CALLBACKS
  // ----------------------------------------------------

  // Add Product (CRUD)
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'barcode' | 'qrCode'>) => {
    const id = getNextId('p', products);
    const item: Product = {
      ...newProd,
      id,
      barcode: `4006381${Math.floor(100000 + Math.random() * 900000)}`
    };

    const updatedProds = [...products, item];
    setProducts(updatedProds);
    
    // Auto-update spatial levels
    setWarehouses(prev => recalculateWarehouseUtilization(prev, updatedProds));

    logAction('CREATE_PRODUCT', `Added SKU: ${item.sku} (${item.name})`, '-', `Qty: ${item.quantity}`);
    postNotification('Catalog Update', `Product ${item.name} has been onboarded into physical storage.`, 'success');
  };

  // Edit Product (CRUD)
  const handleEditProduct = (editedProd: Product) => {
    const old = products.find(p => p.id === editedProd.id);
    const updatedProds = products.map(p => p.id === editedProd.id ? editedProd : p);
    setProducts(updatedProds);
    setWarehouses(prev => recalculateWarehouseUtilization(prev, updatedProds));

    logAction('EDIT_PRODUCT', `Updated specifications for ${editedProd.name}`, `SKU: ${old?.sku}`, `SKU: ${editedProd.sku}`);
  };

  // Delete Product (CRUD)
  const handleDeleteProduct = (id: string) => {
    const old = products.find(p => p.id === id);
    const updatedProds = products.filter(p => p.id !== id);
    setProducts(updatedProds);
    setWarehouses(prev => recalculateWarehouseUtilization(prev, updatedProds));

    logAction('DELETE_PRODUCT', `Removed ${old?.name} from active inventory`, `SKU: ${old?.sku}`, '-');
  };

  // Manual Stock Adjustment
  const handleAdjustStock = (productId: string, quantityChange: number, reason: string) => {
    const updatedProds = products.map(p => {
      if (p.id === productId) {
        const nextQty = Math.max(0, p.quantity + quantityChange);
        
        logAction('ADJUST_STOCK', `Stock level adjusted for ${p.name}`, `Qty: ${p.quantity}`, `Qty: ${nextQty}`);
        
        // Expiry or safety warning checks
        if (nextQty <= p.minStock && nextQty > 0) {
          postNotification('Safety stock violated', `${p.name} is approaching zero buffers.`, 'warning');
        } else if (nextQty === 0) {
          postNotification('Stock depleted', `${p.name} is completely out of stock.`, 'danger');
        }

        return { ...p, quantity: nextQty };
      }
      return p;
    });

    setProducts(updatedProds);
    setWarehouses(prev => recalculateWarehouseUtilization(prev, updatedProds));
  };

  // Warehouse Transfer
  const handleTransferStock = (productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, targetLocation: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p || p.quantity < quantity) {
      alert("Transfer cancelled. Insufficient stock in source warehouse.");
      return;
    }

    const updatedProds = products.map(prod => {
      if (prod.id === productId) {
        return {
          ...prod,
          quantity: prod.quantity - quantity // decrement
        };
      }
      return prod;
    });

    // Check if the destination warehouse already has this SKU, else create allocation pointer or add it
    const destinationSkus = products.filter(prod => prod.sku === p.sku && prod.warehouseId === toWarehouseId);
    let finalProds = [...updatedProds];

    if (destinationSkus.length > 0) {
      // already exists, just add quantity
      finalProds = finalProds.map(prod => {
        if (prod.sku === p.sku && prod.warehouseId === toWarehouseId) {
          return {
            ...prod,
            quantity: prod.quantity + quantity
          };
        }
        return prod;
      });
    } else {
      // create split record
      const splitId = getNextId('p', products);
      const newAllocation: Product = {
        ...p,
        id: splitId,
        warehouseId: toWarehouseId,
        quantity: quantity,
        location: targetLocation,
        barcode: `4006381${Math.floor(100000 + Math.random() * 900000)}`
      };
      finalProds.push(newAllocation);
    }

    setProducts(finalProds);
    setWarehouses(prev => recalculateWarehouseUtilization(prev, finalProds));

    const fromWhName = warehouses.find(w => w.id === fromWarehouseId)?.code;
    const toWhName = warehouses.find(w => w.id === toWarehouseId)?.code;

    logAction('TRANSFER_STOCK', `Transferred ${quantity} units of ${p.name}`, `Source: ${fromWhName}`, `Target: ${toWhName}`);
    postNotification('Hub Transfer Complete', `Moved ${quantity} units from ${fromWhName} to ${toWhName}.`, 'info');
  };

  // Add Supplier
  const handleAddSupplier = (newSup: Omit<Supplier, 'id'>) => {
    const id = getNextId('s', suppliers);
    const item: Supplier = {
      ...newSup,
      id
    };
    setSuppliers(prev => [...prev, item]);
    logAction('ONBOARD_SUPPLIER', `Onboarded partner ${item.company}`, '-', `Lead Time: ${item.leadTime} days`);
  };

  // Update PO Delivery Tracking status (from Supplier workspace)
  const handleUpdatePOShipment = (poId: string, status: string, tracking?: string) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        return {
          ...po,
          shipmentStatus: status,
          trackingNumber: tracking || po.trackingNumber
        };
      }
      return po;
    }));
    logAction('UPDATE_SHIPMENT', `Tracking updated for PO`, '-', status);
  };

  // Add Purchase Order
  const handleAddPO = (newPO: Omit<PurchaseOrder, 'id'>) => {
    const id = getNextId('po', purchaseOrders);
    const po: PurchaseOrder = {
      ...newPO,
      id
    };
    setPurchaseOrders(prev => [po, ...prev]);
    logAction('SUBMIT_PO', `Issued purchase procurement order ${po.poNumber}`, '-', `Total Amount: ₹${po.totalAmount}`);
    postNotification('New PO Created', `${po.poNumber} has been submitted for financial approval.`, 'info');
  };

  // Change PO status (workflow engine)
  const handleUpdatePOStatus = (id: string, status: POStatus) => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;

    setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p));
    logAction('PO_WORKFLOW', `PO Status changed for ${po.poNumber}`, po.status, status);

    // If status is RECEIVED, we must automatically increment corresponding product quantities inside the target warehouse!
    if (status === 'Received') {
      let updatedProds = [...products];

      po.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          updatedProds = updatedProds.map(p => {
            if (p.id === item.productId) {
              return {
                ...p,
                quantity: p.quantity + item.quantity
              };
            }
            return p;
          });
        }
      });

      setProducts(updatedProds);
      setWarehouses(prev => recalculateWarehouseUtilization(prev, updatedProds));
      logAction('STOCK_INCREMENT', `Procured items received. Stock balances updated automatically.`, '-', `PO: ${po.poNumber}`);
      postNotification('Procurement Cleared', `Items from ${po.poNumber} have been safely loaded into bins.`, 'success');
    }
  };

  // Add Sales Order (Invoicing client)
  const handleAddSO = (newSO: Omit<SalesOrder, 'id'>) => {
    const id = getNextId('so', salesOrders);
    const so: SalesOrder = {
      ...newSO,
      id
    };

    // Substract quantities from inventory instantly
    let updatedProds = [...products];
    so.items.forEach(item => {
      updatedProds = updatedProds.map(p => {
        if (p.id === item.productId) {
          return {
            ...p,
            quantity: Math.max(0, p.quantity - item.quantity)
          };
        }
        return p;
      });
    });

    setProducts(updatedProds);
    setWarehouses(prev => recalculateWarehouseUtilization(prev, updatedProds));
    setSalesOrders(prev => [so, ...prev]);

    logAction('CREATE_SO', `Issued Client Invoice ${so.soNumber}`, '-', `Invoice total: ₹${so.totalAmount}`);
    postNotification('Sales Order Dispatched', `${so.soNumber} successfully committed to carrier line.`, 'success');
  };

  // Update Sales Order delivery state
  const handleUpdateSOStatus = (id: string, status: SOStatus) => {
    const so = salesOrders.find(s => s.id === id);
    if (!so) return;

    setSalesOrders(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    logAction('SO_WORKFLOW', `Sales Order shipping updated for ${so.soNumber}`, so.status, status);
  };

  // Team Invite
  const handleInviteUser = (newUser: Omit<User, 'id' | 'lastLogin'>) => {
    const id = getNextId('u', users);
    const item: User = {
      ...newUser,
      id,
      lastLogin: 'Never Active'
    };
    setUsers(prev => [...prev, item]);
    logAction('PROVISION_OPERATOR', `Provisioned access for ${item.name}`, '-', `Role: ${item.role}`);
  };

  // Deactivate operators
  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        logAction('TOGGLE_USER_STATUS', `Security Status changed for ${u.name}`, u.status, nextStatus);
        return {
          ...u,
          status: nextStatus
        };
      }
      return u;
    }));
  };

  const handleRoleChange = (roleName: UserRole) => {
    const foundUser = users.find(u => u.role === roleName);
    if (foundUser) {
      setCurrentUser(foundUser);
      logAction('ROLE_IMPERSONATION', `User changed active operator view`, '-', roleName);
    }
  };

  // Quick reorder suggestion trigger
  const handleTriggerReorder = (productId: string, quantity: number) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    
    // Auto-create a PO
    const formattedItems = [{
      productId,
      name: p.name,
      quantity,
      price: p.buyingPrice
    }];
    const total = quantity * p.buyingPrice;
    const orderNum = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    handleAddPO({
      poNumber: orderNum,
      supplierId: p.supplierId,
      status: 'Pending Approval',
      items: formattedItems,
      totalAmount: total,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0a0c]' : 'bg-[#f8f9fa]'}`}>
      
      {/* GLOBAL ENTERPRISE NAV HEADER BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 dark:border-neutral-800 dark:bg-neutral-900/90 backdrop-blur-sm shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-blue-600 text-white p-2 flex items-center justify-center shadow-md">
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-neutral-900 dark:text-white uppercase">Tushar Enterprises</div>
              <div className="text-[10px] text-blue-600 font-bold dark:text-blue-400 leading-none">Smart Supply Chain & SCMS</div>
            </div>
          </div>

          {/* Right utility toolbar */}
          <div className="flex items-center gap-4 text-xs">
            
            {/* RBAC ROLE SELECTOR SIMULATOR */}
            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800 border dark:border-neutral-700/60">
              <span className="text-[10px] text-neutral-500 font-bold uppercase px-1.5 dark:text-neutral-400">View Role:</span>
              <select
                value={currentUser.role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="bg-white dark:bg-neutral-900 dark:text-white rounded px-2 py-1 font-bold text-neutral-800 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Warehouse Manager">Warehouse Manager</option>
                <option value="Supplier">Supplier Partner</option>
                <option value="Inventory Staff">Inventory Staff</option>
                <option value="Finance Manager">Finance Manager</option>
              </select>
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications panel toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg border text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 relative"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xl p-4 z-50">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <span className="font-bold text-neutral-900 dark:text-white">Alerts Queue</span>
                    <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-[10px] text-blue-600 dark:text-blue-400">Mark all read</button>
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div key={n.id} className="text-[11px] p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border dark:border-neutral-800/40">
                        <div className="font-bold text-neutral-850 dark:text-neutral-200">{n.title}</div>
                        <p className="text-neutral-500 mt-0.5 leading-normal">{n.message}</p>
                        <span className="text-[9px] text-neutral-400 block mt-1.5 font-mono">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile widget */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="h-7 w-7 rounded-full object-cover border dark:border-neutral-700" />
                <span className="font-bold text-neutral-800 dark:text-neutral-300 hidden sm:inline">{currentUser.name}</span>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-52 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xl p-2.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b dark:border-neutral-800/60 mb-2">
                    <div className="font-bold text-neutral-900 dark:text-white">{currentUser.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      alert("Corporate Single-Sign On session logout simulated.");
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left p-2 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded text-red-600 flex items-center gap-1.5"
                  >
                    <LogOut className="h-4 w-4" /> Logout SSO Session
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* THREE-COLUMN LAYOUT CONSOLE */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* SIDE BAR NAVIGATION */}
        <nav className="w-full md:w-64 shrink-0 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3.5 block mb-2">Operations Matrix</span>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" /> Operations Dashboard
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <Boxes className="h-4.5 w-4.5" /> Stock Inventory Console
          </button>

          <button
            onClick={() => setActiveTab('warehouses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'warehouses'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <Warehouse className="h-4.5 w-4.5" /> Hubs & Zones Heatmap
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'suppliers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <Users className="h-4.5 w-4.5" /> Supplier Partnerships
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <ShoppingCart className="h-4.5 w-4.5" /> Orders & Invoicing
          </button>

          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3.5 block mt-6 mb-2">Proactive Intelligence</span>

          <button
            onClick={() => setActiveTab('forecasting')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'forecasting'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="h-4.5 w-4.5" /> Predictive Demand
          </button>

          <button
            onClick={() => setActiveTab('stock-monitor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'stock-monitor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <AlertTriangle className="h-4.5 w-4.5" /> Deficit & Buffer Alerts
          </button>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'ai-assistant'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <Bot className="h-4.5 w-4.5 text-blue-500" /> Tushar AI Copilot
          </button>

          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3.5 block mt-6 mb-2">Governance & Audits</span>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="h-4.5 w-4.5" /> Reporting Ledgers
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="h-4.5 w-4.5" /> Security & Admin RBAC
          </button>
        </nav>

        {/* MAIN PANEL VIEW CONTENT */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products}
              warehouses={warehouses}
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              salesOrders={salesOrders}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory 
              products={products}
              warehouses={warehouses}
              suppliers={suppliers}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'warehouses' && (
            <Warehouses 
              products={products}
              warehouses={warehouses}
              onTransferStock={handleTransferStock}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'suppliers' && (
            <Suppliers 
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              onAddSupplier={handleAddSupplier}
              onUpdatePOShipment={handleUpdatePOShipment}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'orders' && (
            <Orders 
              purchaseOrders={purchaseOrders}
              salesOrders={salesOrders}
              products={products}
              suppliers={suppliers}
              onAddPO={handleAddPO}
              onUpdatePOStatus={handleUpdatePOStatus}
              onAddSO={handleAddSO}
              onUpdateSOStatus={handleUpdateSOStatus}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'forecasting' && (
            <Forecasting 
              products={products}
              suppliers={suppliers}
              warehouses={warehouses}
              onTriggerReorder={handleTriggerReorder}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'stock-monitor' && (
            <StockMonitor 
              products={products}
              suppliers={suppliers}
              warehouses={warehouses}
              onTriggerReorder={handleTriggerReorder}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'reports' && (
            <Reports 
              products={products}
              salesOrders={salesOrders}
              purchaseOrders={purchaseOrders}
              suppliers={suppliers}
              warehouses={warehouses}
            />
          )}

          {activeTab === 'security' && (
            <UserManagement 
              users={users}
              auditLogs={auditLogs}
              onInviteUser={handleInviteUser}
              onToggleUserStatus={handleToggleUserStatus}
              userRole={currentUser.role}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AIAssistant 
              products={products}
              suppliers={suppliers}
              warehouses={warehouses}
              onAddProduct={handleAddProduct}
              userRole={currentUser.role}
            />
          )}
        </main>

      </div>
    </div>
  );
}
