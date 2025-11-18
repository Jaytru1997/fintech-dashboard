# API Specification (v1)

This document mirrors the actual NestJS controllers and DTOs in `src/auth`, `src/user`, and `src/admin`. Whenever a DTO changes, update the corresponding sections below to keep the spec source-of-truth aligned with the code.

---

## Base Information

- **Base URLs**: `https://your-domain.com` (production) or `http://localhost:3000` (development)
- **Content Types**: `application/json` by default, `multipart/form-data` for file uploads
- **Authentication**: JWT in the `Authorization` header (`Bearer <token>`)
- **Rate Limiting / Pagination**: Not enforced at the API layer today; handle paging client-side where responses can grow large.

### Response Envelope

Successful handlers return:

```json
{
  "data": { ...payload... },
  "message": "Human readable text",
  "status": "success"
}
```

Errors follow NestJS defaults (statusCode, message, error) unless a handler throws a custom object.

---

## DTO Reference

Only the fields declared in each DTO are accepted by the controllers. Types and validation decorators below are copied from the TypeScript classes so this section stays accurate to runtime validation.

### Authentication DTOs (`src/auth/dto`)

**RegisterDto**
- `firstName`, `lastName`, `country`, `phoneNumber`, `currency`: string, required
- `email`: string, required, email format
- `password`, `passwordRepeat`: string, required, min length 6
- `referralCode`: string, optional

**LoginDto**
- `email`: string, required, email format
- `password`: string, required, min length 6

**RequestPasswordResetDto**
- `email`: string, required, email format

**ConfirmPasswordResetDto**
- `token`: string, required
- `newPassword`: string, required, min length 6

**Verify2FADto**
- `token`: string, required

**Enable2FADto**
- `secret`: string, required
- `token`: string, required

### User DTOs (`src/user/dto`)

**UpdateProfileDto**
- Optional strings: `firstName`, `lastName`, `email` (must be email), `country`, `phoneNumber`

**UpdateSecurityDto**
- Optional strings (min length 6 where noted): `currentPassword`, `newPassword`, `twoFactorToken`

**UpdateCurrencyDto**
- `currency`: string, required

**SubscribeDto**
- `planId`: MongoId string, required

**StakeDto**
- `poolId`: MongoId string, required
- `amount`: number >= 0, required

**TradeDto**
- Required: `tradeType` string, `pair` string, `amount` number >= 0, `leverage` number between 0 and 100, `duration` number, `direction` enum `'BUY' | 'SELL'`
- Optional: `takeProfit` number, `stopLoss` number, `isSwap` boolean, `swapPair` string

**RealEstateInvestDto**
- `realEstateId`: MongoId string, required
- `amount`: number >= 0, required
- `duration`: number >= 1 (months), required

**PurchaseSignalDto**
- `signalPriceId`: MongoId string, required
- `amount`: number >= 0, required

**DepositDto**
- `methodId`: MongoId string, required
- `amount`: number >= 0, required
- `currency`: string, required

**WithdrawalDto**
- `balanceType`: enum `'main' | 'mining' | 'trade' | 'realEstate' | 'referral'`, required
- `methodId`: MongoId string, required
- `amount`: number >= 0, required
- `currency`: string, required
- `details`: object, optional
- `withdrawalCode`: string, optional

### Admin DTOs (`src/admin/dto`)

**Create/UpdateRealEstateDto**
- Create requires: `title`, `image`, `minimumInvestment` (number >= 0), `roi` (number >= 0), `strategy`, `overview`, `type`, `kind`, `objective`, `whyThisProject`, `whyThisSponsor`
- Optional array `documents`
- Update version makes every field optional

**Create/UpdateMiningPoolDto**
- Create requires: `name`, `roi` (number >= 0), `cycle` enum `'daily' | 'weekly' | 'monthly'`, `minStake` (number >= 0), `durationDays` (number >= 1)
- Update version makes all fields optional

**Create/UpdateCopyTraderDto**
- Create requires: `name`, `description`, `performance` (number >= 0); optional `image`
- Update version: all fields optional

**Create/UpdateSubscriptionPlanDto**
- Create requires: `name`, `minAmount` >= 0, `maxAmount` >= 0
- Update version: all optional

**Create/UpdateSignalPriceDto**
- Create requires: `amount` >= 0, `signalValue` >= 0
- Update version: all optional

**Create/UpdateDepositMethodDto** and **Create/UpdateWithdrawalMethodDto**
- Fields: `name` string, `type` string, optional `details` object, optional `isActive` boolean
- Create requires `name` + `type`; update makes everything optional

**UpdateDepositDto** / **UpdateWithdrawalDto**
- `status`: enum `'pending' | 'approved' | 'rejected'`, required
- `adminNotes`: string, optional

**UpdateUserDto**
- Optional numeric balances: `mainBalance`, `miningBalance`, `tradeBalance`, `realEstateBalance`, `referralBalance` (all >= 0)
- `signalStrength`: number between 0 and 100
- `kycStatus`: enum `'pending' | 'approved' | 'rejected'`
- `isAdmin`: boolean

**UpdateTradeDto**
- `status`: enum `'open' | 'closed' | 'canceled'`, optional
- `result`: enum `'win' | 'loss'`, optional

---

## Endpoint Catalogue

Each endpoint summary below references the DTO(s) from the previous section. Unless stated otherwise, responses follow the shared envelope and include the updated entity or a descriptive message.

### Authentication (`/auth`)

| Method & Path | Summary | Auth | Body |
| --- | --- | --- | --- |
| `POST /auth/register` | Create a new user | none | `RegisterDto` |
| `POST /auth/login` | Obtain JWT for user/admin | none | `LoginDto` |
| `POST /auth/reset-password/request` | Send reset email | none | `RequestPasswordResetDto` |
| `POST /auth/reset-password/confirm` | Finish password reset | none | `ConfirmPasswordResetDto` |
| `POST /auth/2fa/setup` | Generate secret + QR | Bearer | none |
| `POST /auth/2fa/verify` | Validate token during setup | Bearer | `Verify2FADto` |
| `POST /auth/2fa/enable` | Persist secret + token | Bearer | `Enable2FADto` |

Success responses return the service payload (token, qrCode, etc.). Common errors: `400` validation failure, `401` invalid credentials or token, `409` register conflict.

### User (`/user`)

All routes require a valid user JWT.

#### Profile & Security
- `GET /user/profile`  returns the authenticated user's document (`UserService.getProfile`).
- `PATCH /user/profile`  body `UpdateProfileDto`.
- `PATCH /user/security`  body `UpdateSecurityDto`; requires `currentPassword` when changing password.
- `DELETE /user/account`  permanently deletes the user.
- `POST /user/kyc`  multipart upload with file field `idDocument`; accepted mimetypes `jpg`, `jpeg`, `png`, `pdf`. File stored under `/uploads/kyc/`.
- `GET /user/balances`  optional `currency` query parameter for conversion.
- `PATCH /user/currency`  body `UpdateCurrencyDto`.

#### Product Actions
- `POST /user/subscribe`  body `SubscribeDto`.
- `POST /user/signal/purchase`  body `PurchaseSignalDto`.
- `POST /user/stake`  body `StakeDto`.
- `POST /user/trade`  body `TradeDto`.
- `POST /user/real-estate/invest`  body `RealEstateInvestDto`.
- `POST /user/deposit`  multipart form: `methodId`, `amount`, `currency`, plus `proof` file saved to `/uploads/deposits/`.
- `POST /user/withdrawal`  body `WithdrawalDto`.
- `POST /user/copy-trader/follow` & `POST /user/copy-trader/unfollow`  JSON `{ "traderId": "<CopyTrader _id>" }`.

#### Retrieval
- Activity feeds: `GET /user/trades`, `/user/deposits`, `/user/withdrawals`, `/user/stakings`, `/user/real-estate-investments`.
- Available catalogues: `GET /user/deposit-methods`, `/user/withdrawal-methods`, `/user/mining-pools`, `/user/real-estate`, `/user/subscription-plans`, `/user/signal-prices`, `/user/copy-traders`.

Each listing returns arrays of the underlying Mongo documents as queried in `UserService`.

### Admin (`/admin`)

Every admin route requires `JwtAuthGuard` + `RolesGuard` (`@Admin()` decorator). Request bodies map 1:1 with the DTOs listed earlier. File uploads use the same limits as the controllers.

#### Real Estate
- `POST /admin/real-estate`  `CreateRealEstateDto`.
- `PATCH /admin/real-estate/:id`  `UpdateRealEstateDto`.
- `GET /admin/real-estate`  list portfolios.

#### Mining Pools
- `POST /admin/mining-pool`  `CreateMiningPoolDto`.
- `PATCH /admin/mining-pool/:id`  `UpdateMiningPoolDto`.
- `GET /admin/mining-pools`.

#### Copy Traders
- `POST /admin/copy-trader`  multipart form containing the `CreateCopyTraderDto` fields plus optional `image` file (stored at `/uploads/copy-traders/`; controller injects the resulting `/uploads/...` path into `image`).
- `PATCH /admin/copy-trader/:id`  same form rules with `UpdateCopyTraderDto`.
- `GET /admin/copy-traders`  returns traders with populated followers.

#### Subscription Plans & Signal Prices
- `POST /admin/subscription-plan`, `PATCH /admin/subscription-plan/:id`, `GET /admin/subscription-plans`.
- `POST /admin/signal-price`, `PATCH /admin/signal-price/:id`, `GET /admin/signal-prices`.

#### Deposit / Withdrawal Methods
- Deposits: `POST /admin/deposit-method`, `PATCH /admin/deposit-method/:id`, `GET /admin/deposit-methods`.
- Withdrawals: `POST /admin/withdrawal-method`, `PATCH /admin/withdrawal-method/:id`, `GET /admin/withdrawal-methods`.

#### Deposits & Withdrawals
- `GET /admin/deposits`  lists all deposits (with `userId` populated).
- `PATCH /admin/deposit/:id`  body `UpdateDepositDto`; approving credits the user's main balance and sends email.
- `GET /admin/withdrawals`  lists all withdrawals.
- `POST /admin/withdrawal/:id/generate-code`  creates a code and emails it.
- `PATCH /admin/withdrawal/:id`  body `UpdateWithdrawalDto`; approving debits balances and emails the user.

#### Users & Trades
- `GET /admin/users`, `GET /admin/users/:id`.
- `PATCH /admin/users/:id`  body `UpdateUserDto`.
- `POST /admin/users/:id/kyc/approve` and `/reject`.
- `GET /admin/trades`.
- `PATCH /admin/trades/:id`  body `UpdateTradeDto`; setting `result` triggers balance adjustments in `AdminService`.

---

## File Upload Summary

| Endpoint | Field | Destination | Notes |
| --- | --- | --- | --- |
| `POST /user/kyc` | `idDocument` | `public/uploads/kyc` | Allowed: jpg, jpeg, png, pdf; max 5 MB |
| `POST /user/deposit` | `proof` | `public/uploads/deposits` | Same mime + size rules |
| `POST/PATCH /admin/copy-trader` | `image` | `public/uploads/copy-traders` | Only images (jpg, jpeg, png, webp); deleting a trader image removes the previous file |

---

## Error & Status Codes

- `400 Bad Request`: DTO validation failure, invalid state (e.g., insufficient balance, already processed deposit).
- `401 Unauthorized`: Missing/invalid JWT.
- `403 Forbidden`: Authenticated but missing admin role.
- `404 Not Found`: Resource `_id` does not exist.
- `409 Conflict`: Registration email already in use.
- `422 Unprocessable Entity`: Currently surfaced as `400` (no dedicated handler yet).

---

## Operational Notes

- All monetary values are plain numbers; there is no fixed-point helper. Keep serialization consistent client-side.
- Dates are ISO 8601 strings provided by Mongoose timestamps.
- Rich responses (lists, user profile, etc.) are returned directly from the service layer; inspect the service files for exact shape when integrating.
- Static assets under `public/uploads` must be served by the hosting environment (e.g., Express static middleware or reverse proxy rule).
