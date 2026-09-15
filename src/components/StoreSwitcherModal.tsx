import React from 'react';
import { Check, Plus, Store, Warehouse, ShieldAlert, X, ChevronRight } from 'lucide-react';
import { StoreAccount } from '../types';
import { playScannerBeep } from './AudioBeep';

interface StoreSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: StoreAccount;
  accounts: StoreAccount[];
  onSelectAccount: (account: StoreAccount) => void;
}

export const StoreSwitcherModal: React.FC<StoreSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  accounts,
  onSelectAccount,
}) => {
  if (!isOpen) return null;

  const handleSelect = (acc: StoreAccount) => {
    playScannerBeep('click');
    onSelectAccount(acc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 shadow-2xl animate-slideUp max-h-[85vh] flex flex-col">
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-3"></div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">账号切换</h3>
          </div>
          <button
            id="store-switcher-close-btn"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-2.5 overflow-y-auto flex-1">
          {accounts.map((acc) => {
            const isSelected = acc.id === currentAccount.id;
            return (
              <div
                key={acc.id}
                id={`store-item-${acc.id}`}
                onClick={() => handleSelect(acc)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-xs">{acc.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                        {acc.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Warehouse className="w-3 h-3 text-slate-400" />
                        {acc.defaultWarehouse}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-600 font-semibold">{acc.currency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {acc.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {acc.unreadCount}
                    </span>
                  )}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 flex gap-2">
          <button
            id="store-add-new-btn"
            onClick={() => {
              playScannerBeep('click');
              alert('已调起企业微信账号授权网关，可直接绑定新的海外仓/跨境电商主理账号。');
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>添加账号</span>
          </button>
        </div>
      </div>
    </div>
  );
};
