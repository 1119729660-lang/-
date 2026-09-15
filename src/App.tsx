/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_METRICS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_PRODUCTS,
  INITIAL_BILLS,
  INITIAL_APPROVALS,
  INITIAL_WORK_ORDERS,
  INITIAL_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
} from './mockData';
import {
  TabType,
  StoreAccount,
  OrderItem,
  InventoryItem,
  ProductItem,
  BillItem,
  ApprovalItem,
  WorkOrderItem,
  MessageItem,
} from './types';
import { HomeWorkbench } from './views/HomeWorkbench';
import { OrdersView } from './views/OrdersView';
import { InventoryView } from './views/InventoryView';
import { MessagesApprovalsView } from './views/MessagesApprovalsView';
import { FinanceProfileView } from './views/FinanceProfileView';
import { ScanModal } from './components/ScanModal';
import { BluetoothPrintModal } from './components/BluetoothPrintModal';
import { RechargeModal } from './components/RechargeModal';
import { AddOrderModal } from './components/AddOrderModal';
import { WorkOrderModal } from './components/WorkOrderModal';
import { StoreSwitcherModal } from './components/StoreSwitcherModal';
import { LoginModal } from './components/LoginModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ApprovalModal } from './components/ApprovalModal';
import { ExportArtboardModal } from './components/ExportArtboardModal';
import { playScannerBeep } from './components/AudioBeep';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Bell,
  Wallet,
  MoreHorizontal,
  CircleDot,
  Signal,
  Wifi,
  Battery,
  Smartphone,
  Maximize2,
  Minimize2,
  Warehouse,
  Download,
} from 'lucide-react';

export default function App() {
  // Global State
  const [accounts, setAccounts] = useState<StoreAccount[]>(INITIAL_ACCOUNTS);
  const [currentAccount, setCurrentAccount] = useState<StoreAccount>(INITIAL_ACCOUNTS[0]);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [bills, setBills] = useState<BillItem[]>(INITIAL_BILLS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>(INITIAL_WORK_ORDERS);
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [announcements] = useState(INITIAL_ANNOUNCEMENTS);

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('workbench');
  const [ordersFilter, setOrdersFilter] = useState<string>('全部');
  const [inventoryFilter, setInventoryFilter] = useState<string>('全部');
  const [messagesSubTab, setMessagesSubTab] = useState<'messages' | 'approvals' | 'workorders'>('messages');
  const [financeSubTab, setFinanceSubTab] = useState<'finance' | 'reports' | 'profile'>('finance');

  // Modals
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printTargetItem, setPrintTargetItem] = useState<InventoryItem | ProductItem | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState(false);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderItem | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductItem | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [inventorySubTab, setInventorySubTab] = useState<'inventory' | 'products'>('inventory');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const mobileContainerRef = useRef<HTMLDivElement | null>(null);

  // Desktop Mobile Frame Toggle
  const [isFrameMode, setIsFrameMode] = useState(true);

  // Dynamic Badges
  const unreadMsgCount = messages.filter((m) => !m.isRead).length;
  const pendingApprovalCount = approvals.filter((a) => a.status === '待我审批').length;
  const stockoutCount = orders.filter((o) => o.status === '缺货异常').length;
  const pendingPackCount = orders.filter((o) => o.status === '待打包').length;
  const pendingReconcileCount = bills.filter((b) => b.status === '待核销').length;

  const todoCounts = {
    stockout: stockoutCount,
    pendingApproval: pendingApprovalCount,
    pendingPack: pendingPackCount,
    pendingReconcile: pendingReconcileCount,
  };

  // Tab Navigation with Filter Helper
  const handleNavigateTab = (tab: TabType, filter?: string) => {
    playScannerBeep('click');
    setActiveTab(tab);
    if (tab === 'orders' && filter) {
      setOrdersFilter(filter);
    } else if (tab === 'inventory') {
      if (filter === '产品中心' || filter === '产品详情') {
        setInventorySubTab('products');
      } else {
        setInventorySubTab('inventory');
      }
      if (filter) setInventoryFilter(filter);
    } else if (tab === 'messages') {
      if (filter === '审批中心') setMessagesSubTab('approvals');
      else if (filter === '待办汇总') setMessagesSubTab('messages');
      else if (filter === '服务工单') setMessagesSubTab('workorders');
    } else if (tab === 'finance') {
      if (filter === '待核销') setFinanceSubTab('finance');
    }
  };

  // Handlers
  const handleAddOrder = (newOrder: OrderItem) => {
    setOrders((prev) => [newOrder, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      todayOrders: prev.todayOrders + 1,
    }));
  };

  const handleStockoutBatchResolve = () => {
    setOrders((prev) =>
      prev.map((o) => (o.status === '缺货异常' ? { ...o, status: '待打包' } : o))
    );
    setMetrics((prev) => ({ ...prev, stockoutSkuCount: 0 }));
    alert('已对所有截留缺货订单执行【空运紧急补货调拨】，状态已自动流转为待打包！');
  };

  const handleStockoutResolve = (orderId: string, action: 'reorder' | 'substitute') => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: '待打包',
              productName: action === 'substitute' ? `${o.productName} (已换替代款)` : o.productName,
            }
          : o
      )
    );
  };

  const handleAddProduct = (newProd: ProductItem) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleRechargeSuccess = (amount: number, currency: string) => {
    setMetrics((prev) => {
      if (currency === 'USD') {
        return { ...prev, balanceUSD: prev.balanceUSD + amount };
      } else if (currency === 'CNY') {
        return { ...prev, balanceCNY: prev.balanceCNY + amount };
      }
      return { ...prev, balanceUSD: prev.balanceUSD + amount * 1.08 };
    });
  };

  const handleReconcileBill = (billId: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;

    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, status: '已核销' } : b))
    );

    setMetrics((prev) => ({
      ...prev,
      balanceUSD: Math.max(0, prev.balanceUSD - targetBill.amount),
    }));
  };

  const handleApprovalAction = (
    id: string,
    decision: '已通过' | '已驳回',
    remarks: string
  ) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: decision, notes: remarks || a.notes } : a))
    );
  };

  const handleCreateWorkOrder = (newWO: WorkOrderItem) => {
    setWorkOrders((prev) => [newWO, ...prev]);
  };

  const handleMarkAllMessagesRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    playScannerBeep('success');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-4 font-sans antialiased select-none">
      {/* Frame Mode Toggle Bar (Desktop floating tool) */}
      <aside aria-label="Desktop Controls" className="hidden md:flex items-center gap-3 mb-3 bg-slate-900/90 text-white px-4 py-2 rounded-full border border-slate-800 shadow-lg text-xs z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200">易境通 · 移动海外仓App</span>
        </div>
        <span className="text-slate-600">|</span>
        <button
          id="app-toggle-frame-mode"
          onClick={() => setIsFrameMode(!isFrameMode)}
          className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
        >
          {isFrameMode ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>切换全屏预览</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>切换手机真机壳</span>
            </>
          )}
        </button>
        <span className="text-slate-600">|</span>
        <button
          id="app-quick-scan-trigger"
          onClick={() => {
            playScannerBeep('click');
            setIsScanOpen(true);
          }}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          PDA扫码器
        </button>
        <span className="text-slate-600">|</span>
        <button
          id="app-quick-login-trigger"
          onClick={() => {
            playScannerBeep('click');
            setIsLoginModalOpen(true);
          }}
          className="text-emerald-400 hover:text-emerald-300 font-medium"
        >
          企微/Face ID登录
        </button>
        <span className="text-slate-600">|</span>
        <button
          id="app-quick-export-trigger"
          onClick={() => {
            playScannerBeep('click');
            setIsExportModalOpen(true);
          }}
          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30"
          title="导出 1:1 像素级透明底切图与高清画板"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出 1:1 切图/画板</span>
        </button>
      </aside>

      {/* Main Mobile App Container */}
      <div
        ref={mobileContainerRef}
        data-mobile-root="true"
        className={`w-full bg-slate-100 flex flex-col transition-all duration-300 relative overflow-hidden ${
          isFrameMode
            ? 'max-w-[420px] h-[100vh] md:h-[870px] md:rounded-[44px] md:shadow-[0_25px_70px_rgba(0,0,0,0.6)] md:border-[10px] md:border-slate-850'
            : 'max-w-md min-h-screen shadow-2xl'
        }`}
      >
        {/* Dynamic Island / Top Notch (for authentic phone feel) */}
        {isFrameMode && (
          <div className="hidden md:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 pointer-events-none"></div>
        )}

        {/* 1. iOS / WeCom Mobile Status Bar (Module 1 顶栏) */}
        <div className="bg-blue-600 text-white px-5 pt-3 pb-1 flex items-center justify-between text-xs z-30 shrink-0">
          <span className="font-semibold tracking-wider font-mono text-[13px]">10:15</span>

          <div className="flex items-center gap-1.5 opacity-95">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5 ml-0.5" />
            <div className="flex items-center ml-1">
              <span className="text-[10px] mr-1 font-mono">98%</span>
              <Battery className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 2. Tencent Data / WeCom Brand Header (like the uploaded screenshot image.png) */}
        <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between z-30 shrink-0 shadow-sm">
          {/* App Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              易
            </div>
            <h1 className="font-bold text-base tracking-wide flex items-center gap-1">
              <span>易境通</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-normal">ERP</span>
            </h1>
          </div>

          {/* WeChat Capsule Buttons (··· and ⊙) from screenshot */}
          <div className="flex items-center bg-black/20 border border-white/20 rounded-full px-2.5 py-1 gap-2.5 text-white/90 backdrop-blur-xs">
            <button
              id="wechat-capsule-more-btn"
              onClick={() => setIsLoginModalOpen(true)}
              className="hover:text-white transition-colors"
              title="更多 / 企微登录"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="w-px h-3 bg-white/30"></div>
            <button
              id="wechat-capsule-close-btn"
              onClick={() => setIsStoreSwitcherOpen(true)}
              className="hover:text-white transition-colors"
              title="切换店铺"
            >
              <CircleDot className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-3.5 space-y-3 relative z-10 no-scrollbar">
          {activeTab === 'workbench' && (
            <HomeWorkbench
              currentAccount={currentAccount}
              metrics={metrics}
              todoCount={todoCounts}
              announcements={announcements}
              onNavigateTab={handleNavigateTab}
              onOpenScan={() => setIsScanOpen(true)}
              onOpenPrint={() => {
                setPrintTargetItem(inventory[0]);
                setIsPrintOpen(true);
              }}
              onOpenRecharge={() => setIsRechargeOpen(true)}
              onOpenAddOrder={() => setIsAddOrderOpen(true)}
              onOpenWorkOrder={() => setIsWorkOrderOpen(true)}
              onOpenStoreSwitcher={() => setIsStoreSwitcherOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              initialFilter={ordersFilter}
              onOpenAddOrder={() => setIsAddOrderOpen(true)}
              onSelectOrder={(ord) => setSelectedOrderDetail(ord)}
              onStockoutBatchResolve={handleStockoutBatchResolve}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              products={products}
              initialSubTab={inventorySubTab}
              initialFilter={inventoryFilter}
              onOpenScan={() => setIsScanOpen(true)}
              onOpenPrint={(item) => {
                setPrintTargetItem(item || inventory[0]);
                setIsPrintOpen(true);
              }}
              onOpenWorkOrderWithSku={(sku) => {
                setIsWorkOrderOpen(true);
              }}
              onAddNewProduct={handleAddProduct}
              onSelectProduct={(prod) => setSelectedProductDetail(prod)}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesApprovalsView
              messages={messages}
              approvals={approvals}
              workOrders={workOrders}
              orders={orders}
              initialSubTab={messagesSubTab}
              onMarkAllRead={handleMarkAllMessagesRead}
              onNavigateTab={handleNavigateTab}
              onSelectApproval={(appr) => setSelectedApproval(appr)}
              onOpenCreateWorkOrder={() => setIsWorkOrderOpen(true)}
              onOpenOrderDetail={(ord) => setSelectedOrderDetail(ord)}
              onOpenRecharge={() => setIsRechargeOpen(true)}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceProfileView
              currentAccount={currentAccount}
              metrics={metrics}
              bills={bills}
              initialSubTab={financeSubTab}
              onOpenRecharge={() => setIsRechargeOpen(true)}
              onReconcileBill={handleReconcileBill}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onOpenStoreSwitcher={() => setIsStoreSwitcherOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}
        </main>

        {/* 5. Mobile Bottom Tab Bar (Module 2, 3, 4, 5, 7 底部导航) */}
        <nav aria-label="Mobile Navigation" className="bg-white border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around z-30 shrink-0 shadow-lg">
          {/* Tab 1: Workbench */}
          <button
            id="nav-tab-workbench"
            onClick={() => {
              playScannerBeep('click');
              setActiveTab('workbench');
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              activeTab === 'workbench' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 mb-0.5 ${activeTab === 'workbench' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[11px] leading-tight">工作台</span>
          </button>

          {/* Tab 2: Orders */}
          <button
            id="nav-tab-orders"
            onClick={() => {
              playScannerBeep('click');
              setActiveTab('orders');
              setOrdersFilter('全部');
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              activeTab === 'orders' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 mb-0.5 ${activeTab === 'orders' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[11px] leading-tight">订单</span>
            {stockoutCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {stockoutCount}
              </span>
            )}
          </button>

          {/* Tab 3: Inventory */}
          <button
            id="nav-tab-inventory"
            onClick={() => {
              playScannerBeep('click');
              setActiveTab('inventory');
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              activeTab === 'inventory' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Boxes className={`w-5 h-5 mb-0.5 ${activeTab === 'inventory' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[11px] leading-tight">库存品</span>
          </button>

          {/* Tab 4: Messages & Approvals */}
          <button
            id="nav-tab-messages"
            onClick={() => {
              playScannerBeep('click');
              setActiveTab('messages');
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              activeTab === 'messages' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bell className={`w-5 h-5 mb-0.5 ${activeTab === 'messages' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[11px] leading-tight">待办</span>
            {unreadMsgCount + pendingApprovalCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadMsgCount + pendingApprovalCount}
              </span>
            )}
          </button>

          {/* Tab 5: Finance & Profile */}
          <button
            id="nav-tab-finance"
            onClick={() => {
              playScannerBeep('click');
              setActiveTab('finance');
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              activeTab === 'finance' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wallet className={`w-5 h-5 mb-0.5 ${activeTab === 'finance' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[11px] leading-tight">我的</span>
          </button>
        </nav>

        {/* 6. iOS Home Indicator Gesture Bar (like native iPhone bottom bar in screenshot) */}
        <div className="bg-white pb-2 pt-1 flex justify-center shrink-0">
          <div className="w-32 h-1 bg-slate-800/40 rounded-full"></div>
        </div>
      </div>

      {/* Global Modals */}
      {/* Scan Modal */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        inventory={inventory}
        onSelectSku={(sku) => {
          setActiveTab('inventory');
          setInventoryFilter('全部');
        }}
      />

      {/* Bluetooth Label Printer Modal */}
      <BluetoothPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        product={printTargetItem}
      />

      {/* Online Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        currentCurrency={currentAccount.currency}
        onRechargeSuccess={handleRechargeSuccess}
      />

      {/* Add / Import Order Modal */}
      <AddOrderModal
        isOpen={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        inventory={inventory}
        currentStoreName={currentAccount.name}
        onAddOrder={handleAddOrder}
      />

      {/* Create Work Order Modal */}
      <WorkOrderModal
        isOpen={isWorkOrderOpen}
        onClose={() => setIsWorkOrderOpen(false)}
        inventory={inventory}
        orders={orders}
        onCreateWorkOrder={handleCreateWorkOrder}
      />

      {/* Store / Account Switcher Modal */}
      <StoreSwitcherModal
        isOpen={isStoreSwitcherOpen}
        onClose={() => setIsStoreSwitcherOpen(false)}
        currentAccount={currentAccount}
        accounts={accounts}
        onSelectAccount={(acc) => {
          setCurrentAccount(acc);
          alert(`已切换至【${acc.name}】(${acc.defaultWarehouse})`);
        }}
      />

      {/* Multi-Terminal Login / Biometric Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(acc) => {
          setCurrentAccount(acc);
          alert(`🎉 登录成功！欢迎回来，${acc.role}（已自动载入${acc.name}）`);
        }}
        currentAccount={currentAccount}
        accounts={accounts}
      />

      {/* Order Detail & Tracking Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        order={selectedOrderDetail}
        onStockoutResolve={handleStockoutResolve}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={!!selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        product={selectedProductDetail}
        onOpenPrint={(prod) => {
          setPrintTargetItem(prod);
          setIsPrintOpen(true);
        }}
        onOpenWorkOrderWithSku={(sku) => {
          setIsWorkOrderOpen(true);
        }}
      />

      {/* Approval Action Modal */}
      <ApprovalModal
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        approval={selectedApproval}
        onAction={handleApprovalAction}
      />

      {/* Export Artboard & Slices Modal */}
      <ExportArtboardModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        mobileContainerRef={mobileContainerRef}
      />
    </div>
  );
}
