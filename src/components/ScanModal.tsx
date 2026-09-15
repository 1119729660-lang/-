import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Zap,
  Volume2,
  VolumeX,
  Search,
  CheckCircle2,
  ChevronLeft,
  Image as ImageIcon,
  Keyboard,
  Barcode,
  Signal,
  Wifi,
  Battery,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  MapPin,
  Package,
} from 'lucide-react';
import { InventoryItem } from '../types';
import { playScannerBeep } from './AudioBeep';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onSelectSku: (sku: string) => void;
}

type ScanTargetMode = 'sku' | 'location' | 'package';

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSelectSku,
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedResult, setScannedResult] = useState<InventoryItem | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanTargetMode, setScanTargetMode] = useState<ScanTargetMode>('sku');
  const [isGunMode, setIsGunMode] = useState(false);
  const [isManualSheetOpen, setIsManualSheetOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:15');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update mobile clock
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

  // Camera stream lifecycle
  useEffect(() => {
    if (!isOpen) {
      setScannedResult(null);
      setManualCode('');
      setIsManualSheetOpen(false);
      return;
    }

    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        setCameraActive(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBarcodeTrigger = (barcode: string) => {
    if (soundOn) {
      playScannerBeep('success');
    }
    const matched = inventory.find(
      (item) => item.barcode === barcode || item.sku.toLowerCase() === barcode.toLowerCase()
    );
    if (matched) {
      setScannedResult(matched);
      setIsManualSheetOpen(false);
    } else {
      if (soundOn) {
        playScannerBeep('alert');
      }
      alert(`未检索到条码 [${barcode}] 对应的库存记录，请检查是否已同步至ERP。`);
    }
  };

  const handleAlbumSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Simulate reading barcode from photo
      const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
      if (randomItem) {
        handleBarcodeTrigger(randomItem.barcode);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 md:p-4 select-none animate-fadeIn">
      {/* Hidden file input for album selection */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAlbumSelect}
      />

      {/* Main Mobile Device Container (iPhone / Handheld PDA Mobile Frame) */}
      <div className="w-full max-w-[420px] h-full md:h-[870px] bg-slate-950 text-white flex flex-col relative overflow-hidden md:rounded-[44px] md:shadow-[0_25px_80px_rgba(0,0,0,0.85)] md:border-[10px] md:border-slate-800">
        
        {/* Dynamic Island / Top Notch */}
        <div className="hidden md:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 pointer-events-none"></div>

        {/* 1. Mobile Status Bar (Authentic iOS / Handheld Mobile Header) */}
        <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs z-30 shrink-0 bg-black/40 backdrop-blur-xs">
          <span className="font-semibold tracking-wider font-mono text-[13px]">{currentTime}</span>

          <div className="flex items-center gap-1.5 opacity-95">
            <Signal className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5 text-white ml-0.5" />
            <div className="flex items-center ml-1">
              <span className="text-[10px] mr-1 font-mono">98%</span>
              <Battery className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* 2. Mobile Camera Navigation Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between z-30 shrink-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Back button */}
          <button
            id="mobile-scan-back-btn"
            onClick={() => {
              playScannerBeep('click');
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md border border-white/10"
            title="返回上一页"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Title & Mode Indicator */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-bold text-sm tracking-wide">仓储智能扫码</span>
              {isGunMode && (
                <span className="text-[9px] bg-red-600/90 text-white font-mono px-1.5 py-0.5 rounded-full animate-pulse">
                  PDA红外
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-300 font-normal">
              {scanTargetMode === 'sku' ? '对准商品条形码 / SKU' : scanTargetMode === 'location' ? '对准库位货架条码' : '对准外箱唛头 / 运单码'}
            </p>
          </div>

          {/* Right Action Icons: Flashlight + Sound */}
          <div className="flex items-center gap-2">
            <button
              id="mobile-scan-torch-toggle-btn"
              onClick={() => {
                playScannerBeep('click');
                setTorchOn(!torchOn);
              }}
              className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center backdrop-blur-md active:scale-95 ${
                torchOn
                  ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                  : 'bg-white/15 border-white/10 text-white hover:bg-white/25'
              }`}
              title={torchOn ? '关闭补光灯' : '开启补光灯'}
            >
              <Zap className="w-4 h-4" />
            </button>

            <button
              id="mobile-scan-sound-toggle-btn"
              onClick={() => {
                playScannerBeep('click');
                setSoundOn(!soundOn);
              }}
              className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center backdrop-blur-md active:scale-95 ${
                soundOn
                  ? 'bg-white/15 border-white/10 text-white hover:bg-white/25'
                  : 'bg-red-500/20 border-red-400/40 text-red-300'
              }`}
              title={soundOn ? '静音蜂鸣' : '开启蜂鸣'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3. Mobile Camera Viewfinder Area (Full-bleed camera screen with HUD) */}
        <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
          {/* Live Video Feed or High-tech Dark Optic Sensor Canvas */}
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                torchOn ? 'brightness-125 contrast-110' : 'brightness-100'
              }`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center">
              {/* Background optical grid & radar lines */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at center, rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '24px 24px, 48px 48px, 48px 48px',
                }}
              />
              <div className="w-48 h-48 rounded-full border border-cyan-500/10 animate-ping absolute pointer-events-none" />
            </div>
          )}

          {/* Darkened Mask Overlay with Center Viewfinder Window */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Viewfinder Target Box */}
            <div
              className={`relative w-64 h-64 rounded-3xl transition-all duration-300 flex flex-col justify-between p-3.5 ${
                torchOn
                  ? 'border-2 border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.35)]'
                  : 'border-2 border-cyan-400/70 shadow-[0_0_40px_rgba(6,182,212,0.3)]'
              }`}
            >
              {/* 4 Glowing Corner Brackets */}
              <div className="flex justify-between">
                <span className={`w-6 h-6 border-t-4 border-l-4 rounded-tl-lg -mt-1.5 -ml-1.5 transition-colors ${torchOn ? 'border-amber-400' : 'border-cyan-400'}`} />
                <span className={`w-6 h-6 border-t-4 border-r-4 rounded-tr-lg -mt-1.5 -mr-1.5 transition-colors ${torchOn ? 'border-amber-400' : 'border-cyan-400'}`} />
              </div>

              {/* Center Crosshair / Targeting Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-6 h-0.5 bg-cyan-300" />
                <div className="h-6 w-0.5 bg-cyan-300 absolute" />
              </div>

              {/* Smooth Continuously Moving Laser Scan Line */}
              <div className="absolute inset-x-3 pointer-events-none animate-scanner-laser">
                <div
                  className={`w-full h-1 rounded-full ${
                    torchOn
                      ? 'bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_16px_#f59e0b]'
                      : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#06b6d4]'
                  }`}
                />
                <div
                  className={`w-full h-12 -mt-6 opacity-25 ${
                    torchOn
                      ? 'bg-gradient-to-b from-amber-400 to-transparent'
                      : 'bg-gradient-to-b from-cyan-400 to-transparent'
                  }`}
                />
              </div>

              <div className="flex justify-between">
                <span className={`w-6 h-6 border-b-4 border-l-4 rounded-bl-lg -mb-1.5 -ml-1.5 transition-colors ${torchOn ? 'border-amber-400' : 'border-cyan-400'}`} />
                <span className={`w-6 h-6 border-b-4 border-r-4 rounded-br-lg -mb-1.5 -mr-1.5 transition-colors ${torchOn ? 'border-amber-400' : 'border-cyan-400'}`} />
              </div>
            </div>

            {/* Quick Touch Torch Pill directly under Viewfinder */}
            <button
              id="mobile-scan-center-torch-btn"
              onClick={() => {
                playScannerBeep('click');
                setTorchOn(!torchOn);
              }}
              className={`mt-4 px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5 backdrop-blur-md border transition-all active:scale-95 ${
                torchOn
                  ? 'bg-amber-400/90 text-slate-950 font-bold border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                  : 'bg-black/50 text-white/90 border-white/15 hover:bg-black/70'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${torchOn ? 'fill-current' : ''}`} />
              <span>{torchOn ? '补光灯已开启' : '轻触照亮'}</span>
            </button>

            {/* Mobile Scan Instruction Tip */}
            <div className="mt-2 text-center text-[11px] text-slate-300/90 bg-black/60 px-4 py-1 rounded-full backdrop-blur-md border border-white/10">
              {scanTargetMode === 'sku' && '将商品SKU条码或二维码放入框内'}
              {scanTargetMode === 'location' && '将库位标牌条码 (如 A-03-02-B) 放入框内'}
              {scanTargetMode === 'package' && '将外箱箱唛或面单条码放入框内'}
            </div>
          </div>
        </div>

        {/* 4. Mobile Mode Tabs (Bottom Segmented Switcher) */}
        <div className="px-4 py-2 z-20 bg-slate-950/80 backdrop-blur-md border-t border-white/10 shrink-0">
          <div className="flex justify-center gap-2">
            {[
              { id: 'sku', label: '商品条码/SKU', icon: Barcode },
              { id: 'location', label: '库位编码', icon: MapPin },
              { id: 'package', label: '箱唛/面单', icon: Package },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = scanTargetMode === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`mobile-scan-mode-${tab.id}-tab`}
                  onClick={() => {
                    playScannerBeep('click');
                    setScanTargetMode(tab.id as ScanTargetMode);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Mobile Quick Operation Bar (相册 / 手动输入 / 仿真扫码) */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 z-20 shrink-0 space-y-3">
          {/* Quick Simulation Bar for instant test on mobile */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>快捷仿真条码 (触屏直测)：</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">蜂鸣音效已联动</span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {inventory.slice(0, 4).map((item) => (
                <button
                  key={item.sku}
                  id={`mobile-scan-preset-${item.barcode}-btn`}
                  onClick={() => handleBarcodeTrigger(item.barcode)}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 active:text-white border border-slate-700 hover:border-slate-600 text-slate-200 flex-shrink-0 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Barcode className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono text-[11px] text-blue-300 font-semibold">{item.sku}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Three Mobile Bottom Operation Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. 相册导入 */}
            <button
              id="mobile-scan-album-btn"
              onClick={() => {
                playScannerBeep('click');
                fileInputRef.current?.click();
              }}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl text-xs font-medium text-slate-200 flex flex-col items-center justify-center gap-1 border border-slate-700 transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px]">相册导入</span>
            </button>

            {/* 2. 手动输码 */}
            <button
              id="mobile-scan-manual-trigger-btn"
              onClick={() => {
                playScannerBeep('click');
                setIsManualSheetOpen(true);
              }}
              className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl text-xs font-medium text-slate-200 flex flex-col items-center justify-center gap-1 border border-slate-700 transition-all active:scale-95"
            >
              <Keyboard className="w-4 h-4 text-blue-400" />
              <span className="text-[11px]">手动输码</span>
            </button>

            {/* 3. PDA红外扫码枪开关 */}
            <button
              id="mobile-scan-gun-mode-btn"
              onClick={() => {
                playScannerBeep('click');
                setIsGunMode(!isGunMode);
              }}
              className={`py-2.5 px-2 rounded-2xl text-xs font-medium flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                isGunMode
                  ? 'bg-red-950/80 border-red-500/80 text-red-200 shadow-md shadow-red-900/30'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Camera className={`w-4 h-4 ${isGunMode ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[11px]">{isGunMode ? '红外模式' : 'PDA扫码枪'}</span>
            </button>
          </div>
        </div>

        {/* 6. Mobile Scanned Result Bottom Sheet (Slides up when result is found) */}
        {scannedResult && (
          <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/98 border-t border-blue-500/50 rounded-t-3xl p-5 shadow-2xl animate-slideUp backdrop-blur-xl">
            {/* Sheet Handle */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-start gap-3.5">
              <img
                src={scannedResult.imageUrl}
                alt={scannedResult.name}
                className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-600/90 text-white font-bold">
                    {scannedResult.sku}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {scannedResult.shelfLocation}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white truncate mt-1">
                  {scannedResult.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
                  <span>可用: <b className="text-emerald-400">{scannedResult.availableQty}</b></span>
                  <span>锁定: <b className="text-amber-400">{scannedResult.lockedQty}</b></span>
                  <span>在途: <b className="text-blue-400">{scannedResult.transitQty}</b></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-800 grid grid-cols-2 gap-2.5">
              <button
                id="scan-view-inventory-detail-btn"
                onClick={() => {
                  playScannerBeep('click');
                  onSelectSku(scannedResult.sku);
                  onClose();
                }}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>查看SKU库存</span>
              </button>

              <button
                id="scan-rescan-btn"
                onClick={() => {
                  playScannerBeep('click');
                  setScannedResult(null);
                }}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>继续扫下一件</span>
              </button>
            </div>
          </div>
        )}

        {/* 7. Mobile Manual Input Bottom Sheet Drawer */}
        {isManualSheetOpen && (
          <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900 border-t border-slate-700 rounded-t-3xl p-5 shadow-2xl animate-slideUp">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                <Keyboard className="w-4 h-4 text-blue-400" />
                <span>手动录入条形码 / SKU</span>
              </h4>
              <button
                id="mobile-scan-close-manual-sheet-btn"
                onClick={() => setIsManualSheetOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="scan-manual-code-input"
                  type="text"
                  placeholder="输入商品条码、SKU 或货位编码..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualCode.trim()) {
                      handleBarcodeTrigger(manualCode.trim());
                    }
                  }}
                  autoFocus
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                {manualCode && (
                  <button
                    onClick={() => setManualCode('')}
                    className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  id="scan-manual-submit-btn"
                  onClick={() => {
                    if (manualCode.trim()) handleBarcodeTrigger(manualCode.trim());
                  }}
                  disabled={!manualCode.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>确认检索库存</span>
                </button>
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-slate-400 mb-1.5">最近常用预设：</p>
                <div className="flex flex-wrap gap-1.5">
                  {inventory.map((item) => (
                    <button
                      key={item.sku}
                      onClick={() => handleBarcodeTrigger(item.barcode)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                    >
                      {item.sku}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Mobile Home Indicator Bar (iOS / Android Bottom Pill) */}
        <div className="py-1.5 bg-slate-900 shrink-0 flex justify-center">
          <div className="w-32 h-1 bg-white/30 rounded-full" />
        </div>

      </div>
    </div>
  );
};
