import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Warehouse,
  QrCode,
  Printer,
  AlertTriangle,
  Tag,
  Plus,
  Layers,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Share2,
  Box,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { InventoryItem, ProductItem } from '../types';
import { playScannerBeep } from '../components/AudioBeep';

interface InventoryViewProps {
  inventory: InventoryItem[];
  products: ProductItem[];
  initialSubTab?: 'inventory' | 'products';
  initialFilter?: string;
  onOpenScan: () => void;
  onOpenPrint: (item?: InventoryItem | ProductItem) => void;
  onOpenWorkOrderWithSku: (sku: string) => void;
  onAddNewProduct: (prod: ProductItem) => void;
  onSelectProduct?: (prod: ProductItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  products,
  initialSubTab = 'inventory',
  initialFilter = '全部',
  onOpenScan,
  onOpenPrint,
  onOpenWorkOrderWithSku,
  onAddNewProduct,
  onSelectProduct,
}) => {
  const [subTab, setSubTab] = useState<'inventory' | 'products'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('全部');
  const [selectedStockType, setSelectedStockType] = useState<string>('全部');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // New product form states
  const [newSku, setNewSku] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('电子数码');
  const [newWeight, setNewWeight] = useState(350);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // Warehouse
      if (selectedWarehouse !== '全部' && item.warehouse !== selectedWarehouse) return false;
      // Type
      if (selectedStockType !== '全部' && item.type !== selectedStockType) return false;
      // Status
      if (statusFilter === '缺货预警') {
        if (item.status !== '缺货' && item.status !== '低库存') return false;
      } else if (statusFilter !== '全部' && item.status !== statusFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.sku.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.barcode.includes(q) ||
          item.shelfLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inventory, selectedWarehouse, selectedStockType, statusFilter, searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.sku.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, searchQuery]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.trim() || !newTitle.trim()) {
      alert('请完整填写 SKU 与商品中文名称');
      return;
    }
    const item: ProductItem = {
      id: `prod_${Date.now()}`,
      sku: newSku.toUpperCase().trim(),
      title: newTitle.trim(),
      category: newCategory,
      barcode: `697${Math.floor(100000000 + Math.random() * 900000000)}`,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
      declareNameEn: 'Cross-Border Item',
      weightG: newWeight,
      dimensions: '150 x 100 x 50 mm',
      distributionStatus: '自营商品',
      stockTotal: 0,
      suppliers: '自建供应链',
    };
    playScannerBeep('success');
    onAddNewProduct(item);
    alert(`🎉 商品 SKU [${item.sku}] 建立成功！已同步至各海外仓待入库档案。`);
    setIsAddProductOpen(false);
    setNewSku('');
    setNewTitle('');
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Top Segment Controller */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex gap-1">
        <button
          id="inv-tab-inventory-btn"
          onClick={() => {
            playScannerBeep('click');
            setSubTab('inventory');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Warehouse className="w-3.5 h-3.5" />
          <span>海外仓储库存</span>
        </button>

        <button
          id="inv-tab-products-btn"
          onClick={() => {
            playScannerBeep('click');
            setSubTab('products');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'products'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>产品中心与分销</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="inv-search-input"
              type="text"
              placeholder="快速检索 SKU / 品名 / 条形码 / 货位..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            id="inv-scan-trigger-btn"
            onClick={onOpenScan}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0"
            title="扫码枪 / 相机扫码查货"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {subTab === 'products' && (
            <button
              id="prod-add-trigger-btn"
              onClick={() => setIsAddProductOpen(true)}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs"
              title="新建产品"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Warehouse, Status, and Attribute Dropdown Selects */}
        {subTab === 'inventory' && (
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            {/* 1. 仓库下拉菜单 (Warehouse Select) */}
            <div className="relative">
              <select
                id="inv-select-warehouse"
                value={selectedWarehouse}
                onChange={(e) => {
                  playScannerBeep('click');
                  setSelectedWarehouse(e.target.value);
                }}
                className={`w-full appearance-none pl-2.5 pr-7 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all cursor-pointer truncate ${
                  selectedWarehouse !== '全部'
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 font-semibold focus:border-blue-500'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-700 hover:bg-slate-100/70 focus:border-blue-500 focus:bg-white'
                }`}
              >
                <option value="全部">全部仓库</option>
                <option value="美西洛杉矶1号仓">美西1号仓</option>
                <option value="美东新泽西2号仓">美东2号仓</option>
                <option value="德国法兰克福海外仓">德国法兰克福仓</option>
                <option value="深圳前海保税中转仓">深圳保税中转仓</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 2. 状态下拉菜单 (Status Select) */}
            <div className="relative">
              <select
                id="inv-select-status"
                value={statusFilter}
                onChange={(e) => {
                  playScannerBeep('click');
                  setStatusFilter(e.target.value);
                }}
                className={`w-full appearance-none pl-2.5 pr-7 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all cursor-pointer truncate ${
                  statusFilter === '缺货' || statusFilter === '缺货预警'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700 font-bold focus:border-rose-500'
                    : statusFilter === '低库存'
                    ? 'bg-amber-50 border border-amber-200 text-amber-700 font-bold focus:border-amber-500'
                    : statusFilter === '正常'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold focus:border-emerald-500'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-700 hover:bg-slate-100/70 focus:border-blue-500 focus:bg-white'
                }`}
              >
                <option value="全部">全部状态</option>
                <option value="正常">库存正常</option>
                <option value="低库存">低库存</option>
                <option value="缺货">缺货</option>
                <option value="缺货预警">⚠️ 缺货预警</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 3. 属性下拉菜单 (Attribute Select) */}
            <div className="relative">
              <select
                id="inv-select-type"
                value={selectedStockType}
                onChange={(e) => {
                  playScannerBeep('click');
                  setSelectedStockType(e.target.value);
                }}
                className={`w-full appearance-none pl-2.5 pr-7 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all cursor-pointer truncate ${
                  selectedStockType !== '全部'
                    ? 'bg-slate-800 text-white font-semibold border border-slate-800'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-700 hover:bg-slate-100/70 focus:border-blue-500 focus:bg-white'
                }`}
              >
                <option value="全部">全部属性</option>
                <option value="自有库存">自有库存</option>
                <option value="中转库存">中转库存</option>
                <option value="组合库存">组合库存</option>
                <option value="分销库存">分销库存</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Content for Inventory vs Products */}
      {subTab === 'inventory' ? (
        <div className="space-y-2.5">
          {filteredInventory.map((item) => (
            <div
              key={item.sku}
              id={`inv-card-${item.sku}`}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 hover:border-blue-200 transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                      {item.sku}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.status === '缺货'
                          ? 'bg-red-100 text-red-700'
                          : item.status === '低库存'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 mt-1">
                    {item.name}
                  </h4>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{item.warehouse}</span>
                    <span className="font-mono text-slate-600 font-semibold bg-slate-100 px-1.5 rounded">
                      货位: {item.shelfLocation}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Numbers Row: Available, Locked, Transit, Safety */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-4 gap-1 text-center bg-slate-50/60 p-2 rounded-xl">
                <div>
                  <div className="text-[10px] text-slate-400">可用库存</div>
                  <div className={`font-bold font-mono text-sm ${item.availableQty === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {item.availableQty}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">待发锁定</div>
                  <div className="font-bold font-mono text-sm text-amber-600">
                    {item.lockedQty}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">头程在途</div>
                  <div className="font-bold font-mono text-sm text-blue-600">
                    {item.transitQty}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">安全库存</div>
                  <div className="font-bold font-mono text-sm text-slate-600">
                    {item.safetyQty}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action buttons */}
              <div className="mt-2.5 flex items-center justify-end gap-2">
                <button
                  id={`inv-btn-detail-${item.sku}`}
                  onClick={() => {
                    playScannerBeep('click');
                    const matched = products.find((p) => p.sku.toLowerCase() === item.sku.toLowerCase()) || {
                      id: `prod_${item.sku}`,
                      sku: item.sku,
                      sellerSku: item.sku,
                      fnsku: item.barcode,
                      title: item.name,
                      category: item.category,
                      barcode: item.barcode,
                      image: item.imageUrl,
                      declareNameEn: item.sku,
                      weightG: 500,
                      weight: '0.50',
                      dimensions: '100*100*100',
                      distributionStatus: '自营商品',
                      stockTotal: item.availableQty,
                      suppliers: item.warehouse,
                    };
                    onSelectProduct?.(matched as ProductItem);
                  }}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>详情</span>
                </button>
                <button
                  id={`inv-btn-wo-${item.sku}`}
                  onClick={() => onOpenWorkOrderWithSku(item.sku)}
                  className="px-2.5 py-1 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition-colors"
                >
                  提工单
                </button>
                <button
                  id={`inv-btn-print-${item.sku}`}
                  onClick={() => onOpenPrint(item)}
                  className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium flex items-center gap-1 transition-colors"
                >
                  <Printer className="w-3 h-3" />
                  <span>蓝牙打标</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Products List */
        <div className="space-y-2.5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              id={`prod-card-${prod.id}`}
              onClick={() => onSelectProduct?.(prod)}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {prod.image && prod.image !== '（空）' ? (
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 text-slate-400">
                    <Box className="w-6 h-6 text-blue-500 mb-0.5" />
                    <span className="text-[9px]">无图片</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {prod.sku}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                      {prod.distributionStatus}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 mt-1">
                    {prod.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>英文申报名: {prod.declareNameEn}</span>
                    <span>单重: {prod.weight || prod.weightG}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 mt-0.5">
                    分类: {prod.category} · FNSKU: {prod.fnsku || prod.barcode}
                  </div>
                </div>
              </div>

              {/* Product actions */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  全仓总库存: <b className="text-slate-800 font-mono">{prod.stockTotal}</b> 件
                </div>

                <div className="flex gap-2">
                  <button
                    id={`prod-detail-btn-${prod.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playScannerBeep('click');
                      onSelectProduct?.(prod);
                    }}
                    className="px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>详情</span>
                  </button>
                  <button
                    id={`prod-dist-apply-${prod.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playScannerBeep('success');
                      alert(`已为 SKU [${prod.sku}] 提交海外仓一件代发供销分销申请！`);
                    }}
                    className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-medium"
                  >
                    供销分销
                  </button>
                  <button
                    id={`prod-print-btn-${prod.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPrint(prod);
                    }}
                    className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    <span>打商品标</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl animate-slideUp">
            <h3 className="font-bold text-base text-slate-800 mb-1">录入新产品 SKU 简版</h3>
            <p className="text-xs text-slate-400 mb-4">快速建立商品主数据，支持关联海外仓并生成合规条码</p>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs text-slate-700">
              <div>
                <label className="font-semibold block mb-1">自定义 SKU 编码：</label>
                <input
                  id="add-prod-sku-input"
                  type="text"
                  placeholder="例如: US-SMART-PLUG-01"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono uppercase focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">商品中文品名：</label>
                <input
                  id="add-prod-title-input"
                  type="text"
                  placeholder="例如: 智能WiFi计量插座 (美标)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">所属类目：</label>
                  <select
                    id="add-prod-category-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="电子数码">电子数码</option>
                    <option value="家居生活">家居生活</option>
                    <option value="运动户外">运动户外</option>
                    <option value="安防监控">安防监控</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">单件净重 (克)：</label>
                  <input
                    id="add-prod-weight-input"
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  id="add-prod-cancel-btn"
                  onClick={() => setIsAddProductOpen(false)}
                  className="w-1/3 py-2 border border-slate-200 rounded-xl text-slate-600 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  id="add-prod-submit-btn"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-xs hover:bg-blue-700"
                >
                  保存并同步海外仓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
