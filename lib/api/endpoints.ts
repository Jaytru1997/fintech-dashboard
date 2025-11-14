import api from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TwoFASetupResponse,
  UpdateProfileRequest,
  UpdateSecurityRequest,
  Balances,
  User,
  Trade,
  Deposit,
  Withdrawal,
  Staking,
  RealEstateInvestment,
  MiningPool,
  RealEstate,
  SubscriptionPlan,
  SignalPrice,
  CopyTrader,
  DepositMethod,
  WithdrawalMethod,
  SubscribeRequest,
  PurchaseSignalRequest,
  StakeRequest,
  TradeRequest,
  RealEstateInvestRequest,
  DepositRequest,
  WithdrawalRequest,
  CreateRealEstateRequest,
  CreateMiningPoolRequest,
  CreateCopyTraderRequest,
  CreateSubscriptionPlanRequest,
  CreateSignalPriceRequest,
  CreateDepositMethodRequest,
  CreateWithdrawalMethodRequest,
  UpdateDepositStatusRequest,
  UpdateWithdrawalStatusRequest,
  UpdateUserRequest,
  AdminUser,
} from "@/lib/types";

// Auth Endpoints
export const authApi = {
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post("/auth/register", data),
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post("/auth/login", data),
  requestPasswordReset: (data: { email: string }): Promise<void> =>
    api.post("/auth/reset-password/request", data),
  confirmPasswordReset: (data: {
    token: string;
    newPassword: string;
  }): Promise<void> => api.post("/auth/reset-password/confirm", data),
  setup2FA: (): Promise<TwoFASetupResponse> => api.post("/auth/2fa/setup"),
  verify2FA: (data: { token: string }): Promise<void> =>
    api.post("/auth/2fa/verify", data),
  enable2FA: (data: { token: string }): Promise<void> =>
    api.post("/auth/2fa/enable", data),
};

// User Endpoints
export const userApi = {
  getProfile: (): Promise<User> => api.get("/user/profile"),
  updateProfile: (data: UpdateProfileRequest): Promise<User> =>
    api.patch("/user/profile", data),
  updateSecurity: (data: UpdateSecurityRequest): Promise<void> =>
    api.patch("/user/security", data),
  deleteAccount: (): Promise<void> => api.delete("/user/account"),
  submitKYC: (formData: FormData): Promise<void> =>
    api.post("/user/kyc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getBalances: (): Promise<Balances> => api.get("/user/balances"),
  updateCurrency: (data: { currency: string }): Promise<void> =>
    api.patch("/user/currency", data),
  subscribe: (data: SubscribeRequest): Promise<void> =>
    api.post("/user/subscribe", data),
  purchaseSignal: (data: PurchaseSignalRequest): Promise<void> =>
    api.post("/user/signal/purchase", data),
  stake: (data: StakeRequest): Promise<void> => api.post("/user/stake", data),
  trade: (data: TradeRequest): Promise<void> => api.post("/user/trade", data),
  investRealEstate: (data: RealEstateInvestRequest): Promise<void> =>
    api.post("/user/real-estate/invest", data),
  deposit: (formData: FormData): Promise<Deposit> =>
    api.post("/user/deposit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  withdrawal: (data: WithdrawalRequest): Promise<Withdrawal> =>
    api.post("/user/withdrawal", data),
  followCopyTrader: (data: { traderId: string }): Promise<void> =>
    api.post("/user/copy-trader/follow", data),
  unfollowCopyTrader: (data: { traderId: string }): Promise<void> =>
    api.post("/user/copy-trader/unfollow", data),
  getTrades: (): Promise<Trade[]> => api.get("/user/trades"),
  getDeposits: (): Promise<Deposit[]> => api.get("/user/deposits"),
  getWithdrawals: (): Promise<Withdrawal[]> => api.get("/user/withdrawals"),
  getStakings: (): Promise<Staking[]> => api.get("/user/stakings"),
  getRealEstateInvestments: (): Promise<RealEstateInvestment[]> =>
    api.get("/user/real-estate-investments"),
  getDepositMethods: (): Promise<DepositMethod[]> =>
    api.get("/user/deposit-methods"),
  getWithdrawalMethods: (): Promise<WithdrawalMethod[]> =>
    api.get("/user/withdrawal-methods"),
  getMiningPools: (): Promise<MiningPool[]> => api.get("/user/mining-pools"),
  getRealEstate: (): Promise<RealEstate[]> => api.get("/user/real-estate"),
  getSubscriptionPlans: (): Promise<SubscriptionPlan[]> =>
    api.get("/user/subscription-plans"),
  getSignalPrices: (): Promise<SignalPrice[]> =>
    api.get("/user/signal-prices"),
  getCopyTraders: (): Promise<CopyTrader[]> =>
    api.get("/user/copy-traders"),
};

// Admin Endpoints
export const adminApi = {
  createRealEstate: (data: CreateRealEstateRequest): Promise<RealEstate> =>
    api.post("/admin/real-estate", data),
  updateRealEstate: (
    id: string,
    data: Partial<CreateRealEstateRequest>
  ): Promise<RealEstate> => api.patch(`/admin/real-estate/${id}`, data),
  getRealEstate: (): Promise<RealEstate[]> =>
    api.get("/admin/real-estate"),
  createMiningPool: (data: CreateMiningPoolRequest): Promise<MiningPool> =>
    api.post("/admin/mining-pool", data),
  updateMiningPool: (
    id: string,
    data: Partial<CreateMiningPoolRequest>
  ): Promise<MiningPool> => api.patch(`/admin/mining-pool/${id}`, data),
  getMiningPools: (): Promise<MiningPool[]> =>
    api.get("/admin/mining-pools"),
  createCopyTrader: (data: CreateCopyTraderRequest): Promise<CopyTrader> =>
    api.post("/admin/copy-trader", data),
  updateCopyTrader: (
    id: string,
    data: Partial<CreateCopyTraderRequest>
  ): Promise<CopyTrader> => api.patch(`/admin/copy-trader/${id}`, data),
  getCopyTraders: (): Promise<CopyTrader[]> =>
    api.get("/admin/copy-traders"),
  createSubscriptionPlan: (
    data: CreateSubscriptionPlanRequest
  ): Promise<SubscriptionPlan> => api.post("/admin/subscription-plan", data),
  updateSubscriptionPlan: (
    id: string,
    data: Partial<CreateSubscriptionPlanRequest>
  ): Promise<SubscriptionPlan> =>
    api.patch(`/admin/subscription-plan/${id}`, data),
  getSubscriptionPlans: (): Promise<SubscriptionPlan[]> =>
    api.get("/admin/subscription-plans"),
  createSignalPrice: (data: CreateSignalPriceRequest): Promise<SignalPrice> =>
    api.post("/admin/signal-price", data),
  updateSignalPrice: (
    id: string,
    data: Partial<CreateSignalPriceRequest>
  ): Promise<SignalPrice> => api.patch(`/admin/signal-price/${id}`, data),
  getSignalPrices: (): Promise<SignalPrice[]> =>
    api.get("/admin/signal-prices"),
  createDepositMethod: (
    data: CreateDepositMethodRequest
  ): Promise<DepositMethod> => api.post("/admin/deposit-method", data),
  updateDepositMethod: (
    id: string,
    data: Partial<CreateDepositMethodRequest>
  ): Promise<DepositMethod> => api.patch(`/admin/deposit-method/${id}`, data),
  getDepositMethods: (): Promise<DepositMethod[]> =>
    api.get("/admin/deposit-methods"),
  createWithdrawalMethod: (
    data: CreateWithdrawalMethodRequest
  ): Promise<WithdrawalMethod> => api.post("/admin/withdrawal-method", data),
  updateWithdrawalMethod: (
    id: string,
    data: Partial<CreateWithdrawalMethodRequest>
  ): Promise<WithdrawalMethod> =>
    api.patch(`/admin/withdrawal-method/${id}`, data),
  getWithdrawalMethods: (): Promise<WithdrawalMethod[]> =>
    api.get("/admin/withdrawal-methods"),
  getDeposits: (): Promise<Deposit[]> => api.get("/admin/deposits"),
  updateDepositStatus: (
    id: string,
    data: UpdateDepositStatusRequest
  ): Promise<Deposit> => api.patch(`/admin/deposit/${id}`, data),
  getWithdrawals: (): Promise<Withdrawal[]> => api.get("/admin/withdrawals"),
  generateWithdrawalCode: (id: string): Promise<{ code: string }> =>
    api.post(`/admin/withdrawal/${id}/generate-code`),
  updateWithdrawalStatus: (
    id: string,
    data: UpdateWithdrawalStatusRequest
  ): Promise<Withdrawal> => api.patch(`/admin/withdrawal/${id}`, data),
  getUsers: (): Promise<AdminUser[]> => api.get("/admin/users"),
  getUserById: (id: string): Promise<AdminUser> =>
    api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: UpdateUserRequest): Promise<AdminUser> =>
    api.patch(`/admin/users/${id}`, data),
  approveKYC: (id: string): Promise<void> =>
    api.post(`/admin/users/${id}/kyc/approve`),
  rejectKYC: (id: string): Promise<void> =>
    api.post(`/admin/users/${id}/kyc/reject`),
  getTrades: (): Promise<Trade[]> => api.get("/admin/trades"),
  updateTrade: (
    id: string,
    data: { status?: string; result?: "win" | "loss" }
  ): Promise<Trade> => api.patch(`/admin/trades/${id}`, data),
};

