export type TabType = 'workbench' | 'orders' | 'inventory' | 'messages' | 'finance';

export interface StoreAccount {
  id: string;
  name: string;
  code: string;
  platform: 'TikTok Shop' | 'Amazon' | 'Temu' | 'Shopify' | 'AliExpress';
  defaultWarehouse: string;
  currency: 'USD' | 'CNY' | 'EUR';
  role: '超级管理员' | '仓储主管' | '运营负责人' | '财务专员';
  avatar: string;
  unreadCount: number;
}

export interface TodoCount {
  stockout: number;
  pendingApproval: number;
  pendingPack: number;
  pendingReconcile: number;
}

export interface MetricData {
  balanceUSD: number;
  balanceCNY: number;
  stockoutSkuCount: number;
  todayShipments: number;
  todayOrders: number;
  transitShipments: number;
  fulfilmentRate: number;
  chartData: { day: string; shipments: number; orders: number }[];
}

export interface OrderItem {
  id: string;
  orderNo: string;
  type: '代发订单' | '头程订单' | '换标中转' | '退货质检';
  platformOrderNo?: string;
  storeName: string;
  warehouse: string;
  sku: string;
  productName: string;
  productImg: string;
  quantity: number;
  status: '待打单' | '待打包' | '已发货' | '缺货异常' | '运输中' | '已妥投' | '待入库';
  createdAt: string;
  trackingNo?: string;
  carrier?: string;
  recipientName: string;
  recipientCountry: string;
  recipientAddress: string;
  declaredValue: number;
  isUrgent?: boolean;
  boxCount?: number;
  weightKg?: number;
}

export interface InventoryItem {
  sku: string;
  name: string;
  warehouse: string;
  availableQty: number;
  lockedQty: number;
  transitQty: number;
  safetyQty: number;
  category: string;
  barcode: string;
  costPrice: number;
  sellPrice: number;
  status: '正常' | '缺货' | '低库存' | '滞销';
  type: '自有库存' | '中转库存' | '组合库存' | '分销库存';
  imageUrl: string;
  shelfLocation: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  title: string;
  category: string;
  barcode: string;
  image: string;
  declareNameEn: string;
  weightG: number;
  dimensions: string;
  distributionStatus: '自营商品' | '供销中' | '申请分销中' | '已分销';
  stockTotal: number;
  suppliers: string;
  // Extended product detail fields
  fnsku?: string;
  sellerSku?: string;
  weight?: string | number;
  customsCode?: string;
  originCountry?: string;
  specification?: string;
  color?: string;
  imageUrlNetwork?: string;
  snCodeStatus?: string;
  createdAt?: string;
  hasBattery?: string;
  isDistribution?: string;
  distributionPrice?: string | number;
  description?: string;
  platformSku?: string;
}

export interface BillItem {
  id: string;
  billNo: string;
  title: string;
  amount: number;
  currency: 'USD' | 'CNY' | 'EUR';
  type: '仓储账单' | '尾程账单' | '头程账单' | '换标服务费' | '账户充值';
  status: '待核销' | '已核销' | '已退款';
  dueDate: string;
  createdAt: string;
  description: string;
}

export interface ApprovalItem {
  id: string;
  type: '产品审核' | '分销申请' | '大额充值凭证' | '头程入库单' | '特殊折扣';
  title: string;
  applicant: string;
  department: string;
  time: string;
  status: '待我审批' | '已通过' | '已驳回';
  amount?: number;
  currency?: string;
  notes?: string;
  details: Record<string, string | number>;
}

export interface WorkOrderItem {
  id: string;
  workOrderNo: string;
  type: '拍照核验' | '换标贴标' | '破损维修' | '退件销毁' | '人工盘点';
  warehouse: string;
  sku?: string;
  orderNo?: string;
  status: '处理中' | '待指派' | '已完成' | '待确认';
  priority: '普通' | '紧急' | '特急';
  createdAt: string;
  description: string;
  photoCount: number;
  feedback?: string;
}

export interface MessageDetailField {
  label: string;
  value: string;
  isHighlight?: boolean;
  isDanger?: boolean;
  isSuccess?: boolean;
  copyable?: boolean;
}

export type MessageType =
  | 'stockout_alert'
  | 'order_shipped'
  | 'order_delivered'
  | 'inbound_completed'
  | 'audit_rejected'
  | 'audit_approved'
  | 'low_balance'
  | 'bill_pending'
  | 'workorder_update'
  | 'daily_report';

export interface MessageItem {
  id: string;
  msgType?: MessageType;
  category: '缺货预警' | '订单状态' | '头程物流' | '审核通知' | '财务账单' | '服务工单' | '业务日报' | string;
  title: string;
  content?: string;
  fields?: MessageDetailField[];
  suggestion?: string; // e.g. "建议：立即补货或联系买家改单" or "提醒：为避免扣费失败，请及时充值"
  conclusion?: string; // e.g. "妥投成功，订单闭环" or "库存已自动入账"
  timestamp: string;
  isRead: boolean;
  level: 'info' | 'warning' | 'danger' | 'success';
  actionText?: string;
  actionTargetTab?: TabType;
  actionTargetFilter?: string;
  actionType?: 'open_order' | 'open_tracking' | 'open_recharge' | 'open_workorder' | 'open_approval' | 'navigate_inventory' | 'navigate_finance' | 'navigate_orders';
  relatedOrderNo?: string;
  relatedOrderId?: string;
  relatedTrackingNo?: string;
  relatedSku?: string;
  relatedBillNo?: string;
  relatedWorkOrderNo?: string;
}

export interface Announcement {
  id: string;
  title: string;
  tag: string;
  date: string;
  urgent?: boolean;
}
