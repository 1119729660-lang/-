import React, { useState, useEffect } from 'react';
import { ProductItem } from '../types';
import {
  X,
  ChevronLeft,
  Copy,
  CheckCircle2,
  Printer,
  Tag,
  Package,
  Scale,
  Maximize,
  Battery,
  Clock,
  DollarSign,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Globe,
  Music,
  Signal,
  Wifi,
  Share2,
  Sparkles,
} from 'lucide-react';
import { playScannerBeep } from './AudioBeep';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onOpenPrint?: (product: ProductItem) => void;
  onOpenWorkOrderWithSku?: (sku: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onOpenPrint,
  onOpenWorkOrderWithSku,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
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

  if (!isOpen || !product) return null;

  const handleCopy = (text: string, label: string) => {
    if (!text || text === '（空）') return;
    navigator.clipboard?.writeText(text);
    playScannerBeep('click');
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Safe fallback values matching user specifications
  const fnsku = product.fnsku || product.barcode || 'D120008HPRU';
  const sellerSku = product.sellerSku || product.sku || 'Yinliao';
  const title = product.title || '饮料罐';
  const declareNameEn = product.declareNameEn || 'yinliao';
  const weight = product.weight ?? '2.20';
  const dimensions = product.dimensions || '1.00*2.00*3.00';
  const category = product.category || '乐器';
  const customsCode = product.customsCode || '（空）';
  const originCountry = product.originCountry || '（空）';
  const specification = product.specification || '（空）';
  const color = product.color || '（空）';
  const imageUrlNetwork = product.imageUrlNetwork || '（空）';
  const snCodeStatus = product.snCodeStatus || '无需记录 SN 码';
  const createdAt = product.createdAt || '2026-09-02 17:49:51';
  const hasBattery = product.hasBattery || '不含电池';
  const isDistribution = product.isDistribution || '不分销';
  const distributionPrice = product.distributionPrice ?? '0.00';
  const description = product.description || '（空）';
  const platformSku = product.platformSku || '（空）';
  const image = product.image ? product.image : '（空）';

  const basicFields = [
    { label: 'FNSKU', value: fnsku, copyable: true, highlight: true },
    { label: 'seller sku', value: sellerSku, copyable: true, highlight: true },
    { label: '产品名称', value: title, copyable: true },
    { label: '英文名称', value: declareNameEn, copyable: true },
    { label: '平台 SKU', value: platformSku },
    { label: '产品分类', value: category, badge: true },
    { label: '产品规格', value: specification },
    { label: '颜色', value: color },
    { label: '添加时间', value: createdAt },
  ];

  const specFields = [
    { label: '重量', value: `${weight}`, icon: Scale },
    { label: '尺寸', value: `${dimensions}`, icon: Maximize },
    { label: '包含电池', value: hasBattery, icon: Battery },
    { label: '开启 SN 码', value: snCodeStatus, icon: ShieldCheck },
    { label: '海关编码', value: customsCode, icon: Globe },
    { label: '原产地', value: originCountry, icon: Globe },
  ];

  const distributionFields = [
    { label: '是否分销', value: isDistribution },
    { label: '分销价格', value: `${distributionPrice}` },
    { label: '商品详情描述', value: description, fullWidth: true },
  ];

  const mediaFields = [
    { label: '图片网络 URL', value: imageUrlNetwork },
    { label: '图片', value: image },
  ];

  return (
    <div
      id="product-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 md:p-4 select-none animate-fadeIn"
    >
      {/* Mobile Device Container (Authentic Phone Frame) */}
      <div
        id="product-detail-container"
        className="w-full max-w-[420px] h-full md:h-[870px] bg-slate-100 text-slate-800 flex flex-col relative overflow-hidden md:rounded-[44px] md:shadow-[0_25px_80px_rgba(0,0,0,0.85)] md:border-[10px] md:border-slate-800"
      >
        {/* Dynamic Island / Top Notch for authentic phone frame */}
        <div className="hidden md:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 pointer-events-none" />

        {/* 1. Mobile Status Bar (Time, 5G, Battery) */}
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
          <button
            id="mobile-prod-detail-back-btn"
            onClick={() => {
              playScannerBeep('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center text-white"
            title="返回"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="font-bold text-base leading-tight">产品详情</h2>
          </div>

          <button
            id="mobile-prod-detail-close-btn"
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

        {/* 3. Scrollable Mobile Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-6">
          {/* Mobile Hero Overview Card */}
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
                {product.image && product.image !== '（空）' ? (
                  <img
                    src={product.image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[10px] text-slate-400">
                    <Music className="w-7 h-7 text-blue-500 mb-0.5" />
                    <span>暂无图片</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {declareNameEn}
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: 基本信息 (Basic Information) */}
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Tag className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-xs text-slate-800">基本档案信息</h4>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {basicFields.map((field, idx) => (
                <div
                  key={idx}
                  className="py-2 flex items-center justify-between gap-2"
                >
                  <span className="text-slate-500 shrink-0 font-medium">
                    {field.label}
                  </span>
                  <div className="flex items-center gap-1.5 text-right font-medium max-w-[65%]">
                    <span
                      className={`truncate ${
                        field.highlight
                          ? 'font-mono font-bold text-slate-900'
                          : field.value === '（空）'
                          ? 'text-slate-400'
                          : 'text-slate-800'
                      }`}
                    >
                      {field.value}
                    </span>
                    {field.copyable && field.value !== '（空）' && (
                      <button
                        onClick={() => handleCopy(field.value, field.label)}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded active:scale-95 transition-all"
                        title="复制"
                      >
                        {copiedKey === field.label ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: 规格与物流属性 (Logistics & Specs) */}
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-xs text-slate-800">规格与物流属性</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {specFields.map((field, idx) => {
                const IconComponent = field.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <IconComponent className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] truncate">{field.label}</span>
                    </div>
                    <div
                      className={`font-bold text-xs truncate ${
                        field.value === '（空）'
                          ? 'text-slate-400'
                          : field.value === '不含电池'
                          ? 'text-emerald-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {field.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: 是否分销与分销价格 (Distribution & Sales) */}
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-xs text-slate-800">分销与定价</h4>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500 font-medium">是否分销</span>
                <span className="font-bold text-slate-800">{isDistribution}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500 font-medium">分销价格</span>
                <span className="font-mono font-bold text-slate-900">¥{distributionPrice}</span>
              </div>
              <div className="py-2 space-y-1">
                <span className="text-slate-500 font-medium block">商品详情描述</span>
                <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600 border border-slate-100 text-[11px]">
                  {description === '（空）' ? (
                    <span className="text-slate-400 italic">（空）暂无商品详情描述</span>
                  ) : (
                    description
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: 图片与网络资源 (Media) */}
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-xs text-slate-800">图片与网络资源</h4>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">图片网络 URL</span>
                <span className="text-slate-400 font-mono text-right truncate text-[11px]">
                  {imageUrlNetwork}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium shrink-0">图片</span>
                <span className="text-slate-400 font-mono text-right truncate text-[11px]">
                  {image}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Sticky Mobile Bottom Action Bar */}
        <div className="bg-white border-t border-slate-200/80 px-4 py-3 z-30 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <button
            id="mobile-prod-detail-print-btn"
            onClick={() => {
              playScannerBeep('click');
              if (onOpenPrint) onOpenPrint(product);
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>打印条码 / 面单</span>
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
