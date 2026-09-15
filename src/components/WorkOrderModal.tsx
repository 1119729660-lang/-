import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Camera,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Signal,
  Wifi,
  Battery,
  Sparkles,
  Tag,
  Trash2,
  ClipboardList,
  Building2,
  Package,
  FileText,
} from 'lucide-react';
import { WorkOrderItem, InventoryItem, OrderItem } from '../types';
import { playScannerBeep } from './AudioBeep';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory?: InventoryItem[];
  orders?: OrderItem[];
  onCreateWorkOrder: (item: WorkOrderItem) => void;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  inventory = [],
  orders = [],
  onCreateWorkOrder,
}) => {
  const [type, setType] = useState<'拍照核验' | '换标贴标' | '破损维修' | '退件销毁' | '人工盘点'>('换标贴标');
  const [warehouse, setWarehouse] = useState('美东新泽西2号仓');
  const [orderNo, setOrderNo] = useState(orders[0]?.orderNo || 'ORD-20260902-001');
  const [priority] = useState<'普通' | '紧急' | '特急'>('普通');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:15');
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
  ]);

  // Mobile clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const matchedOrder = orders.find(
    (o) =>
      o.orderNo.toLowerCase() === orderNo.trim().toLowerCase() ||
      (o.platformOrderNo && o.platformOrderNo.toLowerCase() === orderNo.trim().toLowerCase())
  );

  const handleSelectOrder = (selectedOrderNo: string) => {
    playScannerBeep('click');
    setOrderNo(selectedOrderNo);
    const ord = orders.find((o) => o.orderNo === selectedOrderNo);
    if (ord && ord.warehouse) {
      setWarehouse(ord.warehouse);
    }
  };

  const handleAddPhoto = () => {
    playScannerBeep('click');
    setPhotos((prev) => [
      ...prev,
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=150&auto=format&fit=crop&q=80',
    ]);
  };

  const applyTemplate = (text: string) => {
    playScannerBeep('click');
    setDescription(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('请填写具体作业指令说明，以便海外仓现场主管精准执行。');
      return;
    }

    setIsSubmitting(true);
    playScannerBeep('click');

    setTimeout(() => {
      const newWO: WorkOrderItem = {
        id: `wo_${Date.now()}`,
        workOrderNo: `WO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        type,
        warehouse,
        orderNo: orderNo.trim() || 'ORD-20260902-001',
        sku: matchedOrder?.sku || 'ORD',
        status: '处理中',
        priority,
        createdAt: '刚刚',
        description,
        photoCount: photos.length,
        feedback: '已指派海外仓主管正在现场核验中。',
      };

      setIsSubmitting(false);
      playScannerBeep('success');
      onCreateWorkOrder(newWO);
      alert(`✅ 服务工单 [${newWO.workOrderNo}] 创建成功！海外仓专员将在 30 分钟内接单处理。`);
      onClose();
    }, 600);
  };

  const serviceTypes = [
    { id: '拍照核验', label: '拍照核验', desc: '开箱质检', icon: Camera },
    { id: '换标贴标', label: '换标贴标', desc: 'FNSKU/SKU', icon: Tag },
    { id: '破损维修', label: '破损维修', desc: '翻新重包', icon: Wrench },
    { id: '退件销毁', label: '退件销毁', desc: '环保清退', icon: Trash2 },
    { id: '人工盘点', label: '人工盘点', desc: '动盘抽检', icon: ClipboardList },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 md:p-4 select-none animate-fadeIn">
      {/* Mobile Smartphone / Handheld PDA Container */}
      <div className="w-full max-w-[420px] h-full md:h-[870px] bg-slate-100 text-slate-800 flex flex-col relative overflow-hidden md:rounded-[44px] md:shadow-[0_25px_80px_rgba(0,0,0,0.85)] md:border-[10px] md:border-slate-800">
        
        {/* Dynamic Island / Top Camera Notch */}
        <div className="hidden md:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 pointer-events-none"></div>

        {/* 1. Mobile Status Bar */}
        <div className="bg-blue-600 text-white px-6 pt-3 pb-1 flex items-center justify-between text-xs z-30 shrink-0">
          <span className="font-semibold tracking-wider font-mono text-[13px]">{currentTime}</span>

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

        {/* 2. Mobile App Header Bar */}
        <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between z-30 shrink-0 shadow-sm">
          {/* Back Button */}
          <button
            id="mobile-wo-back-btn"
            onClick={() => {
              playScannerBeep('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center text-white"
            title="返回"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="text-center">
            <h2 className="font-bold text-base leading-tight">创建工单</h2>
          </div>

          {/* Close Button */}
          <button
            id="mobile-wo-close-btn"
            onClick={() => {
              playScannerBeep('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center text-white"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 space-y-3.5 no-scrollbar">

          {/* Card 1: 服务类型选择 */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>工单类型</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {serviceTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    id={`mobile-wo-type-${t.id}`}
                    onClick={() => {
                      playScannerBeep('click');
                      setType(t.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/90 text-blue-700 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs leading-tight">{t.label}</span>
                    <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: 目标海外仓与关联 SKU */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 block">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>其他信息</span>
            </span>

            {/* Warehouse Select */}
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">
                指定海外仓：
              </label>
              <select
                id="mobile-wo-warehouse-select"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="美西洛杉矶1号仓">美西洛杉矶1号仓 (US-WEST-LAX)</option>
                <option value="美东新泽西2号仓">美东新泽西2号仓 (US-EAST-EWR)</option>
                <option value="德国法兰克福海外仓">德国法兰克福海外仓 (EU-DE-FRA)</option>
                <option value="深圳前海保税中转仓">深圳前海保税中转仓 (CN-SZ-FTZ)</option>
              </select>
            </div>

            {/* Order Input & Preview */}
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">
                关联订单：
              </label>
              <div className="relative">
                <input
                  id="mobile-wo-order-input"
                  type="text"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="请输入关联订单号 (如: ORD-20260902-001)"
                  className="w-full p-2.5 pl-8 border border-slate-200 rounded-xl text-xs font-mono font-bold bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <FileText className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {orderNo && (
                  <button
                    type="button"
                    onClick={() => setOrderNo('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Select Chips from Store Orders */}
              {orders && orders.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">快捷点选:</span>
                  {orders.slice(0, 5).map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => handleSelectOrder(ord.orderNo)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono shrink-0 transition-all border ${
                        orderNo.trim().toLowerCase() === ord.orderNo.toLowerCase()
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {ord.orderNo}
                    </button>
                  ))}
                </div>
              )}

              {/* Associated Order Preview Card */}
              {matchedOrder ? (
                <div className="flex items-center gap-2.5 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 mt-2">
                  <img
                    src={matchedOrder.productImg}
                    alt={matchedOrder.productName}
                    className="w-11 h-11 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-xs text-blue-900 truncate">
                        {matchedOrder.orderNo}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-blue-100 text-blue-700 shrink-0">
                        {matchedOrder.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-700 truncate mt-0.5">
                      {matchedOrder.productName} × {matchedOrder.quantity}件
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 truncate">
                      <span>{matchedOrder.storeName}</span>
                      <span>·</span>
                      <span>收件人: {matchedOrder.recipientName} ({matchedOrder.recipientCountry})</span>
                    </div>
                  </div>
                </div>
              ) : orderNo.trim() ? (
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 mt-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 block">已输入关联订单号</span>
                    <span className="font-mono font-bold text-slate-800 truncate text-[11px]">{orderNo.trim()}</span>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
              ) : null}
            </div>
          </div>

          {/* Card 3: 详细作业指令与快捷模板 */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">服务项</span>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-1.5">
              {[
                '贴新FNSKU条码覆盖旧标',
                '拍照核验外箱破损与封条',
                '开箱全检外观并通电测试',
                '退件直接贴标重新上架',
              ].map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[10px] font-medium border border-slate-200 transition-all"
                >
                  + {tpl}
                </button>
              ))}
            </div>

            <textarea
              id="mobile-wo-description-input"
              rows={3}
              placeholder="请明确指引海外仓操作人员，例如：需换标数量 50 件、需加贴防静电包装袋、作业完成后回传 3 张现场清晰高清照片..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Card 5: 附图与样标图纸上传 */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>现场附图 / 样标图纸 ({photos.length} 张)</span>
              </span>
              <span className="text-[10px] text-slate-400">支持拍照或本地选择</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              {photos.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                  <img src={src} alt="att" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      playScannerBeep('click');
                      setPhotos(photos.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-1 right-1 w-4 h-4 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                id="mobile-wo-add-photo-btn"
                onClick={handleAddPhoto}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 active:scale-95 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 text-[10px] gap-1 transition-all"
              >
                <Camera className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">拍照/添加</span>
              </button>
            </div>
          </div>
        </form>

        {/* 5. Sticky Mobile Bottom Action Bar */}
        <div className="bg-white border-t border-slate-200/80 px-4 py-3 z-30 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex gap-2.5">
          <button
            type="button"
            id="mobile-wo-cancel-btn"
            onClick={onClose}
            className="py-3 px-4 border border-slate-200 text-slate-600 rounded-2xl font-semibold text-xs hover:bg-slate-50 active:scale-95 transition-all"
          >
            取消
          </button>

          <button
            type="button"
            id="mobile-wo-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>正在派发工单到海外仓现场...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>立即提交海外仓工单</span>
              </>
            )}
          </button>
        </div>

        {/* 6. Mobile Home Indicator Bar */}
        <div className="py-1.5 bg-white shrink-0 flex justify-center">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>

      </div>
    </div>
  );
};
