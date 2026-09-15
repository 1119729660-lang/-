import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  X,
  Download,
  Check,
  Copy,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
  Grid,
  FileImage,
  MoreHorizontal,
  CircleDot,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  LayoutDashboard,
  Boxes,
  MessageSquareText,
  Wallet,
  ScanLine,
  Printer,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { playScannerBeep } from '../components/AudioBeep';

interface ExportArtboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileContainerRef: React.RefObject<HTMLDivElement | null>;
}

// Preset standalone UI Slices for direct 1:1 transparent slice download
interface SliceItem {
  id: string;
  name: string;
  category: 'component' | 'icon' | 'badge';
  width: number;
  height: number;
  description: string;
  renderSvg: (scale: number) => string;
}

const UI_SLICES: SliceItem[] = [
  {
    id: 'wechat-capsule',
    name: '微信/企微胶囊操作钮',
    category: 'component',
    width: 86,
    height: 30,
    description: '标准深色半透明胶囊，包含三点更多、中线与圆点关闭',
    renderSvg: () => `
      <svg width="86" height="30" viewBox="0 0 86 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="86" height="30" rx="15" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <circle cx="18" cy="15" r="1.5" fill="#FFFFFF"/>
        <circle cx="25" cy="15" r="1.5" fill="#FFFFFF"/>
        <circle cx="32" cy="15" r="1.5" fill="#FFFFFF"/>
        <line x1="43" y1="9" x2="43" y2="21" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <circle cx="59" cy="15" r="5" stroke="#FFFFFF" stroke-width="1.5"/>
        <circle cx="59" cy="15" r="2" fill="#FFFFFF"/>
      </svg>
    `
  },
  {
    id: 'status-badge-stockout',
    name: '缺货异常警示横幅',
    category: 'badge',
    width: 350,
    height: 48,
    description: '红橙双色渐变警告底栏，用于缺货高亮提醒',
    renderSvg: () => `
      <svg width="350" height="48" viewBox="0 0 350 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#DC2626"/>
            <stop offset="100%" stop-color="#BE123C"/>
          </linearGradient>
        </defs>
        <rect width="350" height="48" rx="12" fill="url(#redGrad)"/>
        <rect x="12" y="8" width="32" height="32" rx="8" fill="rgba(255,255,255,0.2)"/>
        <path d="M28 17L36 31H20L28 17Z" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
        <line x1="28" y1="23" x2="28" y2="26" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        <circle cx="28" cy="28.5" r="1" fill="#FFFFFF"/>
        <text x="54" y="24" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="13" font-weight="bold">缺货异常 (7 笔)</text>
        <text x="54" y="38" fill="rgba(255,255,255,0.9)" font-family="-apple-system, sans-serif" font-size="10">海外仓现货库存不足 · 触发预警拦截</text>
        <rect x="270" y="13" width="68" height="22" rx="11" fill="#FFFFFF"/>
        <text x="304" y="28" text-anchor="middle" fill="#DC2626" font-family="-apple-system, sans-serif" font-size="11" font-weight="bold">一键补货</text>
      </svg>
    `
  },
  {
    id: 'status-badge-delivered',
    name: '已妥投成功标签',
    category: 'badge',
    width: 80,
    height: 24,
    description: '翡翠绿圆角药丸标签，包含勾选徽标',
    renderSvg: () => `
      <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="24" rx="12" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1"/>
        <circle cx="14" cy="12" r="5.5" fill="#10B981"/>
        <path d="M12 12L13.5 13.5L16.5 10.5" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="25" y="15.5" fill="#065F46" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">已妥投</text>
      </svg>
    `
  },
  {
    id: 'bottom-nav-bar',
    name: '底部五栏主导航条',
    category: 'component',
    width: 390,
    height: 56,
    description: '工作台/订单/库存/审批/我的 完整切片',
    renderSvg: () => `
      <svg width="390" height="56" viewBox="0 0 390 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="390" height="56" fill="#FFFFFF"/>
        <line x1="0" y1="0.5" x2="390" y2="0.5" stroke="#E2E8F0" stroke-width="1"/>
        
        <!-- Tab 1 Active -->
        <g transform="translate(15, 6)">
          <rect x="13" y="2" width="22" height="22" rx="4" fill="#EFF6FF"/>
          <path d="M19 8H23V12H19V8Z" fill="#2563EB"/>
          <path d="M25 8H29V15H25V8Z" fill="#2563EB"/>
          <path d="M19 14H23V19H19V14Z" fill="#2563EB"/>
          <path d="M25 17H29V19H25V17Z" fill="#2563EB"/>
          <text x="24" y="38" text-anchor="middle" fill="#2563EB" font-family="-apple-system, sans-serif" font-size="11" font-weight="bold">工作台</text>
        </g>

        <!-- Tab 2 Orders -->
        <g transform="translate(93, 6)">
          <path d="M24 7L16 11V21L24 25L32 21V11L24 7Z" stroke="#64748B" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M16 11L24 15L32 11" stroke="#64748B" stroke-width="1.8"/>
          <path d="M24 15V25" stroke="#64748B" stroke-width="1.8"/>
          <text x="24" y="38" text-anchor="middle" fill="#64748B" font-family="-apple-system, sans-serif" font-size="11">订单</text>
        </g>

        <!-- Tab 3 Inventory -->
        <g transform="translate(171, 6)">
          <path d="M18 10L24 6L30 10L24 14L18 10Z" stroke="#64748B" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M15 15L21 19V25L15 21V15Z" stroke="#64748B" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M33 15L27 19V25L33 21V15Z" stroke="#64748B" stroke-width="1.8" stroke-linejoin="round"/>
          <text x="24" y="38" text-anchor="middle" fill="#64748B" font-family="-apple-system, sans-serif" font-size="11">库存</text>
        </g>

        <!-- Tab 4 Messages -->
        <g transform="translate(249, 6)">
          <path d="M16 9H32V21H20L16 25V9Z" stroke="#64748B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="24" y="38" text-anchor="middle" fill="#64748B" font-family="-apple-system, sans-serif" font-size="11">审批</text>
          <circle cx="31" cy="9" r="4" fill="#EF4444"/>
        </g>

        <!-- Tab 5 Finance -->
        <g transform="translate(327, 6)">
          <path d="M15 10H33V22C33 23.1 32.1 24 31 24H17C15.9 24 15 23.1 15 22V10Z" stroke="#64748B" stroke-width="1.8"/>
          <path d="M28 15H33V19H28C26.9 19 26 18.1 26 17C26 15.9 26.9 15 28 15Z" stroke="#64748B" stroke-width="1.8"/>
          <text x="24" y="38" text-anchor="middle" fill="#64748B" font-family="-apple-system, sans-serif" font-size="11">我的</text>
        </g>
      </svg>
    `
  },
  {
    id: 'icon-pda-scanner',
    name: 'PDA 移动扫码图标',
    category: 'icon',
    width: 48,
    height: 48,
    description: '扫码枪/PDA扫描器专属矢量切片',
    renderSvg: () => `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#EFF6FF"/>
        <path d="M14 18V14H18" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M34 18V14H30" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M14 30V34H18" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M34 30V34H30" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="12" y1="24" x2="36" y2="24" stroke="#EF4444" stroke-width="2" stroke-dasharray="3 2"/>
      </svg>
    `
  },
  {
    id: 'icon-bluetooth-print',
    name: '蓝牙面单打印图标',
    category: 'icon',
    width: 48,
    height: 48,
    description: '热敏打印机与面单出纸矢量图标',
    renderSvg: () => `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#F0FDF4"/>
        <path d="M17 19V12H31V19" stroke="#16A34A" stroke-width="2" stroke-linecap="round"/>
        <rect x="13" y="19" width="22" height="13" rx="3" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
        <path d="M17 27H31V36H17V27Z" fill="#FFFFFF" stroke="#16A34A" stroke-width="2"/>
        <line x1="20" y1="31" x2="28" y2="31" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `
  }
];

export const ExportArtboardModal: React.FC<ExportArtboardModalProps> = ({
  isOpen,
  onClose,
  mobileContainerRef,
}) => {
  const [activeTab, setActiveTab] = useState<'artboard' | 'slices' | 'tokens'>('artboard');
  const [artboardScale, setArtboardScale] = useState<1 | 2 | 3>(2);
  const [artboardFormat, setArtboardFormat] = useState<'transparent' | 'white' | 'device'>('transparent');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setDownloadSuccessToast(msg);
    setTimeout(() => setDownloadSuccessToast(null), 3000);
  };

  // Export full artboard from DOM
  const handleExportArtboard = async () => {
    if (!mobileContainerRef.current) {
      alert('未找到移动容器节点，请重试');
      return;
    }

    try {
      setIsExporting(true);
      playScannerBeep('click');

      const targetEl = mobileContainerRef.current;
      
      // Temporarily adjust styles if transparent mode
      const isTransparent = artboardFormat === 'transparent';
      const isWhite = artboardFormat === 'white';

      const canvas = await html2canvas(targetEl, {
        scale: artboardScale,
        backgroundColor: isTransparent ? null : isWhite ? '#ffffff' : '#0f172a',
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('[data-mobile-root="true"]') as HTMLElement;
          if (clonedContainer && isTransparent) {
            // Remove outer borders and dark shadow for transparent cut
            clonedContainer.style.border = 'none';
            clonedContainer.style.boxShadow = 'none';
            clonedContainer.style.backgroundColor = '#f1f5f9';
          }
        },
      });

      const fileName = `yijingtong-artboard-${artboardFormat}-${artboardScale}x-${Date.now()}.png`;
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      playScannerBeep('success');
      showToast(`🎉 成功导出 ${fileName}！`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('导出过程中发生异常，请确保网络及图片加载正常。');
    } finally {
      setIsExporting(false);
    }
  };

  // Download standalone SVG slice
  const handleDownloadSvgSlice = (slice: SliceItem) => {
    playScannerBeep('click');
    const svgCode = slice.renderSvg(1).trim();
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `${slice.id}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`已导出矢量切片: ${slice.id}.svg`);
  };

  // Convert SVG to transparent PNG and download
  const handleDownloadPngSlice = (slice: SliceItem, scale: number = 2) => {
    playScannerBeep('click');
    const svgCode = slice.renderSvg(scale).trim();
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = slice.width * scale;
      canvas.height = slice.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${slice.id}@${scale}x.png`;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
      showToast(`已导出透明底切图: ${slice.id}@${scale}x.png`);
    };
    img.src = url;
  };

  // Copy SVG code
  const handleCopySvg = (slice: SliceItem) => {
    playScannerBeep('click');
    navigator.clipboard?.writeText(slice.renderSvg(1).trim());
    setCopiedId(slice.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`已复制 ${slice.name} 的 SVG 源码！`);
  };

  return (
    <div
      id="export-artboard-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fadeIn select-none"
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-slideUp">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">1:1 像素级透明底切图与高清画板导出</h3>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-medium">
                  Design Tokens & Slices
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                专为前端重构与 UI 切图打造 · 支持 @1x / @2x / @3x 无损透明背景画板及矢量 SVG 资产
              </p>
            </div>
          </div>

          <button
            id="export-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 shrink-0 text-xs">
          {[
            { id: 'artboard', label: '📱 高清整屏画板导出', icon: Smartphone },
            { id: 'slices', label: '✂️ 独立透明切片库 (SVG/PNG)', icon: Layers },
            { id: 'tokens', label: '🎨 视觉规范代码与色值', icon: Grid },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`export-tab-${tab.id}`}
                onClick={() => {
                  playScannerBeep('click');
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Toast alert */}
        {downloadSuccessToast && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-medium flex items-center justify-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{downloadSuccessToast}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-700 text-xs no-scrollbar">
          
          {/* TAB 1: ARTBOARD EXPORT */}
          {activeTab === 'artboard' && (
            <div className="space-y-4">
              {/* Feature Intro */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <FileImage className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">一键截取当前移动视口完整画板</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    系统将通过虚拟渲染引擎对当前主界面的 DOM 进行亚像素级栅格化，导出为保留标准 16px/44px 圆角的透明底 PNG 或高清晰度白底设计稿，前端可直接导入 Figma / 标注软件。
                  </p>
                </div>
              </div>

              {/* Option 1: Format / Background */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-slate-800 text-xs block">1. 选择背景模式（Background Style）</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'transparent',
                      title: '💎 透明底 PNG',
                      desc: '去除外壳背景，只保留圆角手机UI',
                      badge: '前端切图首选',
                    },
                    {
                      id: 'white',
                      title: '⬜ 纯白画板底',
                      desc: '标准纯白 #FFFFFF 矩形画板',
                      badge: '设计评审稿',
                    },
                    {
                      id: 'device',
                      title: '📱 钛合金真机壳',
                      desc: '带 iPhone 机身框及立体软阴影',
                      badge: '商业演示',
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      id={`export-format-${f.id}`}
                      onClick={() => setArtboardFormat(f.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        artboardFormat === f.id
                          ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">{f.title}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            artboardFormat === f.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {f.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Resolution Scale */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-slate-800 text-xs block">2. 选择分辨率画质（Output Resolution）</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { scale: 1, title: '@1x 标准标清', resolution: '390 × 844 px', size: '约 300 KB' },
                    { scale: 2, title: '@2x Retina 高清', resolution: '780 × 1688 px (推荐)', size: '约 1.1 MB' },
                    { scale: 3, title: '@3x 印刷级超清', resolution: '1170 × 2532 px', size: '约 2.6 MB' },
                  ].map((s) => (
                    <button
                      key={s.scale}
                      type="button"
                      id={`export-scale-${s.scale}`}
                      onClick={() => setArtboardScale(s.scale as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        artboardScale === s.scale
                          ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-800 text-xs block">{s.title}</span>
                      <div className="text-[11px] font-mono text-blue-600 font-semibold mt-1">{s.resolution}</div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{s.size}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="pt-2">
                <button
                  id="start-export-artboard-btn"
                  onClick={handleExportArtboard}
                  disabled={isExporting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在渲染高清画布，请稍候...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>
                        立即导出 {artboardScale}x 无损 PNG 画板 ({artboardFormat === 'transparent' ? '透明底' : '白色底'})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE UI SLICES */}
          {activeTab === 'slices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">常用核心组件独立切片 (1:1 矢量与透明 PNG)</h4>
                  <p className="text-slate-500 text-xs mt-0.5">所有切片均为真正纯净透明通道，可在 Photoshop / Figma 中自由叠加</p>
                </div>
              </div>

              {/* Slices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {UI_SLICES.map((slice) => (
                  <div
                    key={slice.id}
                    className="border border-slate-200 rounded-2xl p-3 bg-white shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-all"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{slice.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {slice.width} × {slice.height} px
                        </span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-medium">
                        {slice.category}
                      </span>
                    </div>

                    {/* Preview box with checkerboard background (indicating true transparency) */}
                    <div
                      className="rounded-xl border border-slate-200/80 p-3 mb-3 flex items-center justify-center min-h-[90px] overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)`,
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: slice.renderSvg(1) }}
                        className="flex items-center justify-center drop-shadow-xs"
                      />
                    </div>

                    {/* Description */}
                    <p className="text-[10px] text-slate-500 mb-3 line-clamp-1">{slice.description}</p>

                    {/* Download & Copy buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        id={`download-svg-${slice.id}`}
                        onClick={() => handleDownloadSvgSlice(slice)}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                        title="下载无损矢量 SVG 切片"
                      >
                        <Download className="w-3 h-3" />
                        <span>SVG 切片</span>
                      </button>

                      <button
                        type="button"
                        id={`download-png-${slice.id}`}
                        onClick={() => handleDownloadPngSlice(slice, 2)}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                        title="下载 @2x 透明底 PNG"
                      >
                        <Download className="w-3 h-3" />
                        <span>@2x PNG</span>
                      </button>

                      <button
                        type="button"
                        id={`copy-code-${slice.id}`}
                        onClick={() => handleCopySvg(slice)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                        title="复制 SVG 源码"
                      >
                        {copiedId === slice.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DESIGN TOKENS & SPECS */}
          {activeTab === 'tokens' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>前端切图与还原核心 Tokens 摘要</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">品牌主色 Primary</span>
                    <div className="w-6 h-6 rounded-md bg-blue-600 mx-auto my-1 shadow-xs" />
                    <span className="font-mono font-bold text-[11px] text-slate-800">#2563EB</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">警示缺货 Red</span>
                    <div className="w-6 h-6 rounded-md bg-red-600 mx-auto my-1 shadow-xs" />
                    <span className="font-mono font-bold text-[11px] text-slate-800">#DC2626</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">妥投成功 Green</span>
                    <div className="w-6 h-6 rounded-md bg-emerald-600 mx-auto my-1 shadow-xs" />
                    <span className="font-mono font-bold text-[11px] text-slate-800">#059669</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">页面浅灰底 Slate</span>
                    <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-300 mx-auto my-1 shadow-xs" />
                    <span className="font-mono font-bold text-[11px] text-slate-800">#F1F5F9</span>
                  </div>
                </div>
              </div>

              {/* Ready-to-copy CSS variables snippet */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
                  <span className="font-bold text-slate-700 text-[11px]">CSS Design Variables (快速导入项目)</span>
                  <button
                    onClick={() => {
                      const code = `:root {
  --color-primary: #2563eb;
  --color-primary-light: #eff6ff;
  --color-danger: #dc2626;
  --color-success: #059669;
  --color-warning: #d97706;
  --color-bg-mobile: #f1f5f9;
  --radius-card: 16px;
  --radius-pill: 9999px;
  --shadow-card: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}`;
                      navigator.clipboard?.writeText(code);
                      showToast('已复制 CSS 变量代码！');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>复制代码</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-blue-200 p-3.5 text-[11px] font-mono overflow-x-auto leading-relaxed">
{`:root {
  --color-primary: #2563eb;       /* 品牌主蓝 */
  --color-primary-light: #eff6ff; /* 浅蓝底色 */
  --color-danger: #dc2626;        /* 缺货红 */
  --color-success: #059669;       /* 妥投绿 */
  --color-warning: #d97706;       /* 待办橙 */
  --color-bg-mobile: #f1f5f9;     /* 页面底灰 */
  --radius-card: 16px;            /* 主卡片圆角 */
  --radius-pill: 9999px;          /* 药丸胶囊圆角 */
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>导出切图支持带 Alpha 透明通道的标准 PNG 格式</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
