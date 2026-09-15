import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Truck,
  Box,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Printer,
  RefreshCw,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { OrderItem } from '../types';
import { playScannerBeep } from '../components/AudioBeep';

interface OrdersViewProps {
  orders: OrderItem[];
  initialFilter?: string;
  onOpenAddOrder: () => void;
  onSelectOrder: (order: OrderItem) => void;
  onStockoutBatchResolve: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  initialFilter = '全部',
  onOpenAddOrder,
  onSelectOrder,
  onStockoutBatchResolve,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('全部');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Type Tab filter
      if (activeTab === '代发订单' && o.type !== '代发订单') return false;
      if (activeTab === '头程订单' && o.type !== '头程订单') return false;
      if (activeTab === '换标中转' && o.type !== '换标中转') return false;
      if (activeTab === '缺货异常' && o.status !== '缺货异常') return false;

      // Status filter
      if (selectedStatus !== '全部' && o.status !== selectedStatus) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          o.orderNo.toLowerCase().includes(q) ||
          o.sku.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.recipientName.toLowerCase().includes(q) ||
          (o.trackingNo && o.trackingNo.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [orders, activeTab, selectedStatus, searchQuery]);

  const stockoutCount = orders.filter((o) => o.status === '缺货异常').length;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: 0 };
    const scopeOrders =
      activeTab === '全部'
        ? orders
        : activeTab === '缺货异常'
        ? orders.filter((o) => o.status === '缺货异常')
        : orders.filter((o) => o.type === activeTab);

    counts['全部'] = scopeOrders.length;
    scopeOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders, activeTab]);

  const statusConfig = [
    { id: '全部', label: '全部状态', dotColor: 'bg-slate-400' },
    { id: '待打单', label: '待打单', dotColor: 'bg-amber-500' },
    { id: '待打包', label: '待打包', dotColor: 'bg-blue-500' },
    { id: '已发货', label: '已发货', dotColor: 'bg-emerald-500' },
    { id: '缺货异常', label: '缺货异常', dotColor: 'bg-rose-500', activeColor: 'bg-rose-600' },
    { id: '运输中', label: '运输中', dotColor: 'bg-indigo-500' },
    { id: '待入库', label: '待入库', dotColor: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-3 pb-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="order-search-input"
              type="text"
              placeholder="搜索订单号 / SKU / 运单号 / 买家姓名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            id="order-add-btn"
            onClick={onOpenAddOrder}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs"
            title="手动建单 / 批量导入"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Order Type and Status Dropdown Selects */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {/* 1. 订单类型下拉菜单 (Order Type Select) */}
          <div className="relative">
            <select
              id="order-select-type"
              value={activeTab}
              onChange={(e) => {
                playScannerBeep('click');
                setActiveTab(e.target.value);
              }}
              className={`w-full appearance-none pl-2.5 pr-7 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all cursor-pointer truncate ${
                activeTab === '缺货异常'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700 font-bold focus:border-rose-500'
                  : activeTab !== '全部'
                  ? 'bg-blue-50 border border-blue-200 text-blue-700 font-semibold focus:border-blue-500'
                  : 'bg-slate-50 border border-slate-200/90 text-slate-700 hover:bg-slate-100/70 focus:border-blue-500 focus:bg-white'
              }`}
            >
              <option value="全部">全部订单类型</option>
              <option value="代发订单">一件代发</option>
              <option value="头程订单">头程入库</option>
              <option value="换标中转">换标中转</option>
              <option value="缺货异常">⚠️ 缺货拦截 ({stockoutCount})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 2. 订单业务状态下拉菜单 (Order Status Select) */}
          <div className="relative">
            <select
              id="order-select-status"
              value={selectedStatus}
              onChange={(e) => {
                playScannerBeep('click');
                setSelectedStatus(e.target.value);
              }}
              className={`w-full appearance-none pl-2.5 pr-7 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all cursor-pointer truncate ${
                selectedStatus === '缺货异常'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700 font-bold focus:border-rose-500'
                  : selectedStatus === '待打单' || selectedStatus === '待打包'
                  ? 'bg-amber-50 border border-amber-200 text-amber-700 font-bold focus:border-amber-500'
                  : selectedStatus === '已发货'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold focus:border-emerald-500'
                  : selectedStatus !== '全部'
                  ? 'bg-blue-50 border border-blue-200 text-blue-700 font-semibold focus:border-blue-500'
                  : 'bg-slate-50 border border-slate-200/90 text-slate-700 hover:bg-slate-100/70 focus:border-blue-500 focus:bg-white'
              }`}
            >
              <option value="全部">全部业务状态</option>
              <option value="待打单">待打单 ({statusCounts['待打单'] || 0})</option>
              <option value="待打包">待打包 ({statusCounts['待打包'] || 0})</option>
              <option value="已发货">已发货 ({statusCounts['已发货'] || 0})</option>
              <option value="缺货异常">⚠️ 缺货异常 ({statusCounts['缺货异常'] || 0})</option>
              <option value="运输中">运输中 ({statusCounts['运输中'] || 0})</option>
              <option value="待入库">待入库 ({statusCounts['待入库'] || 0})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stockout Batch Processing Notice Bar (Module 4 缺货订单聚合处理) */}
      {(activeTab === '缺货异常' || selectedStatus === '缺货异常') && stockoutCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-red-800">缺货订单聚合处理中心</div>
              <div className="text-[10px] text-red-600">当前有 {stockoutCount} 笔急发订单缺货截留</div>
            </div>
          </div>
          <button
            id="order-stockout-batch-btn"
            onClick={() => {
              playScannerBeep('success');
              onStockoutBatchResolve();
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            一键批量补货/改单
          </button>
        </div>
      )}

      {/* Orders List Cards */}
      <div className="space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
            <Box className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">暂无符合条件的订单记录</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              id={`order-card-${order.id}`}
              onClick={() => {
                playScannerBeep('click');
                onSelectOrder(order);
              }}
              className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-all cursor-pointer hover:shadow-md ${
                order.status === '缺货异常'
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-slate-100 hover:border-blue-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                    {order.type}
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-800">
                    {order.orderNo}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    order.status === '缺货异常'
                      ? 'bg-red-100 text-red-700'
                      : order.status === '待打包'
                      ? 'bg-amber-100 text-amber-700'
                      : order.status === '已发货'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Product info */}
              <div className="py-2.5 flex gap-3">
                <img
                  src={order.productImg}
                  alt={order.productName}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {order.productName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[11px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                      {order.sku}
                    </span>
                    <span className="text-xs font-bold text-slate-700">x{order.quantity}</span>
                    <span className="text-[10px] text-slate-400">({order.warehouse})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>买家: {order.recipientName} ({order.recipientCountry})</span>
                    <span className="font-semibold text-slate-700">${order.declaredValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer status / tracking */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{order.createdAt}</span>
                  {order.trackingNo && (
                    <span className="font-mono text-blue-600 font-medium">· {order.trackingNo}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-blue-600 font-medium hover:underline">
                  <span>详情追踪</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
