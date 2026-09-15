import React, { useState, useEffect } from 'react';
import { OrderItem } from '../types';
import {
  X,
  Truck,
  Package,
  MapPin,
  Printer,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  Signal,
  Wifi,
  Battery,
  Clock,
  CheckCircle2,
  Building2,
  Copy,
  Edit3,
  Phone,
  Send,
  Sparkles,
  RefreshCw,
  Box,
  FileText,
  Search,
  Building,
} from 'lucide-react';
import { playScannerBeep } from './AudioBeep';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem | null;
  onStockoutResolve?: (orderId: string, action: 'reorder' | 'substitute') => void;
}

const PRESET_RECIPIENTS = [
  {
    name: 'John Miller',
    company: 'Miller Global Tech LLC',
    phone: '+1 (213) 555-0198',
    streetAddress: '1240 S Flower St',
    doorNo: 'Apt 4B',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90015',
  },
  {
    name: 'Sarah Jenkins',
    company: 'Jenkins Logistics Corp',
    phone: '+1 (415) 555-3211',
    streetAddress: '88 Colin P Kelly Jr St',
    doorNo: 'Suite 300',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94107',
  },
  {
    name: 'Michael Chang',
    company: 'Apex Supply Co',
    phone: '+1 (206) 555-8942',
    streetAddress: '410 Terry Ave N',
    doorNo: 'Fl 5',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98109',
  },
  {
    name: 'Emma Watson',
    company: 'Empire Retail Inc',
    phone: '+1 (212) 555-6677',
    streetAddress: '350 5th Ave',
    doorNo: 'Ste 5901',
    city: 'New York',
    state: 'NY',
    zipCode: '10118',
  },
];

const US_STATES = [
  { code: 'CA', name: 'CA - 加利福尼亚州' },
  { code: 'NY', name: 'NY - 纽约州' },
  { code: 'TX', name: 'TX - 德克萨斯州' },
  { code: 'FL', name: 'FL - 佛罗里达州' },
  { code: 'WA', name: 'WA - 华盛顿州' },
  { code: 'NJ', name: 'NJ - 新泽西州' },
  { code: 'IL', name: 'IL - 伊利诺伊州' },
  { code: 'PA', name: 'PA - 宾夕法尼亚州' },
  { code: 'OH', name: 'OH - 俄亥俄州' },
  { code: 'GA', name: 'GA - 乔治亚州' },
  { code: 'NC', name: 'NC - 北卡罗来纳州' },
  { code: 'MI', name: 'MI - 密歇根州' },
  { code: 'VA', name: 'VA - 弗吉尼亚州' },
  { code: 'AZ', name: 'AZ - 亚利桑那州' },
  { code: 'MA', name: 'MA - 麻萨诸塞州' },
  { code: 'OR', name: 'OR - 俄勒冈州' },
  { code: 'CO', name: 'CO - 科罗拉多州' },
  { code: 'NV', name: 'NV - 内华达州' },
  { code: 'UT', name: 'UT - 犹他州' },
];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onStockoutResolve,
}) => {
  const [activeTab, setActiveTab] = useState<'process' | 'address' | 'tracking'>('process');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  // Structured Address States
  const [searchRecipientInput, setSearchRecipientInput] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientCompany, setRecipientCompany] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('CA');
  const [doorNo, setDoorNo] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const [recipientAddress, setRecipientAddress] = useState('');
  const [currentTime, setCurrentTime] = useState('10:15');
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (order) {
      setRecipientName(order.recipientName || 'John Miller');
      setRecipientCompany('Miller Global Tech LLC');
      setRecipientPhone('+1 (213) 555-0198');
      setStreetAddress('1240 S Flower St');
      setDoorNo('Apt 4B');
      setCity('Los Angeles');
      setStateProvince('CA');
      setZipCode('90015');
      setRecipientAddress(order.recipientAddress || '1240 S Flower St, Apt 4B, Los Angeles, CA 90015');
      setIsEditingAddress(false);
      setActiveTab('process');
      setSearchRecipientInput('');
      setSearchFeedback(null);
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleCopyTracking = (text: string) => {
    navigator.clipboard?.writeText(text);
    playScannerBeep('click');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handlePrintLabel = () => {
    playScannerBeep('success');
    alert(`🖨️ 面单打印指令已下发！已生成 ${order.orderNo} 对应 4x6 英寸合规热敏面单。`);
  };

  const handleSelectPreset = (preset: typeof PRESET_RECIPIENTS[0]) => {
    playScannerBeep('click');
    setRecipientName(preset.name);
    setRecipientCompany(preset.company);
    setRecipientPhone(preset.phone);
    setStreetAddress(preset.streetAddress);
    setDoorNo(preset.doorNo);
    setCity(preset.city);
    setStateProvince(preset.state);
    setZipCode(preset.zipCode);
    setSearchFeedback(`已填充 ${preset.name} 的常用地址 (${preset.city}, ${preset.state})`);
  };

  const handleSearchRecipient = () => {
    playScannerBeep('click');
    const query = searchRecipientInput.trim().toLowerCase();
    const found = PRESET_RECIPIENTS.find(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.phone.includes(query) ||
        r.company.toLowerCase().includes(query) ||
        r.city.toLowerCase().includes(query)
    ) || PRESET_RECIPIENTS[0];

    if (found) {
      handleSelectPreset(found);
      setSearchFeedback(`查询到匹配收件人：${found.name}（${found.company}）`);
      playScannerBeep('success');
    } else {
      setSearchFeedback('未查询到对应记录，请在下方直接输入新增信息');
    }
  };

  const handleVerifyCityState = () => {
    playScannerBeep('click');
    if (!city.trim()) {
      alert('请先输入城市名称进行查询核验！');
      return;
    }
    playScannerBeep('success');
    alert(`📍 城市与州邮政校验通过：${city}, ${stateProvince} ${zipCode || '90015'}\nUSPS 数据库已识别对应邮递分区，门牌号已关联有效投递点。`);
  };

  const handleSaveAddress = () => {
    if (!recipientName.trim()) {
      alert('请输入收件人名称！');
      return;
    }
    if (!streetAddress.trim()) {
      alert('请输入收件人详细地址！');
      return;
    }
    if (!city.trim()) {
      alert('请输入城市名称！');
      return;
    }
    if (!recipientPhone.trim()) {
      alert('请输入收件人电话！');
      return;
    }
    if (!zipCode.trim()) {
      alert('请输入邮政编码！');
      return;
    }

    playScannerBeep('success');
    const fullAddr = `${streetAddress}${doorNo ? `, ${doorNo}` : ''}, ${city}, ${stateProvince} ${zipCode}`;
    setRecipientAddress(fullAddr);
    setIsEditingAddress(false);
    alert('✅ 收件人及配送地址修改已生效，并已同步更新至待发货电子面单！');
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
            id="mobile-order-detail-back-btn"
            onClick={() => {
              playScannerBeep('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center text-white"
            title="返回"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Title & Order No */}
          <div className="text-center">
            <h2 className="font-bold text-base leading-tight">订单详情</h2>
            <p className="text-[10px] text-blue-100/90 font-mono">{order.orderNo}</p>
          </div>

          {/* Close button */}
          <button
            id="mobile-order-detail-close-btn"
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

        {/* 3. Hero Status Banner (Mobile Status Bar) */}
        <div
          className={`px-4 py-3 text-white flex items-center justify-between z-20 shrink-0 ${
            order.status === '缺货异常'
              ? 'bg-gradient-to-r from-red-600 to-rose-700'
              : order.status === '待打包'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600'
              : order.status === '已发货'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
              : order.status === '已妥投'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              {order.status === '缺货异常' ? (
                <AlertTriangle className="w-5 h-5 text-white" />
              ) : order.status === '待打包' ? (
                <Package className="w-5 h-5 text-white" />
              ) : order.status === '已发货' ? (
                <Truck className="w-5 h-5 text-white" />
              ) : order.status === '已妥投' ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <Box className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="font-bold text-sm leading-tight flex items-center gap-2">
                <span>{order.status}</span>
                <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded font-mono font-normal">
                  {order.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Mobile Segmented Tab Control */}
        <div className="px-4 pt-3 pb-1 bg-slate-100 z-20 shrink-0">
          <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1 text-xs">
            {[
              { id: 'process', label: '订单处理', icon: Package },
              { id: 'address', label: '收件与清关', icon: MapPin },
              { id: 'tracking', label: '物流与轨迹', icon: Truck },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`mobile-order-tab-${tab.id}`}
                  onClick={() => {
                    playScannerBeep('click');
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    active
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Mobile Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">

          {/* TAB 1: 订单处理 */}
          {activeTab === 'process' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Product SKU Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>发货商品信息</span>
                  <span className="text-[11px] text-blue-600 font-mono">{order.storeName}</span>
                </div>

                <div className="flex gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <img
                    src={order.productImg}
                    alt={order.productName}
                    className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 text-xs line-clamp-2 leading-snug">
                      {order.productName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {order.sku}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">
                        × {order.quantity} 件
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specs row */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">发货仓库</span>
                    <span className="text-xs font-semibold text-slate-700 truncate block mt-0.5">
                      {order.warehouse.replace('美西洛杉矶', '美西').replace('美东新泽西', '美东')}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">申报单价</span>
                    <span className="text-xs font-semibold font-mono text-slate-700 block mt-0.5">
                      ${(order.declaredValue / Math.max(1, order.quantity)).toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">参考单号</span>
                    <span className="text-[11px] font-semibold font-mono text-slate-700 truncate block mt-0.5">
                      {order.platformOrderNo || order.orderNo.slice(0, 10)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Operation Buttons Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
                <span className="font-bold text-xs text-slate-800 block">常用快捷处理：</span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="mobile-order-print-label-btn"
                    onClick={handlePrintLabel}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>打印 4×6 面单</span>
                  </button>

                  <button
                    id="mobile-order-copy-no-btn"
                    onClick={() => handleCopyTracking(order.orderNo)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Copy className="w-4 h-4 text-indigo-600" />
                    <span>{copied ? '单号已复制' : '复制系统单号'}</span>
                  </button>

                  <button
                    id="mobile-order-change-addr-btn"
                    onClick={() => {
                      playScannerBeep('click');
                      setActiveTab('address');
                      setIsEditingAddress(true);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    <span>修改收件地址</span>
                  </button>

                  <button
                    id="mobile-order-urge-btn"
                    onClick={() => {
                      playScannerBeep('success');
                      alert('已成功向海外仓调度中枢发起优先拣货加急指令！');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>催促海外仓加急</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 收件与清关 */}
          {activeTab === 'address' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>国际买家收件地址</span>
                  </span>
                  <button
                    id="mobile-order-toggle-edit-addr-btn"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingAddress ? '取消编辑' : '编辑地址'}</span>
                  </button>
                </div>

                {isEditingAddress ? (
                  <div className="space-y-3 pt-1">
                    {/* 1. 选择收件人（输入框 + 查询按钮） */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 block">选择收件人</label>
                      <div className="flex gap-1.5">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchRecipientInput}
                            onChange={(e) => setSearchRecipientInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearchRecipient();
                              }
                            }}
                            placeholder="输入收件人姓名/电话搜索常用地址..."
                            className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                          />
                        </div>
                        <button
                          type="button"
                          id="mobile-order-query-recipient-btn"
                          onClick={handleSearchRecipient}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0 shadow-xs"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>查询</span>
                        </button>
                      </div>

                      {/* Quick preset chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                        <span className="text-[10px] text-slate-400 shrink-0">快捷：</span>
                        {PRESET_RECIPIENTS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all shrink-0 ${
                              recipientName === preset.name
                                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>

                      {searchFeedback && (
                        <p className="text-[10px] text-blue-600 animate-fadeIn">{searchFeedback}</p>
                      )}
                    </div>

                    {/* 2. 收件人名称（请输入收件人名称） */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        收件人名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="请输入收件人名称"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* 3. 收件地址（请输入收件人详细地址） */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        收件地址 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="请输入收件人详细地址"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* 4. 城市名称 / 州（选择）+ 查询- 门牌号 */}
                    <div className="space-y-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            城市名称 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="请输入城市名称"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            州（选择）<span className="text-red-500">*</span>
                          </label>
                          <select
                            value={stateProvince}
                            onChange={(e) => setStateProvince(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                          >
                            {US_STATES.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.code} ({s.name.split(' - ')[1]})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-slate-700">门牌号</label>
                          <span className="text-[10px] text-slate-400">如 Suite 300 / Apt 4B</span>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={doorNo}
                            onChange={(e) => setDoorNo(e.target.value)}
                            placeholder="请输入门牌号"
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            id="mobile-order-query-city-state-btn"
                            onClick={handleVerifyCityState}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
                            title="查询并校验城市、州与门牌号邮路"
                          >
                            <Search className="w-3.5 h-3.5 text-blue-600" />
                            <span>查询</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 5. 公司名称（请输入公司名称） */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">公司名称</label>
                      <input
                        type="text"
                        value={recipientCompany}
                        onChange={(e) => setRecipientCompany(e.target.value)}
                        placeholder="请输入公司名称"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* 6. 收件电话（请输入收件人电话） */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        收件电话 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="请输入收件人电话"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* 7. 邮政编码（请输入邮政编码） */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        邮政编码 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="请输入邮政编码"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl text-xs font-semibold transition-all"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        id="mobile-order-save-address-btn"
                        onClick={handleSaveAddress}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>保存地址并核验</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{recipientName}</span>
                        {recipientCompany && (
                          <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {recipientCompany}
                          </span>
                        )}
                      </div>
                      {recipientPhone && (
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{recipientPhone}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-700 font-sans space-y-0.5">
                      <p className="font-medium text-slate-800">{streetAddress}{doorNo ? `, ${doorNo}` : ''}</p>
                      <p className="text-slate-500 text-[11px]">{city}, {stateProvince} {zipCode}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customs Declaration Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
                <span className="font-bold text-xs text-slate-800 block">海关申报与税率</span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">海关商品编码 (HS Code)</span>
                    <span className="font-mono font-medium text-slate-800">8518.30.2000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">关税模式</span>
                    <span className="text-emerald-700 font-medium">DDP 完税代缴 (商家承担)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">申报总价值</span>
                    <span className="font-mono font-bold text-slate-800">${order.declaredValue.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 物流与轨迹 */}
          {activeTab === 'tracking' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>物流轨迹详情</span>
                  </span>
                  {order.trackingNo ? (
                    <button
                      onClick={() => handleCopyTracking(order.trackingNo!)}
                      className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 flex items-center gap-1"
                    >
                      <span>{order.trackingNo}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      待生成国际面单号
                    </span>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-4 pl-3 border-l-2 border-blue-400/80 ml-2 py-1 text-xs">
                  <div className="relative">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                    <div className="font-bold text-slate-800 text-xs">
                      {order.status === '已妥投'
                        ? '包裹已妥投签收 (投递至 Front Porch 门廊)'
                        : order.status === '已发货'
                        ? '干线转运中：已离开洛杉矶分拨转运中心'
                        : '海外仓已生成出库打单拣货任务'}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      承运商：USPS Priority Mail · 签收人：{order.recipientName}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-0.5">{order.createdAt}</div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <div className="font-medium text-slate-700 text-xs">
                      海外仓理货组已完成物理商品条码校验与贴标
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{order.createdAt}</div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="text-slate-600 text-xs">海外仓WMS收到电子面单推单指令</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{order.createdAt}</div>
                  </div>
                </div>
              </div>

              {/* Courier info card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">尾程派送服务商</span>
                  <span className="font-bold text-slate-800 text-xs">USPS Commercial Plus (2-3 Days)</span>
                </div>
                <button
                  onClick={() => {
                    playScannerBeep('success');
                    alert('正在调取 USPS 官方官网 API 实时轨迹节点...');
                  }}
                  className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>刷新节点</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 6. Sticky Mobile Bottom Action Bar */}
        <div className="bg-white border-t border-slate-200/80 px-4 py-3 z-30 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center">
            <button
              id="mobile-bottom-print-btn"
              onClick={handlePrintLabel}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>打印面单</span>
            </button>
          </div>
        </div>

        {/* 7. Mobile Home Indicator Bar */}
        <div className="py-1.5 bg-white shrink-0 flex justify-center">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>

      </div>
    </div>
  );
};
