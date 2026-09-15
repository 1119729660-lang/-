import React, { useState } from 'react';
import {
  Wallet,
  Receipt,
  TrendingUp,
  User,
  Shield,
  CreditCard,
  Building2,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Bell,
  Fingerprint,
  Lock,
  Smartphone,
  BarChart3,
  Calendar,
  Share2,
  FileText,
  Warehouse,
  Check,
  LogOut,
  Download,
  Sparkles,
} from 'lucide-react';
import { BillItem, MetricData, StoreAccount } from '../types';
import { playScannerBeep } from '../components/AudioBeep';

interface FinanceProfileViewProps {
  currentAccount: StoreAccount;
  metrics: MetricData;
  bills: BillItem[];
  initialSubTab?: 'finance' | 'reports' | 'profile';
  initialFilter?: string;
  onOpenRecharge: () => void;
  onReconcileBill: (billId: string) => void;
  onOpenLoginModal: () => void;
  onOpenStoreSwitcher: () => void;
  onOpenExportModal?: () => void;
}

export const FinanceProfileView: React.FC<FinanceProfileViewProps> = ({
  currentAccount,
  metrics,
  bills,
  initialSubTab = 'finance',
  initialFilter = '全部',
  onOpenRecharge,
  onReconcileBill,
  onOpenLoginModal,
  onOpenStoreSwitcher,
  onOpenExportModal,
}) => {
  const [subTab, setSubTab] = useState<'finance' | 'reports' | 'profile'>(initialSubTab);
  const [billFilter, setBillFilter] = useState<string>(initialFilter);
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'CNY' | 'EUR'>('USD');
  const [reportRange, setReportRange] = useState<'30' | '7'>('30');
  const [reportHoveredIndex, setReportHoveredIndex] = useState<number | null>(null);

  // Dynamic trend data for 7 and 30 days
  const reportChartData = React.useMemo(() => {
    if (reportRange === '7') {
      return [
        { day: '08-24', orders: 980, shipments: 920 },
        { day: '08-25', orders: 1120, shipments: 1040 },
        { day: '08-26', orders: 1250, shipments: 1180 },
        { day: '08-27', orders: 1190, shipments: 1130 },
        { day: '08-28', orders: 1320, shipments: 1260 },
        { day: '08-29', orders: 1480, shipments: 1390 },
        { day: '08-30', orders: 1530, shipments: 1410 },
      ];
    }
    return [
      { day: '08-01', orders: 850, shipments: 800 },
      { day: '08-05', orders: 960, shipments: 910 },
      { day: '08-10', orders: 1120, shipments: 1050 },
      { day: '08-15', orders: 1080, shipments: 1020 },
      { day: '08-20', orders: 1260, shipments: 1200 },
      { day: '08-25', orders: 1380, shipments: 1310 },
      { day: '08-30', orders: 1530, shipments: 1410 },
    ];
  }, [reportRange]);

  const maxReportShipment = Math.max(...reportChartData.map((d) => d.shipments), 1600);
  const peakReportData = reportChartData.reduce((max, d) => (d.shipments > max.shipments ? d : max), reportChartData[0]);

  const reportSvgWidth = 320;
  const reportSvgHeight = 90;
  const rPadX = 16;
  const rPadTop = 14;
  const rPadBottom = 8;
  const rPlotW = reportSvgWidth - rPadX * 2;
  const rPlotH = reportSvgHeight - rPadTop - rPadBottom;

  const reportPoints = reportChartData.map((d, index) => {
    const x = rPadX + (index / (reportChartData.length - 1)) * rPlotW;
    const y = rPadTop + (1 - d.shipments / maxReportShipment) * rPlotH;
    return { x, y, data: d };
  });

  const getReportSmoothCurve = (pts: { x: number; y: number }[]) => {
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

  const reportCurvePath = getReportSmoothCurve(reportPoints);
  const reportAreaPath = reportPoints.length > 0
    ? `${reportCurvePath} L ${reportPoints[reportPoints.length - 1].x},${reportSvgHeight - rPadBottom} L ${reportPoints[0].x},${reportSvgHeight - rPadBottom} Z`
    : '';

  // Settings switches
  const [wecomAlerts, setWecomAlerts] = useState(true);
  const [stockoutAlert, setStockoutAlert] = useState(true);
  const [fundsAlert, setFundsAlert] = useState(true);
  const [slowMovingAlert, setSlowMovingAlert] = useState(true);
  const [firstLegAlert, setFirstLegAlert] = useState(true);
  const [lastLegAlert, setLastLegAlert] = useState(true);

  const filteredBills = bills.filter((b) => {
    if (billFilter === '全部') return true;
    return b.status === billFilter;
  });

  const pendingReconcileTotal = bills
    .filter((b) => b.status === '待核销')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-3 pb-6">
      {/* 3-Way Top Navigation */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1">
        <button
          id="fp-tab-finance-btn"
          onClick={() => {
            playScannerBeep('click');
            setSubTab('finance');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'finance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>财务与核销</span>
        </button>

        <button
          id="fp-tab-reports-btn"
          onClick={() => {
            playScannerBeep('click');
            setSubTab('reports');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>数据报表</span>
        </button>

        <button
          id="fp-tab-profile-btn"
          onClick={() => {
            playScannerBeep('click');
            setSubTab('profile');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'profile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>个人与设置</span>
        </button>
      </div>

      {/* SubTab 1: Finance (Module 7 财务管理) */}
      {subTab === 'finance' && (
        <div className="space-y-3">
          {/* Multi-currency Balance Master Card */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-end">
              <div className="flex gap-1 text-[10px] bg-white/10 p-0.5 rounded-lg">
                {(['USD', 'CNY', 'EUR'] as const).map((curr) => (
                  <button
                    key={curr}
                    id={`curr-toggle-${curr}`}
                    onClick={() => setActiveCurrency(curr)}
                    className={`px-2 py-0.5 rounded-md font-mono transition-all ${
                      activeCurrency === curr ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Balance Display */}
            <div className="mt-3">
              <div className="text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-1">
                <span>{activeCurrency === 'USD' ? '$' : activeCurrency === 'CNY' ? '¥' : '€'}</span>
                <span>
                  {activeCurrency === 'USD'
                    ? metrics.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })
                    : activeCurrency === 'CNY'
                    ? metrics.balanceCNY.toLocaleString('en-US', { minimumFractionDigits: 2 })
                    : (metrics.balanceUSD * 0.92).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-blue-200/70 mt-1 flex items-center justify-between">
                <span>包含预估冻结保证金: $3,500.00</span>
                <span>今日自动代扣: 1,280 笔</span>
              </div>
            </div>

            {/* Quick Recharge Button inside card */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                待核销账单: <b className="text-amber-400 font-mono">${pendingReconcileTotal.toFixed(2)}</b>
              </div>

              <button
                id="finance-recharge-btn"
                onClick={onOpenRecharge}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>立即充值</span>
              </button>
            </div>
          </div>

          {/* Bills & Verification Filter Tabs */}
          <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex items-center justify-end">
            <div className="flex gap-1.5 text-xs w-full sm:w-auto">
              {[
                { id: '全部', dot: 'bg-slate-400' },
                { id: '待核销', dot: 'bg-amber-500' },
                { id: '已核销', dot: 'bg-emerald-500' },
              ].map((st) => {
                const count =
                  st.id === '全部'
                    ? bills.length
                    : bills.filter((b) => b.status === st.id).length;
                const isSelected = billFilter === st.id;
                return (
                  <button
                    key={st.id}
                    id={`bill-st-${st.id}`}
                    onClick={() => {
                      playScannerBeep('click');
                      setBillFilter(st.id);
                    }}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : st.dot}`} />
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
          </div>

          {/* Bills List */}
          <div className="space-y-2.5">
            {filteredBills.map((bill) => (
              <div
                key={bill.id}
                id={`bill-card-${bill.id}`}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {bill.billNo}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600">
                      {bill.type}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      bill.status === '待核销'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {bill.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  <h4 className="font-semibold text-slate-800 text-xs">{bill.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{bill.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-400">账单日期: {bill.dueDate}</span>
                    <div className="font-extrabold font-mono text-base text-slate-900">
                      ${bill.amount.toFixed(2)} <span className="text-xs font-normal text-slate-500">{bill.currency}</span>
                    </div>
                  </div>
                </div>

                {bill.status === '待核销' && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      id={`bill-reconcile-btn-${bill.id}`}
                      onClick={() => {
                        playScannerBeep('success');
                        onReconcileBill(bill.id);
                        alert(`✅ 账单 [${bill.billNo}] 核销成功！已自动从账户余额冲抵 $${bill.amount.toFixed(2)}。`);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
                    >
                      <span>核销</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 2: Reports (Module 10 数据报表) */}
      {subTab === 'reports' && (
        <div className="space-y-3">
          {/* Header */}
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-slate-800">跨境智能经营分析</h3>
            </div>
            <div className="flex gap-1 text-xs bg-slate-100 p-0.5 rounded-lg">
              <button
                id="report-range-7"
                onClick={() => setReportRange('7')}
                className={`px-2 py-0.5 rounded-md font-medium ${reportRange === '7' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'}`}
              >
                近7日
              </button>
              <button
                id="report-range-30"
                onClick={() => setReportRange('30')}
                className={`px-2 py-0.5 rounded-md font-medium ${reportRange === '30' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'}`}
              >
                近30日
              </button>
            </div>
          </div>

          {/* Orders & Shipments Trend Curve Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                近{reportRange === '7' ? '7' : '30'}天订单与发货总览
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>峰值 <strong className="text-slate-700">{peakReportData.shipments.toLocaleString()}</strong> 单</span>
                {reportHoveredIndex !== null && (
                  <span className="text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                    {reportChartData[reportHoveredIndex].day}: {reportChartData[reportHoveredIndex].shipments.toLocaleString()}单
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 rounded-xl">
              <div>
                <div className="text-[10px] text-slate-400">周期发货总计</div>
                <div className="font-mono font-bold text-sm text-slate-800">
                  {reportRange === '7' ? '8,980' : '38,400'} 单
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">平均出库时效</div>
                <div className="font-mono font-bold text-sm text-emerald-600">8.4 小时</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">平均单票成本</div>
                <div className="font-mono font-bold text-sm text-blue-600">$3.82</div>
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
                viewBox={`0 0 ${reportSvgWidth} ${reportSvgHeight}`}
                className="w-full h-28 overflow-visible"
              >
                <defs>
                  <linearGradient id="reportCurveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.00" />
                  </linearGradient>
                  <filter id="reportCurveGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563eb" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Area fill */}
                {reportAreaPath && (
                  <path
                    d={reportAreaPath}
                    fill="url(#reportCurveGradient)"
                    className="transition-all duration-500 ease-out"
                  />
                )}

                {/* Smooth Trend Curve Line */}
                {reportCurvePath && (
                  <path
                    d={reportCurvePath}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#reportCurveGlow)"
                    className="transition-all duration-500 ease-out"
                  />
                )}

                {/* Interactive Data Nodes on Curve */}
                {reportPoints.map((pt, i) => {
                  const isHovered = reportHoveredIndex === i;
                  const isPeak = pt.data.day === peakReportData.day;

                  return (
                    <g
                      key={pt.data.day}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setReportHoveredIndex(i)}
                      onMouseLeave={() => setReportHoveredIndex(null)}
                      onClick={() => {
                        playScannerBeep('click');
                        setReportHoveredIndex(i);
                      }}
                    >
                      {/* Hover guide vertical line */}
                      {isHovered && (
                        <line
                          x1={pt.x}
                          y1={rPadTop}
                          x2={pt.x}
                          y2={reportSvgHeight - rPadBottom}
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
                {reportChartData.map((d, i) => (
                  <span
                    key={d.day}
                    className={`transition-colors cursor-pointer ${
                      reportHoveredIndex === i ? 'text-blue-600 font-bold' : ''
                    }`}
                    onClick={() => setReportHoveredIndex(i)}
                  >
                    {d.day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="font-bold text-xs text-slate-800">海外仓综合费用支出结构</div>
            <div className="space-y-2 text-xs">
              {[
                { label: '一件代发尾程运费 (USPS/UPS)', amount: '$24,580.00', pct: 62, color: 'bg-blue-600' },
                { label: '库内作业费', amount: '$6,820.00', pct: 18, color: 'bg-indigo-500' },
                { label: '仓储费', amount: '$4,150.00', pct: 12, color: 'bg-purple-500' },
                { label: '增值服务费', amount: '$2,800.00', pct: 8, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold font-mono text-slate-800">{item.amount} ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily & Weekly Push Digest */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">企业微信日报/周报智能推送</div>
                <div className="text-[10px] text-slate-500">每日 21:00 自动推送到企微群</div>
              </div>
            </div>
            <button
              id="report-send-digest-btn"
              onClick={() => {
                playScannerBeep('success');
                alert('已成功将今日运营与财务日报推送至您的企业微信会话！');
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              立即推送
            </button>
          </div>
        </div>
      )}

      {/* SubTab 3: Profile & Settings (Module 11 个人中心与设置) */}
      {subTab === 'profile' && (
        <div className="space-y-3">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentAccount.avatar}
                alt={currentAccount.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">用户名称</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings & Switches */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-blue-600" />
                消息与业务预警偏好设置
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs text-slate-700">
              {/* Channel Master Switch: WeCom */}
              <div className="py-2.5 flex items-center justify-between first:pt-0">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>企业微信实时推送</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">各类出入库、异常与账单变动即时推送到企微会话</div>
                </div>
                <button
                  id="setting-wecom-alerts-switch"
                  onClick={() => {
                    playScannerBeep('click');
                    setWecomAlerts(!wecomAlerts);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${wecomAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${wecomAlerts ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Alert Switch 1: 安全库存断货预警 */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">安全库存断货预警</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">可用库存低于安全库存或断货时及时告警拦截</div>
                </div>
                <button
                  id="setting-stockout-alert-switch"
                  onClick={() => {
                    playScannerBeep('click');
                    setStockoutAlert(!stockoutAlert);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${stockoutAlert ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${stockoutAlert ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Alert Switch 2: 运费与账户资金水位预警 */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">运费与账户资金水位预警</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">可用运费余额不足或触发充值水位线时强提醒</div>
                </div>
                <button
                  id="setting-funds-alert-switch"
                  onClick={() => {
                    playScannerBeep('click');
                    setFundsAlert(!fundsAlert);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${fundsAlert ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${fundsAlert ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Alert Switch 3: 超期滞销与库龄预警 */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">超期滞销与库龄预警</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">SKU 库龄超 90 天滞销、仓储阶梯计费上涨提示</div>
                </div>
                <button
                  id="setting-slow-moving-alert-switch"
                  onClick={() => {
                    playScannerBeep('click');
                    setSlowMovingAlert(!slowMovingAlert);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${slowMovingAlert ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${slowMovingAlert ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Alert Switch 4: 头程入库异常与签收提醒 */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">头程入库异常与签收提醒</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">头程海空运到港、入库验收差异与上架完成通知</div>
                </div>
                <button
                  id="setting-first-leg-alert-switch"
                  onClick={() => {
                    playScannerBeep('click');
                    setFirstLegAlert(!firstLegAlert);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${firstLegAlert ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${firstLegAlert ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Alert Switch 5: 尾程派送与客诉异常 */}
              <div className="py-2.5 flex items-center justify-between last:pb-0">
                <div>
                  <div className="font-medium text-slate-800">尾程派送与客诉异常</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">USPS/UPS 轨迹停滞、退件拦截与买家售后工单提示</div>
                </div>
                <button
                  id="setting-last-leg-alert-switch"
                  onClick={() => {
                    playScannerBeep('click');
                    setLastLegAlert(!lastLegAlert);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${lastLegAlert ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${lastLegAlert ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Frontend Design & Slice Export Tool */}
          {onOpenExportModal && (
            <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 p-4 rounded-2xl border border-amber-300/60 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <span>1:1 像素级切图与高清画板</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-700 px-1.5 py-0.2 rounded font-medium">Design Tokens</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">支持导出 @1x/@2x/@3x 透明底画板及矢量 SVG 切片</p>
                </div>
              </div>
              <button
                id="profile-open-export-btn"
                onClick={() => {
                  playScannerBeep('click');
                  onOpenExportModal();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all shrink-0 ml-2"
              >
                立即导出
              </button>
            </div>
          )}

          {/* Logout Action */}
          <div className="pt-1">
            <button
              id="profile-logout-btn"
              onClick={() => {
                playScannerBeep('click');
                if (window.confirm('确定要退出当前账号登录状态吗？')) {
                  onOpenLoginModal();
                }
              }}
              className="w-full py-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
