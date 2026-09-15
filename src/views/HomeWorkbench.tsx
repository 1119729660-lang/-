import React, { useState } from 'react';
import {
  Receipt,
  TrendingUp,
  PlusCircle,
  QrCode,
  Printer,
  Wrench,
  CreditCard,
  ChevronRight,
  ArrowUpRight,
  Search,
  Package,
  Tag,
  Download,
} from 'lucide-react';
import {
  MetricData,
  TodoCount,
  Announcement,
  TabType,
  OrderItem,
  InventoryItem,
  StoreAccount,
} from '../types';
import { playScannerBeep } from '../components/AudioBeep';

interface HomeWorkbenchProps {
  currentAccount: StoreAccount;
  metrics: MetricData;
  todoCount: TodoCount;
  announcements: Announcement[];
  onNavigateTab: (tab: TabType, filter?: string) => void;
  onOpenScan: () => void;
  onOpenPrint: () => void;
  onOpenRecharge: () => void;
  onOpenAddOrder: () => void;
  onOpenWorkOrder: () => void;
  onOpenStoreSwitcher: () => void;
  onOpenExportModal?: () => void;
}

export const HomeWorkbench: React.FC<HomeWorkbenchProps> = ({
  currentAccount,
  metrics,
  todoCount,
  announcements,
  onNavigateTab,
  onOpenScan,
  onOpenPrint,
  onOpenRecharge,
  onOpenAddOrder,
  onOpenWorkOrder,
  onOpenStoreSwitcher,
  onOpenExportModal,
}) => {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Dynamic trend data for 7, 30, and 90 days
  const currentChartData = React.useMemo(() => {
    if (timeRange === '7') {
      return metrics.chartData;
    }
    if (timeRange === '30') {
      return [
        { day: '08-01', shipments: 850, orders: 920 },
        { day: '08-05', shipments: 920, orders: 980 },
        { day: '08-10', shipments: 1040, orders: 1100 },
        { day: '08-15', shipments: 980, orders: 1050 },
        { day: '08-20', shipments: 1180, orders: 1250 },
        { day: '08-25', shipments: 1240, orders: 1310 },
        { day: '08-30', shipments: 1410, orders: 1530 },
      ];
    }
    return [
      { day: '06-01', shipments: 720, orders: 800 },
      { day: '06-15', shipments: 890, orders: 950 },
      { day: '07-01', shipments: 950, orders: 1020 },
      { day: '07-15', shipments: 1100, orders: 1180 },
      { day: '08-01', shipments: 1250, orders: 1320 },
      { day: '08-15', shipments: 1350, orders: 1440 },
      { day: '08-30', shipments: 1410, orders: 1530 },
    ];
  }, [timeRange, metrics.chartData]);

  // Max peak calculation for SVG scale
  const maxShipment = Math.max(...currentChartData.map((d) => d.shipments), 1600);
  const peakData = currentChartData.reduce((max, d) => (d.shipments > max.shipments ? d : max), currentChartData[0]);

  // Compute smooth bezier SVG path
  const svgWidth = 320;
  const svgHeight = 90;
  const paddingX = 16;
  const paddingTop = 12;
  const paddingBottom = 8;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const points = currentChartData.map((d, index) => {
    const x = paddingX + (index / (currentChartData.length - 1)) * plotWidth;
    const y = paddingTop + (1 - d.shipments / maxShipment) * plotHeight;
    return { x, y, data: d };
  });

  const getSmoothCurve = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 >= pts.length ? pts.length - 1 : i + 2];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const curveLinePath = getSmoothCurve(points);
  const areaPath = points.length > 0
    ? `${curveLinePath} L ${points[points.length - 1].x},${svgHeight - paddingBottom} L ${points[0].x},${svgHeight - paddingBottom} Z`
    : '';

  // Quick action items grid
  const quickActions = [
    {
      id: 'qa-orders',
      title: '查询订单',
      sub: '轨迹追踪',
      icon: Search,
      color: 'bg-blue-50 text-blue-600',
      action: () => onNavigateTab('orders', '代发订单'),
    },
    {
      id: 'qa-stock',
      title: '查询库存',
      sub: 'SKU库位',
      icon: Package,
      color: 'bg-emerald-50 text-emerald-600',
      action: () => onNavigateTab('inventory', '仓储库存'),
    },
    {
      id: 'qa-scan',
      title: '扫码查货',
      sub: 'PDA/条码',
      icon: QrCode,
      color: 'bg-indigo-50 text-indigo-600',
      action: onOpenScan,
    },
    {
      id: 'qa-add-order',
      title: '快速下单',
      sub: '批量导入',
      icon: PlusCircle,
      color: 'bg-amber-50 text-amber-600',
      action: onOpenAddOrder,
    },
    {
      id: 'qa-recharge',
      title: '在线充值',
      sub: '秒级到账',
      icon: CreditCard,
      color: 'bg-rose-50 text-rose-600',
      action: onOpenRecharge,
    },
    {
      id: 'qa-print',
      title: '蓝牙打标',
      sub: 'FBA标签',
      icon: Printer,
      color: 'bg-teal-50 text-teal-600',
      action: onOpenPrint,
    },
    {
      id: 'qa-wo',
      title: '现场工单',
      sub: '换标拍照',
      icon: Wrench,
      color: 'bg-purple-50 text-purple-600',
      action: onOpenWorkOrder,
    },
    {
      id: 'qa-products',
      title: '产品档案',
      sub: '详情/规格',
      icon: Tag,
      color: 'bg-amber-50 text-amber-600',
      action: () => onNavigateTab('inventory', '产品中心'),
    },
    {
      id: 'qa-bills',
      title: '账单核销',
      sub: '对账核销',
      icon: Receipt,
      color: 'bg-cyan-50 text-cyan-600',
      action: () => onNavigateTab('finance', '待核销'),
    },
    {
      id: 'qa-export',
      title: '切图画板',
      sub: '1:1透明导出',
      icon: Download,
      color: 'bg-indigo-50 text-indigo-600',
      action: onOpenExportModal,
    },
  ];

  return (
    <div className="space-y-3 pb-6">
      {/* Quick Access Grid (Module 2 快捷入口 - 移动到顶部) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm">高频快捷入口</h3>
          <span className="text-[10px] text-slate-400">支持拖拽自定义</span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                id={qa.id}
                onClick={qa.action}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-center group"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 shadow-xs transition-transform group-hover:scale-105 ${qa.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {qa.title}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{qa.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Metrics Cards (Module 2 关键数据卡片) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-slate-800 text-sm">核心运营指标</h3>
          </div>
          <div className="flex items-center gap-1 text-[11px] bg-slate-100 p-0.5 rounded-lg text-slate-600">
            {(['7', '30', '90'] as const).map((r) => (
              <button
                key={r}
                id={`metric-range-${r}-btn`}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  timeRange === r ? 'bg-white font-semibold text-blue-600 shadow-xs' : ''
                }`}
              >
                近{r}日
              </button>
            ))}
          </div>
        </div>

        {/* 4 Metric grid with bold numbers styled like Tencent Data */}
        <div className="grid grid-cols-2 gap-3">
          {/* Balance */}
          <div
            id="metric-balance-card"
            onClick={onOpenRecharge}
            className="p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-blue-200 transition-all"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>可用余额 (USD)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-600 font-mono leading-none">
              ${metrics.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Stockout SKU count */}
          <div
            id="metric-stockout-card"
            onClick={() => onNavigateTab('inventory', '缺货预警')}
            className="p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-red-200 transition-all"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>缺货/预警 SKU数</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-rose-600 font-mono leading-none">
              {metrics.stockoutSkuCount} <span className="text-xs font-normal text-slate-500">款</span>
            </div>
          </div>

          {/* Today Shipments */}
          <div
            id="metric-shipment-card"
            onClick={() => onNavigateTab('orders', '已发货')}
            className="p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-emerald-200 transition-all"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>今日发货出库</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono leading-none">
              {metrics.todayShipments.toLocaleString()} <span className="text-xs font-normal text-slate-500">单</span>
            </div>
          </div>

          {/* First-leg in transit */}
          <div
            id="metric-transit-card"
            onClick={() => onNavigateTab('orders', '头程订单')}
            className="p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-indigo-200 transition-all"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>头程在途</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono leading-none">
              {metrics.transitShipments.toLocaleString()} <span className="text-xs font-normal text-slate-500">件</span>
            </div>
          </div>
        </div>

        {/* Trend Curve Chart */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              海外仓出库发货趋势 (单/日)
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>峰值 <strong className="text-slate-700">{peakData.shipments.toLocaleString()}</strong> 单</span>
              {hoveredIndex !== null && (
                <span className="text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                  {currentChartData[hoveredIndex].day}: {currentChartData[hoveredIndex].shipments.toLocaleString()}单
                </span>
              )}
            </div>
          </div>

          {/* Smooth Spline Curve Area Chart */}
          <div className="relative w-full bg-slate-50/60 rounded-xl p-2 border border-slate-100/80">
            {/* Background horizontal guide lines */}
            <div className="absolute inset-x-4 top-3 bottom-6 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-slate-300 w-full" />
              <div className="border-b border-dashed border-slate-300 w-full" />
              <div className="border-b border-dashed border-slate-300 w-full" />
            </div>

            {/* SVG Curve Container */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-28 overflow-visible"
            >
              <defs>
                {/* Gradient for smooth area beneath the curve */}
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.00" />
                </linearGradient>
                {/* Glow filter for the curve stroke */}
                <filter id="curveGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563eb" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Area fill */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#curveGradient)"
                  className="transition-all duration-500 ease-out"
                />
              )}

              {/* Smooth Trend Curve Line */}
              {curveLinePath && (
                <path
                  d={curveLinePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#curveGlow)"
                  className="transition-all duration-500 ease-out"
                />
              )}

              {/* Interactive Data Nodes on Curve */}
              {points.map((pt, i) => {
                const isHovered = hoveredIndex === i;
                const isPeak = pt.data.day === peakData.day;

                return (
                  <g
                    key={pt.data.day}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      playScannerBeep('click');
                      setHoveredIndex(i);
                    }}
                  >
                    {/* Hover guide vertical line */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingTop}
                        x2={pt.x}
                        y2={svgHeight - paddingBottom}
                        stroke="#93c5fd"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* Outer pulse circle for hovered or peak node */}
                    {(isHovered || isPeak) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4.5}
                        fill={isHovered ? '#bfdbfe' : '#dbeafe'}
                        className="animate-pulse"
                      />
                    )}

                    {/* Core node dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 3.5 : 2.5}
                      fill={isHovered ? '#1d4ed8' : '#2563eb'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Value Badge above active point */}
                    {isHovered && (
                      <g transform={`translate(${pt.x}, ${Math.max(12, pt.y - 12)})`}>
                        <rect
                          x="-22"
                          y="-14"
                          width="44"
                          height="16"
                          rx="4"
                          fill="#1e293b"
                          className="drop-shadow-sm"
                        />
                        <text
                          x="0"
                          y="-3"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {pt.data.shipments}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* X-axis date labels */}
            <div className="flex justify-between items-center px-1 pt-1 text-[10px] font-mono text-slate-400">
              {currentChartData.map((d, i) => (
                <span
                  key={d.day}
                  className={`transition-colors cursor-pointer ${
                    hoveredIndex === i ? 'text-blue-600 font-bold' : ''
                  }`}
                  onClick={() => setHoveredIndex(i)}
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
