import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Wrench,
  ChevronRight,
  Send,
  Plus,
  Filter,
  CheckCheck,
  Copy,
  Check,
  Search,
  ExternalLink,
  Package,
  TrendingUp,
  CreditCard,
  Truck,
  Boxes,
  RotateCcw,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { MessageItem, ApprovalItem, WorkOrderItem, TabType, OrderItem } from '../types';
import { playScannerBeep } from '../components/AudioBeep';

interface MessagesApprovalsViewProps {
  messages: MessageItem[];
  approvals: ApprovalItem[];
  workOrders: WorkOrderItem[];
  orders?: OrderItem[];
  initialSubTab?: 'messages' | 'approvals' | 'workorders';
  onMarkAllRead: () => void;
  onToggleRead?: (id: string) => void;
  onNavigateTab: (tab: TabType, filter?: string) => void;
  onSelectApproval: (item: ApprovalItem) => void;
  onOpenCreateWorkOrder: () => void;
  onOpenOrderDetail?: (order: OrderItem) => void;
  onOpenRecharge?: () => void;
}

export const MessagesApprovalsView: React.FC<MessagesApprovalsViewProps> = ({
  messages,
  approvals,
  workOrders,
  orders = [],
  initialSubTab = 'messages',
  onMarkAllRead,
  onToggleRead,
  onNavigateTab,
  onSelectApproval,
  onOpenCreateWorkOrder,
  onOpenOrderDetail,
  onOpenRecharge,
}) => {
  const [subTab, setSubTab] = useState<'messages' | 'approvals' | 'workorders'>(initialSubTab);
  const [messageCategory, setMessageCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<'待我审批' | '已通过' | '已驳回'>('待我审批');

  const unreadMsgCount = messages.filter((m) => !m.isRead).length;
  const pendingApprovalCount = approvals.filter((a) => a.status === '待我审批').length;
  const activeWorkOrderCount = workOrders.filter((w) => w.status === '处理中').length;

  const categories = [
    '全部',
    '未读',
    '缺货预警',
    '订单状态',
    '头程物流',
    '审核通知',
    '财务账单',
    '服务工单',
    '业务日报',
  ];

  const handleCopy = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    playScannerBeep('success');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleMessageAction = (msg: MessageItem) => {
    playScannerBeep('click');

    // 1. Check if it's order related (e.g. 去处理 / 查看轨迹 / 查看详情)
    if (msg.actionType === 'open_tracking' || msg.actionType === 'open_order' || msg.actionText === '查看轨迹' || msg.actionText === '去处理' || msg.actionText === '查看详情') {
      const matchOrder = orders.find(
        (o) =>
          (msg.relatedOrderId && o.id === msg.relatedOrderId) ||
          (msg.relatedOrderNo && o.orderNo === msg.relatedOrderNo) ||
          (msg.relatedTrackingNo && o.trackingNo === msg.relatedTrackingNo)
      );
      if (matchOrder && onOpenOrderDetail) {
        onOpenOrderDetail(matchOrder);
        return;
      }
      onNavigateTab('orders', msg.actionTargetFilter || (msg.msgType === 'stockout_alert' ? '缺货异常' : undefined));
      return;
    }

    // 2. Recharge action (去充值)
    if (msg.actionType === 'open_recharge' || msg.actionText === '去充值') {
      if (onOpenRecharge) {
        onOpenRecharge();
      } else {
        onNavigateTab('finance');
      }
      return;
    }

    // 3. Work order action (查看工单)
    if (msg.actionType === 'open_workorder' || msg.actionText === '查看工单') {
      setSubTab('workorders');
      return;
    }

    // 4. Approval action (去修改重新提交 / 去审批)
    if (msg.actionType === 'open_approval' || msg.actionText === '去修改重新提交' || msg.actionText === '去审批') {
      setSubTab('approvals');
      return;
    }

    // 5. Navigate to Inventory (查看库存)
    if (msg.actionType === 'navigate_inventory' || msg.actionText === '查看库存') {
      onNavigateTab('inventory');
      return;
    }

    // 6. Navigate to Finance (去核销 / 查看完整报表 / 查看钱包)
    if (msg.actionType === 'navigate_finance' || msg.actionText === '去核销' || msg.actionText === '查看完整报表' || msg.actionText === '查看钱包') {
      onNavigateTab('finance', msg.actionTargetFilter);
      return;
    }

    // 7. General navigation fallback
    if (msg.actionTargetTab) {
      onNavigateTab(msg.actionTargetTab, msg.actionTargetFilter);
    }
  };

  const filteredMessages = messages.filter((m) => {
    // Category filter
    if (messageCategory === '未读') {
      if (m.isRead) return false;
    } else if (messageCategory !== '全部') {
      if (m.category !== messageCategory) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchCategory = m.category.toLowerCase().includes(q);
      const matchSuggestion = m.suggestion?.toLowerCase().includes(q);
      const matchConclusion = m.conclusion?.toLowerCase().includes(q);
      const matchFields = m.fields?.some(
        (f) => f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q)
      );
      const matchContent = m.content?.toLowerCase().includes(q);
      const matchRelated = (m.relatedOrderNo || m.relatedSku || m.relatedBillNo || m.relatedWorkOrderNo || '')
        .toLowerCase()
        .includes(q);

      return matchTitle || matchCategory || matchSuggestion || matchConclusion || matchFields || matchContent || matchRelated;
    }

    return true;
  });

  const filteredApprovals = approvals.filter((a) => a.status === approvalStatusFilter);

  // Helper badge color based on message level and category
  const getBadgeStyle = (msg: MessageItem) => {
    if (msg.level === 'danger') {
      return 'bg-red-50 text-red-600 border border-red-200/80';
    }
    if (msg.level === 'warning') {
      return 'bg-amber-50 text-amber-700 border border-amber-200/80';
    }
    if (msg.level === 'success') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
    }
    return 'bg-blue-50 text-blue-700 border border-blue-200/80';
  };

  const getCardBorder = (_msg: MessageItem) => {
    return 'bg-white border-slate-100 shadow-sm hover:border-slate-200';
  };

  return (
    <div className="space-y-3 pb-6">
      {/* 3-Way Segment Switcher */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1">
        <button
          id="msg-tab-messages-btn"
          onClick={() => {
            playScannerBeep('click');
            setSubTab('messages');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            subTab === 'messages'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>消息通知</span>
          {unreadMsgCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                subTab === 'messages' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
              }`}
            >
              {unreadMsgCount}
            </span>
          )}
        </button>

        <button
          id="msg-tab-approvals-btn"
          onClick={() => {
            playScannerBeep('click');
            setSubTab('approvals');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            subTab === 'approvals'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>审批中心</span>
          {pendingApprovalCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                subTab === 'approvals' ? 'bg-white text-blue-600' : 'bg-amber-500 text-white'
              }`}
            >
              {pendingApprovalCount}
            </span>
          )}
        </button>

        <button
          id="msg-tab-workorders-btn"
          onClick={() => {
            playScannerBeep('click');
            setSubTab('workorders');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            subTab === 'workorders'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>服务工单</span>
          {activeWorkOrderCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                subTab === 'workorders' ? 'bg-white text-blue-600' : 'bg-purple-500 text-white'
              }`}
            >
              {activeWorkOrderCount}
            </span>
          )}
        </button>
      </div>

      {/* SubTab 1: Messages Stream */}
      {subTab === 'messages' && (
        <div className="space-y-3">
          {/* Action & Filter Bar */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-2.5">
            {/* Search Box & Mark Read */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="msg-search-input"
                  type="text"
                  placeholder="搜索单号、SKU、类型或关键词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-xl text-xs border border-slate-200/70 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                id="msg-mark-all-read-btn"
                onClick={onMarkAllRead}
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold flex items-center gap-1 shrink-0 transition-all"
                title="全部标记为已读"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>全部已读</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs pb-0.5">
              {categories.map((cat) => {
                const count =
                  cat === '全部'
                    ? messages.length
                    : cat === '未读'
                    ? unreadMsgCount
                    : messages.filter((m) => m.category === cat).length;
                const isSelected = messageCategory === cat;

                return (
                  <button
                    key={cat}
                    id={`msg-cat-${cat}`}
                    onClick={() => {
                      playScannerBeep('click');
                      setMessageCategory(cat);
                    }}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap text-xs font-medium transition-all flex items-center gap-1 shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{cat}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : cat === '未读'
                            ? 'bg-red-100 text-red-600 font-bold'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Copy Toast Alert */}
          {copiedText && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg z-50 flex items-center gap-1.5 animate-fade-in backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>已复制: {copiedText}</span>
            </div>
          )}

          {/* Messages List */}
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
              <div className="text-xs font-medium text-slate-500">暂无相关消息通知</div>
              <div className="text-[11px] text-slate-400">已处理完所有当前分类的业务提醒</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((msg) => {
                return (
                  <div
                    key={msg.id}
                    id={`msg-card-${msg.id}`}
                    className={`rounded-2xl p-4 transition-all border ${getCardBorder(msg)}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide ${getBadgeStyle(
                            msg
                          )}`}
                        >
                          {msg.category}
                        </span>
                        {!msg.isRead && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            <span>未读</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-sm text-slate-900 mt-2 leading-tight flex items-center gap-1.5">
                      <span>{msg.title}</span>
                    </h4>

                    {/* Structured Key-Value Fields (Formatted precisely to user spec) */}
                    {msg.fields && msg.fields.length > 0 && (
                      <div className="mt-2.5 bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs">
                        {msg.fields.map((field, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2">
                            <span className="text-slate-500 shrink-0 font-medium">{field.label}：</span>
                            <div className="flex items-center gap-1 text-right flex-1 min-w-0 justify-end">
                              <span
                                className={`font-medium break-all ${
                                  field.isDanger
                                    ? 'text-red-600 font-bold'
                                    : field.isSuccess
                                    ? 'text-emerald-700 font-bold'
                                    : field.isHighlight
                                    ? 'text-blue-700 font-semibold'
                                    : 'text-slate-800'
                                }`}
                              >
                                {field.value}
                              </span>
                              {field.copyable && (
                                <button
                                  onClick={(e) => handleCopy(field.value, e)}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                                  title="复制单号"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fallback standard content text */}
                    {msg.content && !msg.fields && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {msg.content}
                      </p>
                    )}

                    {/* Conclusion / Delivered success note (妥投成功，订单闭环 / 库存已自动入账) */}
                    {msg.conclusion && (
                      <div className="mt-2 p-2 rounded-xl text-xs flex items-center gap-1.5 bg-emerald-50/80 text-emerald-800 border border-emerald-100 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{msg.conclusion}</span>
                      </div>
                    )}

                    {/* Action Button Strip */}
                    {msg.actionText && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                        <button
                          id={`msg-action-btn-${msg.id}`}
                          onClick={() => handleMessageAction(msg)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 ${
                            msg.level === 'danger'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : msg.level === 'warning'
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : msg.level === 'success'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <span>{msg.actionText}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Approvals Center (Module 8 审批中心) */}
      {subTab === 'approvals' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1.5">
            {[
              { id: '待我审批', dot: 'bg-amber-500' },
              { id: '已通过', dot: 'bg-emerald-500' },
              { id: '已驳回', dot: 'bg-rose-500' },
            ].map((st) => {
              const count = approvals.filter((a) => a.status === st.id).length;
              const isSelected = approvalStatusFilter === st.id;
              return (
                <button
                  key={st.id}
                  id={`approval-status-${st.id}`}
                  onClick={() => {
                    playScannerBeep('click');
                    setApprovalStatusFilter(st.id as '待我审批' | '已通过' | '已驳回');
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-white' : st.dot}`} />
                  <span>{st.id}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2.5">
            {filteredApprovals.map((appr) => (
              <div
                key={appr.id}
                id={`appr-card-${appr.id}`}
                onClick={() => {
                  playScannerBeep('click');
                  onSelectApproval(appr);
                }}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 hover:border-blue-200 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700">
                    {appr.type}
                  </span>
                  <span className="text-[11px] text-slate-400">{appr.time}</span>
                </div>

                <h4 className="font-semibold text-xs text-slate-800 mt-2 leading-snug">
                  {appr.title}
                </h4>

                <div className="text-[11px] text-slate-500 mt-1">
                  发起人: <b className="text-slate-700">{appr.applicant}</b> ({appr.department})
                </div>

                {appr.amount && (
                  <div className="text-sm font-bold font-mono text-emerald-600 mt-1.5">
                    ${appr.amount.toLocaleString()} {appr.currency}
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">点击进入移动签名与批注</span>
                  <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                    <span>办理审批</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Work Orders & Service (Module 9 工单与服务) */}
      {subTab === 'workorders' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-800">海外仓现场服务工单</div>
              <div className="text-[10px] text-slate-400">拍照核验 / FBA换标 / 破损检测</div>
            </div>

            <div className="flex gap-2">
              <button
                id="wo-create-trigger-btn"
                onClick={onOpenCreateWorkOrder}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建工单</span>
              </button>
            </div>
          </div>

          {/* Work Orders List */}
          <div className="space-y-2.5">
            {workOrders.map((wo) => (
              <div
                key={wo.id}
                id={`wo-card-${wo.id}`}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {wo.workOrderNo}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600">
                      {wo.type}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      wo.status === '处理中'
                        ? 'bg-amber-100 text-amber-700'
                        : wo.status === '已完成'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {wo.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  <div className="font-medium">
                    <span>执行海外仓: {wo.warehouse}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">关联订单: <b className="font-mono text-slate-800">{wo.orderNo || wo.sku}</b></div>
                  <p className="text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg text-[11px]">
                    需求: {wo.description}
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 pt-1">
                  <span>附图 ({wo.photoCount} 张) · 创建于 {wo.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
