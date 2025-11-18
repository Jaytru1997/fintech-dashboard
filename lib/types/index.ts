// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneNumber: string;
  profilePicture?: string;
  currency: string;
  signalStrength: number;
  kycStatus: "pending" | "approved" | "rejected";
  twoFactorEnabled: boolean;
  isAdmin: boolean;
  balances?: Balances;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneNumber: string;
  password: string;
  passwordRepeat: string;
  currency: string;
  referralCode?: string;
}

// AuthResponse after API client extraction (data field is extracted)
export interface AuthResponse {
  token: string;
  user: User;
}

// TwoFASetupResponse after API client extraction
export interface TwoFASetupResponse {
  secret: string;
  qrCode: string;
}

// Balance Types
export interface Balances {
  main: {amount: number; currency: string};
  mining: {amount: number; currency: string};
  trade: {amount: number; currency: string};
  realEstate: {amount: number; currency: string};
  referral: {amount: number; currency: string};
}

// Transaction Types
export interface Trade {
  _id: string;
  userId?: string;
  tradeType: string;
  pair: string;
  amount: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
  duration: number;
  direction: "BUY" | "SELL";
  isSwap?: boolean;
  swapPair?: string;
  status: "open" | "closed" | "canceled";
  result?: "win" | "loss";
  createdAt: string;
}

export interface Deposit {
  _id: string;
  userId?: string;
  methodId?: string;
  amount: number;
  currency: string;
  proof?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  userId?: string;
  balanceType: "main" | "mining" | "trade" | "realEstate" | "referral";
  methodId?: string;
  amount: number;
  currency: string;
  details?: Record<string, any>;
  withdrawalCode?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Staking {
  _id: string;
  poolId: string | MiningPool;
  userId?: string;
  amount: number;
  roi: number;
  cycle: "daily" | "weekly" | "monthly";
  startDate: string;
  endDate: string;
  poolName?: string;
  durationDays?: number;
  status?: string;
  createdAt?: string;
}

export interface RealEstateInvestment {
  _id: string;
  realEstateId: string;
  userId?: string;
  amount: number;
  roi: number;
  duration: number;
  startDate: string;
  realEstateTitle?: string;
  durationMonths?: number;
  status?: string;
  createdAt?: string;
}

// Resource Types
export interface MiningPool {
  _id: string;
  name: string;
  roi: number;
  cycle: string;
  minStake: number;
  durationDays: number;
}

export interface RealEstate {
  _id: string;
  title: string;
  image: string;
  minimumInvestment: number;
  roi: number;
  strategy: string;
  overview: string;
  documents?: string[];
  type: string;
  kind: string;
  objective: string;
  whyThisProject: string;
  whyThisSponsor: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
}

export interface SignalPrice {
  _id: string;
  amount: number;
  signalValue: number;
}

export interface CopyTrader {
  _id: string;
  name: string;
  description: string;
  performance: number;
  image?: string;
  isFollowing?: boolean;
}

export interface DepositMethod {
  _id: string;
  name: string;
  type: string;
  details?: Record<string, string>;
  isActive: boolean;
}

export interface WithdrawalMethod {
  _id: string;
  name: string;
  type: string;
  details?: Record<string, string>;
  isActive: boolean;
}

// Request Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface UpdateSecurityRequest {
  currentPassword?: string;
  newPassword?: string;
  twoFactorToken?: string;
}

export interface SubscribeRequest {
  planId: string;
}

export interface PurchaseSignalRequest {
  signalPriceId: string;
  amount: number;
}

export interface StakeRequest {
  poolId: string;
  amount: number;
}

export interface TradeRequest {
  tradeType: string;
  pair: string;
  amount: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
  duration: number;
  direction: "BUY" | "SELL";
  isSwap?: boolean;
  swapPair?: string;
}

export interface RealEstateInvestRequest {
  realEstateId: string;
  amount: number;
  duration: number;
}

export interface DepositRequest {
  methodId: string;
  amount: number;
  currency: string;
  proof: File;
}

export interface WithdrawalRequest {
  balanceType: "main" | "mining" | "trade" | "realEstate" | "referral";
  methodId: string;
  amount: number;
  currency: string;
  details?: Record<string, any>;
  withdrawalCode?: string;
}

// Admin Types
export interface AdminUser extends User {
  balances?: Balances;
}

export interface CreateRealEstateRequest {
  title: string;
  image: string;
  minimumInvestment: number;
  roi: number;
  strategy: string;
  overview: string;
  documents?: string[];
  type: string;
  kind: string;
  objective: string;
  whyThisProject: string;
  whyThisSponsor: string;
}

export interface CreateMiningPoolRequest {
  name: string;
  roi: number;
  cycle: string;
  minStake: number;
  durationDays: number;
}

export interface CreateCopyTraderRequest {
  name: string;
  description: string;
  performance: number;
  image?: File | null;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  minAmount: number;
  maxAmount: number;
}

export interface CreateSignalPriceRequest {
  amount: number;
  signalValue: number;
}

export interface CreateDepositMethodRequest {
  name: string;
  type: string;
  details?: Record<string, string>;
  isActive?: boolean;
}

export interface CreateWithdrawalMethodRequest {
  name: string;
  type: string;
  details?: Record<string, string>;
  isActive?: boolean;
}

export interface UpdateDepositStatusRequest {
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
}

export interface UpdateWithdrawalStatusRequest {
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
}

export interface UpdateUserRequest {
  mainBalance?: number;
  miningBalance?: number;
  tradeBalance?: number;
  realEstateBalance?: number;
  referralBalance?: number;
  signalStrength?: number;
  kycStatus?: "pending" | "approved" | "rejected";
  isAdmin?: boolean;
}

