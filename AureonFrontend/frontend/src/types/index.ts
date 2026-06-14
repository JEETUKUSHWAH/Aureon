// ── Auth Types ──────────────────────────────────────────
export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'BUSINESS_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  avatarUrl?: string;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ── Account Types ────────────────────────────────────────
export type AccountType = 'CHECKING' | 'SAVINGS';
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
}

// ── Transaction Types ─────────────────────────────────────
export type TransactionType = 'ACH' | 'WIRE' | 'INTERNATIONAL' | 'INTERNAL';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  recipientName?: string;
  createdAt: string;
}

// ── Card Types ────────────────────────────────────────────
export type CardType = 'VIRTUAL' | 'PHYSICAL';
export type CardStatus = 'ACTIVE' | 'FROZEN' | 'EXPIRED' | 'CANCELLED';

export interface Card {
  id: string;
  accountId: string;
  type: CardType;
  lastFour: string;
  cardholderName: string;
  expiryDate: string;
  spendingLimit: number;
  currentSpend: number;
  status: CardStatus;
  createdAt: string;
}

// ── Invoice Types ─────────────────────────────────────────
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  isRecurring: boolean;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

// ── Expense Types ─────────────────────────────────────────
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ExpenseCategory = 
  | 'MARKETING' | 'PAYROLL' | 'SUBSCRIPTIONS' 
  | 'TRAVEL' | 'OFFICE' | 'UTILITIES' | 'OTHER';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  approvedBy?: string;
  createdAt: string;
}

// ── Dashboard / Charts ────────────────────────────────────
export interface CashFlowDataPoint {
  month: string;
  inflow: number;
  outflow: number;
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  pendingInvoices: number;
  pendingExpenses: number;
  cashFlowData: CashFlowDataPoint[];
  recentTransactions: Transaction[];
}

// ── API Response ──────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}
