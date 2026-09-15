import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, User, Clock, AlertTriangle, X } from 'lucide-react';
import { ApprovalItem } from '../types';
import { playScannerBeep } from './AudioBeep';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval: ApprovalItem | null;
  onAction: (id: string, decision: '已通过' | '已驳回', remarks: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  approval,
  onAction,
}) => {
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'pass' | 'reject'>('pass');

  if (!isOpen || !approval) return null;

  const handleConfirm = (decision: '已通过' | '已驳回') => {
    playScannerBeep(decision === '已通过' ? 'success' : 'alert');
    onAction(approval.id, decision, remarks);
    alert(`审批已完成：[${approval.title}] 状态已更新为【${decision}】！`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-slideUp">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                {approval.type}
              </span>
              <h3 className="font-bold text-slate-800 text-sm mt-0.5">跨境移动审批</h3>
            </div>
          </div>
          <button
            id="approval-close-btn"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs text-slate-700">
          {/* Main Title & Applicant */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-sm text-slate-800 leading-snug">{approval.title}</h4>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {approval.applicant} · {approval.department}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {approval.time}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100/70 px-3 py-1.5 font-semibold text-slate-700 text-[11px]">
              业务申报明细清单
            </div>
            <div className="divide-y divide-slate-100 p-1">
              {Object.entries(approval.details).map(([key, val]) => (
                <div key={key} className="py-2 px-2 flex justify-between text-xs">
                  <span className="text-slate-500">{key}</span>
                  <span className="font-semibold text-slate-800 text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {approval.notes && (
            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 text-blue-900 text-[11px]">
              <span className="font-semibold block mb-0.5">申请补充说明：</span>
              {approval.notes}
            </div>
          )}

          {/* Remarks input */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1">移动端审批意见 / 批注：</label>
            <textarea
              id="approval-remarks-input"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="请输入审批批注意见（如核准放行、补充资料或限额控制说明）..."
              className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex gap-2">
          <button
            id="approval-reject-btn"
            onClick={() => handleConfirm('已驳回')}
            className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>审批驳回</span>
          </button>
          <button
            id="approval-pass-btn"
            onClick={() => handleConfirm('已通过')}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>同意审批 (电子签署)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
