import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  X,
  Upload,
  Box,
  FileSpreadsheet,
  Check,
  ChevronLeft,
  Signal,
  Wifi,
  Battery,
  Building2,
  MapPin,
  User,
  Plus,
  Minus,
  Sparkles,
  Send,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { OrderItem, InventoryItem } from '../types';
import { playScannerBeep } from './AudioBeep';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  currentStoreName: string;
  onAddOrder: (order: OrderItem) => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  inventory,
  currentStoreName,
  onAddOrder,
}) => {
  const [orderType, setOrderType] = useState<'代发订单' | '头程订单' | '换标中转'>('代发订单');
  const [sku, setSku] = useState(inventory[0]?.sku || 'US-CAM-SOLAR-4K');
  const [quantity, setQuantity] = useState(1);
  const [warehouse, setWarehouse] = useState('美西洛杉矶1号仓');
  const [recipientName, setRecipientName] = useState('Alexander Wright');
  const [recipientAddress, setRecipientAddress] = useState('1420 Ocean Dr, Miami Beach, FL 33139');
  const [boxCount, setBoxCount] = useState(10);
  const [weightKg, setWeightKg] = useState(150);
  const [importTab, setImportTab] = useState<'manual' | 'batch'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:15');

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

  const targetSkuItem = inventory.find((i) => i.sku === sku) || inventory[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    playScannerBeep('click');

    setTimeout(() => {
      setIsSubmitting(false);

      const newOrder: OrderItem = {
        id: `ord_${Date.now()}`,
        orderNo:
          orderType === '头程订单'
            ? `TC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
            : orderType === '换标中转'
            ? `HB${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
            : `DF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        type: orderType,
        platformOrderNo: orderType === '代发订单' ? `MANUAL-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
        storeName: currentStoreName,
        warehouse,
        sku,
        productName: targetSkuItem ? targetSkuItem.name : '跨境特许商品',
        productImg: targetSkuItem ? targetSkuItem.imageUrl : 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=150&auto=format&fit=crop&q=80',
        quantity,
        status: orderType === '头程订单' ? '待入库' : '待打包',
        createdAt: '刚刚',
        recipientName: orderType === '头程订单' ? '海外仓入库收货组' : recipientName,
        recipientCountry: 'US',
        recipientAddress,
        declaredValue: (targetSkuItem?.sellPrice || 35.0) * quantity,
        boxCount: orderType === '头程订单' ? boxCount : undefined,
        weightKg: orderType === '头程订单' ? weightKg : undefined,
      };

      playScannerBeep('success');
      onAddOrder(newOrder);
      alert(`🎉 订单 [${newOrder.orderNo}] 创建成功！已同步至海外仓WMS流水线处理。`);
      onClose();
    }, 600);
  };

  const handleSimulateBatchImport = () => {
    playScannerBeep('success');
    alert('已成功批量导入 12 笔代发待出库订单！系统已自动匹配对应海外仓现货并完成地址核验。');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 md:p-4 select-none animate-fadeIn">
      {/* Main Mobile Device Container (Authentic Phone Frame) */}
      <div className="w-full max-w-[420px] h-full md:h-[870px] bg-slate-100 text-slate-800 flex flex-col relative overflow-hidden md:rounded-[44px] md:shadow-[0_25px_80px_rgba(0,0,0,0.85)] md:border-[10px] md:border-slate-800">
        
        {/* Dynamic Island / Top Notch */}
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

        {/* 2. Mobile Header Bar */}
        <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between z-30 shrink-0 shadow-sm">
          {/* Back button */}
          <button
            id="mobile-add-order-back-btn"
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
            <h2 className="font-bold text-base leading-tight">录入跨境物流订单</h2>
            <p className="text-[10px] text-blue-100/90 font-normal">多仓智能分配 · WMS直连推单</p>
          </div>

          {/* Close button */}
          <button
            id="mobile-add-order-close-btn"
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

        {/* 3. Mobile Mode Segmented Switcher */}
        <div className="px-4 pt-3 pb-1 bg-slate-100 z-20 shrink-0">
          <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1 text-xs">
            <button
              type="button"
              id="mobile-add-order-manual-tab"
              onClick={() => {
                playScannerBeep('click');
                setImportTab('manual');
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                importTab === 'manual'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>手动建单</span>
            </button>
            <button
              type="button"
              id="mobile-add-order-batch-tab"
              onClick={() => {
                playScannerBeep('click');
                setImportTab('batch');
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                importTab === 'batch'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>批量导入</span>
            </button>
          </div>
        </div>

        {/* 4. Mobile Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
          {importTab === 'batch' ? (
            <div className="space-y-3.5 text-xs text-slate-600 animate-fadeIn">
              {/* Drop Area */}
              <div
                id="mobile-batch-upload-box"
                onClick={handleSimulateBatchImport}
                className="border-2 border-dashed border-blue-400/80 hover:border-blue-600 rounded-2xl p-6 bg-white text-center cursor-pointer transition-all active:scale-[0.99] shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 text-sm">点击选择 Excel / CSV 表格</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  支持 ERP 标准订单模板 (包含买家名、收件地址、SKU、数量)
                </p>
                <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>点此模拟一键导入 12 笔订单</span>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 text-[11px] space-y-1.5 text-slate-500 shadow-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>移动端批量导入说明：</span>
                </div>
                <p>• 单次最高支持 1,000 笔跨境电商发货单；</p>
                <p>• 系统自动对美国/欧洲收件地址执行 USPS / DHL 标准校验清洗；</p>
                <p>• 缺货商品订单将自动归集至【缺货待补】池，并发送企业微信提醒。</p>
              </div>
            </div>
          ) : (
            <form id="mobile-add-order-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* Card 1: Connected Store info */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">当前归属店铺账号</span>
                  <span className="font-bold text-slate-800 text-xs">{currentStoreName}</span>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-100">
                  已连通海外仓API
                </span>
              </div>

              {/* Card 2: Order Type Selector (代发 / 头程 / 换标) */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
                <label className="font-bold text-slate-800 block mb-2 text-xs">业务类型：</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['代发订单', '头程订单', '换标中转'] as const).map((t) => {
                    const isSelected = orderType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        id={`mobile-order-type-${t}-btn`}
                        onClick={() => {
                          playScannerBeep('click');
                          setOrderType(t);
                        }}
                        className={`py-2 px-1 rounded-xl border text-center text-xs font-semibold transition-all active:scale-95 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/90 text-blue-700 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-white'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Target Warehouse Selector */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
                <label className="font-bold text-slate-800 block mb-2 text-xs flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>指定海外仓：</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    { name: '美西洛杉矶1号仓', tag: 'USPS/UPS极速配' },
                    { name: '美东新泽西2号仓', tag: 'FBA转运与东岸' },
                    { name: '德国法兰克福海外仓', tag: 'EU全境DHL直发' },
                    { name: '深圳前海保税中转仓', tag: '集拼集运中转' },
                  ].map((w) => {
                    const isSelected = warehouse === w.name;
                    return (
                      <div
                        key={w.name}
                        onClick={() => {
                          playScannerBeep('click');
                          setWarehouse(w.name);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-800 font-semibold'
                            : 'border-slate-200/80 bg-slate-50/40 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-xs">{w.name}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-200/60 text-slate-500'}`}>
                          {w.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 4: SKU Selection & Quantity Stepper */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-blue-600" />
                    <span>选择发货商品与数量</span>
                  </span>
                  {targetSkuItem && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                      可用库存: {targetSkuItem.availableQty} 件
                    </span>
                  )}
                </div>

                {/* SKU Dropdown with product preview */}
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {targetSkuItem && (
                    <img
                      src={targetSkuItem.imageUrl}
                      alt={targetSkuItem.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <select
                      id="mobile-add-order-sku-select"
                      value={sku}
                      onChange={(e) => {
                        playScannerBeep('click');
                        setSku(e.target.value);
                      }}
                      className="w-full bg-transparent font-bold text-xs text-slate-800 focus:outline-none truncate"
                    >
                      {inventory.map((inv) => (
                        <option key={inv.sku} value={inv.sku}>
                          {inv.sku} - {inv.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      库位: {targetSkuItem?.shelfLocation} · 单价: ${targetSkuItem?.sellPrice?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Stepper for Quantity */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-600 font-medium">发货数量 (PCS)：</span>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      id="mobile-add-order-qty-minus-btn"
                      onClick={() => {
                        playScannerBeep('click');
                        setQuantity((q) => Math.max(1, q - 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white shadow-xs hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      id="mobile-add-order-quantity-input"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center bg-transparent font-extrabold font-mono text-sm text-slate-800 focus:outline-none"
                    />

                    <button
                      type="button"
                      id="mobile-add-order-qty-plus-btn"
                      onClick={() => {
                        playScannerBeep('click');
                        setQuantity((q) => q + 1);
                      }}
                      className="w-7 h-7 rounded-lg bg-white shadow-xs hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 5: Inbound / Recipient info */}
              {orderType === '头程订单' ? (
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-blue-600" />
                    <span>头程入库装箱与报关信息：</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">外箱总箱数 (CTNS)：</span>
                      <input
                        id="mobile-add-order-box-count-input"
                        type="number"
                        value={boxCount}
                        onChange={(e) => setBoxCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">申报毛重 (KG)：</span>
                      <input
                        id="mobile-add-order-weight-input"
                        type="number"
                        value={weightKg}
                        onChange={(e) => setWeightKg(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>买家收件信息</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playScannerBeep('click');
                        setRecipientName('Jessica Miller');
                        setRecipientAddress('789 Sunset Blvd, Los Angeles, CA 90028');
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                    >
                      填入示例地址
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">收件人姓名 (Full Name)：</label>
                    <input
                      id="mobile-add-order-recipient-name-input"
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">收件英文地址 (Street, City, State, ZIP)：</label>
                    <textarea
                      id="mobile-add-order-recipient-addr-input"
                      rows={2}
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* 5. Sticky Mobile Bottom Action Bar */}
        {importTab === 'manual' && (
          <div className="bg-white border-t border-slate-200/80 px-4 py-3 z-30 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-slate-400">预估货值 / 件数</div>
                <div className="text-base font-black font-mono text-blue-600">
                  ${((targetSkuItem?.sellPrice || 35) * quantity).toFixed(2)}
                  <span className="text-[10px] text-slate-500 font-normal ml-1">({quantity} 件)</span>
                </div>
              </div>

              <button
                type="submit"
                form="mobile-add-order-form"
                id="mobile-add-order-submit-btn"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>正在推单入库...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>确认提交并通知海外仓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 6. Mobile Home Indicator Bar */}
        <div className="py-1.5 bg-white shrink-0 flex justify-center">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>

      </div>
    </div>
  );
};
