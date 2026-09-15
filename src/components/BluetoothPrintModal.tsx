import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Printer,
  Check,
  X,
  RefreshCw,
  Layers,
  ChevronLeft,
  Signal,
  Wifi,
  Battery,
  Sliders,
  Sparkles,
  Zap,
  Radio,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { ProductItem, InventoryItem } from '../types';
import { playScannerBeep } from './AudioBeep';

interface BluetoothPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductItem | InventoryItem | null;
}

interface BluetoothDevice {
  id: string;
  name: string;
  type: string;
  signal: number;
  status: 'paired' | 'ready' | 'connecting';
  battery: number;
}

export const BluetoothPrintModal: React.FC<BluetoothPrintModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([
    { id: 'bt-1', name: '汉印 HPRT HM-A300 (便携热敏)', type: 'Thermal 40x30mm', signal: -54, status: 'paired', battery: 85 },
    { id: 'bt-2', name: 'Zebra ZD888 跨境FBA打标机', type: 'Thermal 100x150mm', signal: -68, status: 'ready', battery: 100 },
    { id: 'bt-3', name: '快麦 KM-118 蓝牙手持机', type: 'Thermal 50x30mm', signal: -75, status: 'ready', battery: 62 },
  ]);

  const [selectedDevice, setSelectedDevice] = useState<string>('bt-1');
  const [printCount, setPrintCount] = useState<number>(10);
  const [labelType, setLabelType] = useState<'fnsku' | 'sku' | 'carton'>('sku');
  const [printDensity, setPrintDensity] = useState<'normal' | 'dark' | 'ultra'>('dark');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
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

  const currentSku = product ? product.sku : 'US-CAM-SOLAR-4K';
  const currentTitle = product ? ('name' in product ? product.name : product.title) : '户外太阳能双摄4K智能监控摄像头';
  const currentBarcode = product ? product.barcode : '697812903112';
  const activeDeviceObj = devices.find(d => d.id === selectedDevice) || devices[0];

  const handleRefreshDevices = () => {
    setIsScanning(true);
    playScannerBeep('click');
    setTimeout(() => {
      setIsScanning(false);
      playScannerBeep('success');
    }, 850);
  };

  const handleCalibrate = () => {
    setIsCalibrating(true);
    playScannerBeep('click');
    setTimeout(() => {
      setIsCalibrating(false);
      playScannerBeep('success');
      alert(`📏 走纸定位校准成功！[${activeDeviceObj.name}] 已精确吸附并对齐纸缝黑标。`);
    }, 900);
  };

  const handleStartPrint = () => {
    setIsPrinting(true);
    setPrintProgress(15);
    playScannerBeep('click');

    const interval = setInterval(() => {
      setPrintProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPrinting(false);
          playScannerBeep('success');
          alert(`✅ 蓝牙标签打印完成！已向 [${activeDeviceObj.name}] 发送 ${printCount} 份指令并完成连续出纸。`);
          onClose();
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 md:p-4 select-none animate-fadeIn">
      {/* Authentic Mobile Smartphone / Handheld PDA Container */}
      <div className="w-full max-w-[420px] h-full md:h-[870px] bg-slate-100 text-slate-800 flex flex-col relative overflow-hidden md:rounded-[44px] md:shadow-[0_25px_80px_rgba(0,0,0,0.85)] md:border-[10px] md:border-slate-800">
        
        {/* Dynamic Island / Top Camera Notch */}
        <div className="hidden md:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 pointer-events-none"></div>

        {/* 1. Mobile Status Bar */}
        <div className="bg-slate-900 text-white px-6 pt-3 pb-1 flex items-center justify-between text-xs z-30 shrink-0">
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
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between z-30 shrink-0 border-b border-slate-800 shadow-sm">
          {/* Back Button */}
          <button
            id="mobile-bt-back-btn"
            onClick={() => {
              playScannerBeep('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white"
            title="返回"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Title & Connection Status */}
          <div className="text-center">
            <h2 className="font-bold text-base leading-tight flex items-center justify-center gap-1.5">
              <Bluetooth className="w-4 h-4 text-blue-400" />
              <span>蓝牙便携标签打印</span>
            </h2>
            <p className="text-[10px] text-blue-300/80 font-mono">BLE 5.2 · 便携热敏终端直连</p>
          </div>

          {/* Close Button */}
          <button
            id="mobile-bt-close-btn"
            onClick={() => {
              playScannerBeep('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Hero Connected Device Status Card */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-3.5 mx-3 mt-3 rounded-2xl shadow-md z-20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30">
                  <Printer className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-900 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs leading-tight">{activeDeviceObj.name}</span>
                  <span className="text-[9px] bg-emerald-500/90 text-white font-bold px-1.5 py-0.2 rounded-full">
                    已连接
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-blue-100">
                  <span>{activeDeviceObj.type}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-amber-300" />
                    电量 {activeDeviceObj.battery}%
                  </span>
                  <span>·</span>
                  <span>{activeDeviceObj.signal} dBm</span>
                </div>
              </div>
            </div>

            <button
              id="mobile-bt-reconnect-quick-btn"
              onClick={handleRefreshDevices}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white"
              title="刷新连接"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4. Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 no-scrollbar">

          {/* Card 1: 打印标签模板 */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>选择打印标签规格</span>
              </span>
              <span className="text-[10px] text-slate-400">热敏不干胶</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'sku', label: '商品SKU标', desc: '40×30 mm' },
                { id: 'fnsku', label: 'FBA条形码', desc: '50×30 mm' },
                { id: 'carton', label: '头程外箱标', desc: '100×100 mm' },
              ].map((t) => {
                const isSelected = labelType === t.id;
                return (
                  <button
                    key={t.id}
                    id={`mobile-bt-label-${t.id}`}
                    onClick={() => {
                      playScannerBeep('click');
                      setLabelType(t.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs leading-tight">{t.label}</span>
                    <span className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: 1:1 仿真真实热敏纸标签即时渲染预览 */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>热敏纸即时排版渲染 (1:1 预览)</span>
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                {labelType === 'sku' ? '40×30mm' : labelType === 'fnsku' ? '50×30mm' : '100×100mm'}
              </span>
            </div>

            {/* Thermal Label Paper Render */}
            <div className="bg-slate-100/90 border border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center">
              <div
                className={`bg-white border border-slate-400/80 rounded-md shadow-sm p-3 text-slate-900 font-sans transition-all duration-200 ${
                  labelType === 'carton' ? 'w-full max-w-[270px]' : 'w-64'
                }`}
              >
                {/* Title/SKU Header */}
                <div className="text-center font-black text-xs font-mono tracking-wider mb-1 text-slate-950">
                  {labelType === 'fnsku' ? 'FNSKU: X00192KK31' : labelType === 'carton' ? `CARTON #1/10 · ${currentSku}` : currentSku}
                </div>

                {/* High Density Barcode SVG Simulation */}
                <div className="my-1.5 flex flex-col items-center">
                  <div className="h-10 w-48 flex justify-between items-end bg-slate-950 p-0.5 rounded-[1px]">
                    <div className="w-1.5 h-full bg-white"></div>
                    <div className="w-1 h-full bg-white"></div>
                    <div className="w-2.5 h-full bg-white"></div>
                    <div className="w-0.5 h-full bg-white"></div>
                    <div className="w-1.5 h-full bg-white"></div>
                    <div className="w-1 h-full bg-white"></div>
                    <div className="w-2 h-full bg-white"></div>
                    <div className="w-0.5 h-full bg-white"></div>
                    <div className="w-1.5 h-full bg-white"></div>
                    <div className="w-2 h-full bg-white"></div>
                    <div className="w-1 h-full bg-white"></div>
                    <div className="w-0.5 h-full bg-white"></div>
                    <div className="w-1.5 h-full bg-white"></div>
                    <div className="w-2 h-full bg-white"></div>
                  </div>
                  <div className="text-[10px] font-mono text-center tracking-widest mt-0.5 font-bold text-slate-900">
                    {currentBarcode}
                  </div>
                </div>

                {/* Product Title */}
                <div className="text-[10px] line-clamp-1 font-semibold mt-1 text-center text-slate-800">
                  {currentTitle}
                </div>

                {/* Compliance marks footer */}
                <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 mt-2 border-t border-slate-300 pt-1">
                  <span>NEW ITEM</span>
                  <span className="font-bold">MADE IN CHINA</span>
                  <span>CE RoHS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 蓝牙设备列表与扫描切换 */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>附近蓝牙打标机列表</span>
              </span>

              <button
                id="mobile-bt-refresh-devices-btn"
                onClick={handleRefreshDevices}
                className="text-blue-600 hover:text-blue-700 active:scale-95 flex items-center gap-1 text-[11px] font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? '搜寻中...' : '重新搜寻'}</span>
              </button>
            </div>

            <div className="space-y-1.5 pt-0.5">
              {devices.map((device) => {
                const isSelected = selectedDevice === device.id;
                return (
                  <div
                    key={device.id}
                    id={`mobile-bt-device-${device.id}`}
                    onClick={() => {
                      playScannerBeep('click');
                      setSelectedDevice(device.id);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Printer className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="font-bold text-slate-800 text-xs">{device.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {device.type} · 信号 {device.signal} dBm
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {device.status === 'paired' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                          已配对
                        </span>
                      )}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: 打印份数与浓度设置 */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>打印参数配置</span>
              </span>
            </div>

            {/* Stepper Print Count */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">打印份数：</span>

              <div className="flex items-center gap-2">
                <button
                  id="mobile-bt-qty-minus"
                  onClick={() => {
                    playScannerBeep('click');
                    setPrintCount(Math.max(1, printCount - 5));
                  }}
                  className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-700 active:scale-95 shadow-xs text-sm"
                >
                  -
                </button>
                <input
                  id="mobile-bt-qty-input"
                  type="number"
                  value={printCount}
                  onChange={(e) => setPrintCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 text-center py-1 bg-white border border-slate-300 rounded-lg font-bold font-mono text-xs text-slate-800"
                />
                <button
                  id="mobile-bt-qty-plus"
                  onClick={() => {
                    playScannerBeep('click');
                    setPrintCount(printCount + 5);
                  }}
                  className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-700 active:scale-95 shadow-xs text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Count Pills */}
            <div className="flex gap-1.5">
              {[10, 30, 50, 100, 200].map((num) => (
                <button
                  key={num}
                  id={`mobile-bt-quick-qty-${num}`}
                  onClick={() => {
                    playScannerBeep('click');
                    setPrintCount(num);
                  }}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border ${
                    printCount === num
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}张
                </button>
              ))}
            </div>

            {/* Print Density Control */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">热敏打印浓度</span>
              <div className="flex gap-1">
                {[
                  { id: 'normal', label: '标准' },
                  { id: 'dark', label: '加浓' },
                  { id: 'ultra', label: '超清' },
                ].map((d) => (
                  <button
                    key={d.id}
                    id={`mobile-bt-density-${d.id}`}
                    onClick={() => {
                      playScannerBeep('click');
                      setPrintDensity(d.id as any);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      printDensity === d.id
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Printing Progress Card */}
          {isPrinting && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 space-y-2 animate-fadeIn">
              <div className="flex justify-between text-xs text-blue-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>正在向打标机传输光栅位图数据...</span>
                </span>
                <span className="font-mono">{printProgress}%</span>
              </div>
              <div className="w-full bg-blue-200/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${printProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* 5. Sticky Mobile Bottom Action Bar */}
        <div className="bg-white border-t border-slate-200/80 px-4 py-3 z-30 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex gap-2.5">
          <button
            id="mobile-bt-calibrate-btn"
            onClick={handleCalibrate}
            disabled={isCalibrating || isPrinting}
            className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-50 text-slate-700 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all shrink-0"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{isCalibrating ? '校准中...' : '走纸校准'}</span>
          </button>

          <button
            id="mobile-bt-confirm-print-btn"
            onClick={handleStartPrint}
            disabled={isPrinting}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all"
          >
            {isPrinting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>连续出纸打印中...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>立即蓝牙打印 ({printCount} 张)</span>
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
