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

export interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
  message: string;
  status: "success" | "error";
}

export interface TwoFASetupResponse {
  qrCode: string;
  secret: string;
}

// Balance Types
export interface Balances {
  main: number;
  mining: number;
  trade: number;
  realEstate: number;
  referral: number;
}

// Transaction Types
export interface Trade {
  _id: string;
  tradeType: string;
  pair: string;
  amount: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
  duration: number;
  direction: "long" | "short";
  isSwap: boolean;
  status: "pending" | "active" | "completed" | "cancelled";
  result?: "win" | "loss";
  createdAt: string;
}

export interface Deposit {
  _id: string;
  method: string;
  amount: number;
  currency: string;
  proof?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  balanceType: string;
  method: string;
  amount: number;
  currency: string;
  details: string;
  withdrawalCode?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Staking {
  _id: string;
  poolId: string;
  poolName?: string;
  amount: number;
  durationDays: number;
  status: "active" | "completed";
  createdAt: string;
}

export interface RealEstateInvestment {
  _id: string;
  realEstateId: string;
  realEstateTitle?: string;
  amount: number;
  durationMonths: number;
  status: "active" | "completed";
  createdAt: string;
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
  documents: string[];
  projectBreakdown: string;
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
  isFollowing?: boolean;
}

export interface DepositMethod {
  _id: string;
  method: string;
}

export interface WithdrawalMethod {
  _id: string;
  method: string;
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
  password?: string;
  twoFactorEnabled?: boolean;
}

export interface SubscribeRequest {
  planId: string;
  amount: number;
}

export interface PurchaseSignalRequest {
  signalPriceId: string;
  amount: number;
}

export interface StakeRequest {
  poolId: string;
  amount: number;
  durationDays: number;
}

export interface TradeRequest {
  tradeType: string;
  pair: string;
  amount: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
  duration: number;
  direction: "long" | "short";
  isSwap?: boolean;
}

export interface RealEstateInvestRequest {
  realEstateId: string;
  amount: number;
  durationMonths: number;
}

export interface DepositRequest {
  method: string;
  amount: number;
  currency: string;
  proof?: File;
}

export interface WithdrawalRequest {
  balanceType: string;
  method: string;
  amount: number;
  currency: string;
  details: string;
  withdrawalCode: string;
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
  documents: string[];
  projectBreakdown: string;
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
  method: string;
}

export interface CreateWithdrawalMethodRequest {
  method: string;
}

export interface UpdateDepositStatusRequest {
  status: "approved" | "rejected";
}

export interface UpdateWithdrawalStatusRequest {
  status: "approved" | "rejected";
}

export interface UpdateUserRequest {
  balances?: Partial<Balances>;
  signalStrength?: number;
  kycStatus?: "pending" | "approved" | "rejected";
}

