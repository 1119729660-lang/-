import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Wallet,
  Check,
  X,
  ChevronLeft,
  Building2,
  Signal,
  Wifi,
  Battery,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { playScannerBeep } from './AudioBeep';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: 'USD' | 'CNY' | 'EUR';
  onRechargeSuccess: (amount: number, currency: string) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  currentCurrency,
  onRechargeSuccess,
}) => {
  // Form fields according to specification
  const [settlementAccount, setSettlementAccount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('支付宝');
  const [accountName, setAccountName] = useState<string>('');
  const [remittanceDate, setRemittanceDate] = useState<string>('');
  const [voucherUrl, setVoucherUrl] = useState<string | null>(null);
  const [voucherName, setVoucherName] = useState<string>('');

  const [displayCurrency, setDisplayCurrency] = useState<'CNY' | 'USD' | 'EUR'>(currentCurrency || 'CNY');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:15');
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial currency when modal opens
  useEffect(() => {
    if (currentCurrency) {
      setDisplayCurrency(currentCurrency);
    }
  }, [currentCurrency, isOpen]);

  // Wallet balances for each currency
  const walletBalances: Record<
    'CNY' | 'USD' | 'EUR',
    { amount: string; symbol: string; label: string; subtext: string }
  > = {
    CNY: { amount: '128,400.00', symbol: '¥', label: 'CNY 人民币', subtext: '约合 $17,870.56' },
    USD: { amount: '18,650.00', symbol: '$', label: 'USD 美元', subtext: '约合 ¥133,998.50' },
    EUR: { amount: '16,200.00', symbol: '€', label: 'EUR 欧元', subtext: '约合 ¥123,930.00' },
  };

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

  // Reset or preset when opened
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle voucher upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playScannerBeep('click');
      setVoucherName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setVoucherUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateVoucher = () => {
    playScannerBeep('click');
    setVoucherName('转账电子回执单_20260910.jpg');
    setVoucherUrl(
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'
    );
  };

  const handleRemoveVoucher = () => {
    playScannerBeep('click');
    setVoucherUrl(null);
    setVoucherName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Copy text helper
  const handleCopy = (key: string, text: string) => {
    playScannerBeep('click');
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {
      // ignore
    }
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };

  const handleConfirmRecharge = () => {
    setFormError(null);

    if (!settlementAccount) {
      setFormError('请选择结算账户');
      playScannerBeep('alert');
      return;
    }
    if (!currency) {
      setFormError('请选择充值币种');
      playScannerBeep('alert');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setFormError('请输入有效的充值金额');
      playScannerBeep('alert');
      return;
    }
    if (!accountName.trim()) {
      setFormError('请输入账户户名');
      playScannerBeep('alert');
      return;
    }

    setIsSubmitting(true);
    playScannerBeep('click');

    setTimeout(() => {
      setIsSubmitting(false);
      playScannerBeep('success');
      onRechargeSuccess(numAmount, currency);
      alert(
        `🎉 充值申请已提交！\n- 结算账户：${settlementAccount}\n- 充值币种：${currency}\n- 充值金额：${numAmount.toLocaleString()}\n- 汇款方式：${paymentMethod}\n- 账户户名：${accountName}\n财务将在核验到账后为您自动入账！`
      );
      onClose();
    }, 900);
  };

  // Account display items
  const accountInfoList = [
    { key: 'bankName', label: '银行名称', value: '农业银行', canCopy: true },
    { key: 'bankNo', label: '银行账号', value: '1', canCopy: true, highlight: true },
    { key: 'holder', label: '开户人', value: '1', canCopy: true },
    { key: 'branch', label: '开户支行', value: '1121212', canCopy: true },
    { key: 'address', label: '银行地址', value: '12', canCopy: false },
    { key: 'routing', label: '银行路由号', value: '（空）', canCopy: false, isMuted: true },
    { key: 'swift', label: 'Swift 国际代码', value: '（空）', canCopy: false, isMuted: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 md:p-4 select-none animate-fadeIn">
      {/* Main Mobile Device Container */}
      <div className="w-full max-w-[430px] h-full md:h-[890px] bg-slate-100 text-slate-800 flex flex-col relative overflow-hidden md:rounded-[44px] md:shadow-[0_25px_80px_rgba(0,0,0,0.85)] md:border-[10px] md:border-slate-800">
        
        {/* Dynamic Island / Top Notch */}
        <div className="hidden md:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 pointer-events-none" />

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
            id="mobile-recharge-back-btn"
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
            <h2 className="font-bold text-base leading-tight">账户充值</h2>
          </div>

          {/* Close button */}
          <button
            id="mobile-recharge-close-btn"
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

        {/* 3. Mobile Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">

          {/* Top Card: 当前用户可用额度 & 币种余额切换 */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-3.5 shadow-md shadow-blue-600/20 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between text-xs text-blue-100 mb-2">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-blue-200" />
                <span className="font-semibold text-xs">当前用户可用额度</span>
              </div>

              {/* 币种切换按钮组 */}
              <div className="flex items-center bg-black/25 p-0.5 rounded-lg backdrop-blur-xs border border-white/10">
                {(['CNY', 'USD', 'EUR'] as const).map((currCode) => {
                  const isActive = displayCurrency === currCode;
                  return (
                    <button
                      key={currCode}
                      id={`wallet-currency-toggle-${currCode}`}
                      type="button"
                      onClick={() => {
                        playScannerBeep('click');
                        setDisplayCurrency(currCode);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-blue-100 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {currCode}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-baseline mt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-blue-200">
                  {walletBalances[displayCurrency].symbol}
                </span>
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  {walletBalances[displayCurrency].amount}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information Display Card (收款账户) */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
            <div className="pb-2.5 mb-2.5 border-b border-slate-100 flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>收款账户</span>
            </div>

            <div className="space-y-2 text-xs">
              {accountInfoList.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors"
                >
                  <span className="text-slate-500 text-[11px] font-medium shrink-0">
                    {item.label}：
                  </span>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className={`font-mono text-right truncate ${
                        item.highlight
                          ? 'font-black text-blue-700 text-xs'
                          : item.isMuted
                          ? 'text-slate-400 italic'
                          : 'font-semibold text-slate-800'
                      }`}
                    >
                      {item.value}
                    </span>
                    {item.canCopy && item.value !== '（空）' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.key, item.value)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition-all shrink-0 flex items-center gap-0.5 ${
                          copiedKey === item.key
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-300'
                        }`}
                        title="点击复制"
                      >
                        {copiedKey === item.key ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>复制</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recharge Form Area */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3.5">
            <div className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>充值信息</span>
              <span className="text-[10px] text-slate-400 font-normal">带 * 为必填项</span>
            </div>

            {/* Field 1: 结算账户 */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                结算账户 <span className="text-red-500">*</span>
              </label>
              <select
                id="recharge-settlement-account-select"
                value={settlementAccount}
                onChange={(e) => setSettlementAccount(e.target.value)}
                className={`w-full p-2.5 border rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium ${
                  !settlementAccount ? 'text-slate-400 border-slate-200' : 'border-slate-300 text-slate-800 font-bold'
                }`}
              >
                <option value="" disabled>
                  请选择结算账户
                </option>
                <option value="企业主结算账户 (主钱包)">企业主结算账户 (主钱包)</option>
                <option value="跨境代发结算专户">跨境代发结算专户</option>
                <option value="海外仓储物流专户">海外仓储物流专户</option>
                <option value="FBA转运与换标结算账户">FBA转运与换标结算账户</option>
              </select>
              <p className="text-[11px] text-red-500 mt-1 flex items-start gap-1 leading-normal">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>当前充值到哪个账户结算钱包（如开启多钱包结算，充值前请与客服经理确认）</span>
              </p>
            </div>

            {/* Field 2: 充值币种 */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                充值币种 <span className="text-red-500">*</span>
              </label>
              <select
                id="recharge-currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`w-full p-2.5 border rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium ${
                  !currency ? 'text-slate-400 border-slate-200' : 'border-slate-300 text-slate-800 font-bold'
                }`}
              >
                <option value="" disabled>
                  请选择充值币种
                </option>
                <option value="CNY">CNY 人民币</option>
                <option value="USD">USD 美元</option>
                <option value="EUR">EUR 欧元</option>
                <option value="HKD">HKD 港币</option>
                <option value="GBP">GBP 英镑</option>
              </select>
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 leading-normal">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>当前转账的币种</span>
              </p>
            </div>

            {/* Field 3: 充值金额 */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                充值金额 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="recharge-amount-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="请输入充值金额"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold bg-slate-50 text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                {currency && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 pointer-events-none">
                    {currency}
                  </span>
                )}
              </div>
            </div>

            {/* Field 4: 汇款方式 */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                汇款方式
              </label>
              <select
                id="recharge-payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="支付宝">支付宝（默认）</option>
                <option value="微信支付">微信支付</option>
                <option value="银行对公转账">银行对公转账</option>
                <option value="个人网银转账">个人网银转账</option>
                <option value="国际电汇 (T/T)">国际电汇 (T/T)</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>

            {/* Field 5: 账户户名 */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                账户户名 <span className="text-red-500">*</span>
              </label>
              <input
                id="recharge-account-name-input"
                type="text"
                placeholder="账户户名"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 leading-normal">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>若实际户名与所填不一致可能导致无法正常入账</span>
              </p>
            </div>

            {/* Field 6: 汇款日期 */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                汇款日期
              </label>
              <div className="relative">
                <input
                  id="recharge-remittance-date-input"
                  type="date"
                  value={remittanceDate}
                  onChange={(e) => setRemittanceDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Field 7: 上传凭证 */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                上传凭证
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="recharge-voucher-file-input"
              />

              {!voucherUrl ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    id="recharge-voucher-upload-btn"
                    onClick={() => {
                      playScannerBeep('click');
                      fileInputRef.current?.click();
                    }}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-all cursor-pointer group shrink-0"
                  >
                    <Plus className="w-6 h-6 stroke-[2.5] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] mt-1 font-medium">上传凭证</span>
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-700">状态：</span>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        未上传
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      点击「+」按钮选择转账电子回单或截图 (支持 JPG / PNG)
                    </p>
                    {/* Quick Demo Upload Button for convenience */}
                    <button
                      type="button"
                      onClick={handleSimulateVoucher}
                      className="text-[10px] text-blue-600 hover:text-blue-700 underline font-medium block pt-0.5"
                    >
                      一键填入示例回单
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                    <img
                      src={voucherUrl}
                      alt="凭证预览"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>已上传凭证</span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium truncate mt-0.5">
                      {voucherName || '转账凭证.jpg'}
                    </p>
                    <span className="text-[10px] text-slate-400">已就绪待核对</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="删除已选凭证"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Inline Error Tip */}
            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}
          </div>

          {/* Security Guarantee notice */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">入账说明：</span>
            <span>请务必核对收款账户与填写的汇款户名一致。提交充值后，客服及财务专员将在5-15分钟内完成银行流水对账并直接充值至您的指定结算账户。</span>
          </div>
        </div>

        {/* 4. Sticky Mobile Bottom Bar */}
        <div className="bg-white border-t border-slate-200/80 px-4 py-3 z-30 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-slate-400">充值申报金额</div>
              <div className="text-lg font-black font-mono text-blue-600 flex items-baseline gap-0.5">
                <span>{currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : currency === 'EUR' ? '€' : ''}</span>
                <span>{amount ? parseFloat(amount).toLocaleString() || amount : '0.00'}</span>
                <span className="text-[10px] text-slate-500 font-normal ml-1">
                  {currency || '未选币种'}
                </span>
              </div>
            </div>

            <button
              id="mobile-recharge-submit-btn"
              onClick={handleConfirmRecharge}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>正在提交申请...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>确认提交充值</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5. Mobile Home Indicator Bar */}
        <div className="py-1.5 bg-white shrink-0 flex justify-center">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>

      </div>
    </div>
  );
};

