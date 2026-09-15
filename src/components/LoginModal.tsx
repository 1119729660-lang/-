import React, { useState } from 'react';
import {
  Fingerprint,
  QrCode,
  Smartphone,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  X,
  ScanFace,
} from 'lucide-react';
import { StoreAccount } from '../types';
import { playScannerBeep } from './AudioBeep';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: StoreAccount) => void;
  currentAccount: StoreAccount;
  accounts: StoreAccount[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentAccount,
  accounts,
}) => {
  const [loginMethod, setLoginMethod] = useState<'wecom' | 'wechat' | 'password' | 'biometric'>('wecom');
  const [username, setUsername] = useState('admin@crossborder-wms.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(currentAccount.id);

  if (!isOpen) return null;

  const handleBiometricAuth = () => {
    setIsFaceScanning(true);
    setFaceScanSuccess(false);
    playScannerBeep('click');

    setTimeout(() => {
      setIsFaceScanning(false);
      setFaceScanSuccess(true);
      playScannerBeep('success');

      setTimeout(() => {
        const acc = accounts.find((a) => a.id === selectedAccountId) || currentAccount;
        onLoginSuccess(acc);
        onClose();
      }, 600);
    }, 1200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playScannerBeep('success');
    const acc = accounts.find((a) => a.id === selectedAccountId) || currentAccount;
    onLoginSuccess(acc);
    onClose();
  };

  const handleWecomScan = () => {
    playScannerBeep('success');
    const acc = accounts.find((a) => a.id === selectedAccountId) || currentAccount;
    onLoginSuccess(acc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white relative">
          <button
            id="login-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded bg-white/20 font-medium">企业多端统一接入</span>
          </div>
          <h2 className="text-lg font-bold">登录易境通海外仓 ERP</h2>
          <p className="text-xs text-blue-100/90 mt-0.5">支持企微扫码 / 微信互联 / 生物识别秒级登录</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1 text-xs">
          {[
            { id: 'wecom', label: '企微扫码', icon: QrCode },
            { id: 'biometric', label: 'Face ID', icon: ScanFace },
            { id: 'wechat', label: '微信一键', icon: Smartphone },
            { id: 'password', label: '密码登录', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = loginMethod === tab.id;
            return (
              <button
                key={tab.id}
                id={`login-tab-${tab.id}`}
                onClick={() => setLoginMethod(tab.id as any)}
                className={`flex-1 py-2 flex flex-col items-center gap-1 rounded-lg transition-all ${
                  active ? 'bg-white font-semibold text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Method Body */}
        <div className="p-5">
          {/* WeCom QR code mode */}
          {loginMethod === 'wecom' && (
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative p-3 bg-white border-2 border-dashed border-blue-200 rounded-xl shadow-sm group cursor-pointer" onClick={handleWecomScan}>
                {/* Fake QR Graphic */}
                <div className="w-40 h-40 bg-slate-900 rounded-lg p-2 flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-white rounded">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 5 === 0) && i !== 14 && i !== 21
                            ? 'bg-slate-900'
                            : 'bg-transparent'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                  点击模拟企微扫码授权
                </div>
              </div>

              <div className="text-xs text-slate-500 pt-2">
                <p>使用 <b className="text-slate-800">企业微信 App</b> 扫一扫即可免密登入</p>
                <p className="text-[11px] text-slate-400 mt-1">已自动关联企业通讯录与海外仓角色权限</p>
              </div>

              <button
                id="login-simulate-wecom-btn"
                onClick={handleWecomScan}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
              >
                直接以当前企微身份授权进入
              </button>
            </div>
          )}

          {/* Biometric (Face ID / Fingerprint) */}
          {loginMethod === 'biometric' && (
            <div className="flex flex-col items-center text-center space-y-4 py-2">
              <div className="relative w-28 h-28 rounded-full border-2 border-blue-500/40 flex items-center justify-center bg-blue-50/50">
                {isFaceScanning ? (
                  <div className="flex flex-col items-center">
                    <ScanFace className="w-12 h-12 text-blue-600 animate-pulse" />
                    <span className="text-[10px] text-blue-600 mt-1 font-mono">Verifying...</span>
                  </div>
                ) : faceScanSuccess ? (
                  <CheckCircle2 className="w-14 h-14 text-emerald-600 animate-bounce" />
                ) : (
                  <ScanFace className="w-14 h-14 text-slate-700" />
                )}

                {isFaceScanning && (
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-800">
                  {isFaceScanning ? '正在验证面容 ID...' : faceScanSuccess ? '验证通过！正在跳转' : '快速生物识别登录'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  已开启安全硬件模块支持 (Face ID / 指纹 Touch ID)
                </p>
              </div>

              <button
                id="login-start-faceid-btn"
                onClick={handleBiometricAuth}
                disabled={isFaceScanning}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Fingerprint className="w-4 h-4" />
                <span>立即唤起 Face ID / 指纹验证</span>
              </button>
            </div>
          )}

          {/* WeChat 1-click */}
          {loginMethod === 'wechat' && (
            <div className="flex flex-col items-center text-center space-y-4 py-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-800">微信客户端一键授权登录</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  绑定微信账号：wx_chen9982 (已实名)
                </p>
              </div>
              <button
                id="login-wechat-oneclick-btn"
                onClick={handleWecomScan}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
              >
                一键授权登录 (免密)
              </button>
            </div>
          )}

          {/* Account / Password */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">统一企业账号 / 邮箱</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="login-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    placeholder="输入企业工号或邮箱"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">登录密码</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="login-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    placeholder="输入密码"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>30天内保持此设备免密登录</span>
                </label>
                <a href="#forgot" className="text-blue-600 hover:underline">忘记密码?</a>
              </div>

              <button
                id="login-submit-pwd-btn"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
              >
                立即登录
              </button>
            </form>
          )}

          {/* Switch Target Store Account preview */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] text-slate-400 mb-1.5 flex justify-between">
              <span>登录后默认载入店铺：</span>
              <span className="text-blue-600 font-medium">{accounts.length}个授权店铺</span>
            </div>
            <select
              id="login-account-select"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.platform} · {acc.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
