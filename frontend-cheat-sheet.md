### Frontend Request Cheat Sheet

Every endpoint below includes method, path, auth requirements, payload structure (JSON schema style), field validation notes, and special behaviors (uploads, automatic side effects). Use this as the single reference when building forms, requests, and client validations.

---

#### Legend
- `string(email)` → must be a valid email
- `string(enum: A|B)` → allowed values listed
- `number>=X` → numeric with lower bound (inclusive)
- ✅ = required field; ⚪ = optional
- `multipart` sections list both text fields and file fields

---

## Authentication

| Method | Path | Auth | Body Schema | Notes |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | none | ```json { "firstName": "string", "lastName": "string", "email": "string(email)", "country": "string", "phoneNumber": "string", "password": "string(min6)", "passwordRepeat": "string(min6)", "currency": "string", "referralCode?": "string" }``` | `passwordRepeat` must match `password`. |
| POST | `/auth/login` | none | ```json { "email": "string(email)", "password": "string(min6)" }``` | Returns JWT + user info. |
| POST | `/auth/reset-password/request` | none | ```json { "email": "string(email)" }``` | Sends reset email. |
| POST | `/auth/reset-password/confirm` | none | ```json { "token": "string", "newPassword": "string(min6)" }``` | Use token from email. |
| POST | `/auth/2fa/setup` | Bearer | _no body_ | Returns QR + secret. |
| POST | `/auth/2fa/verify` | Bearer | ```json { "token": "string" }``` | 6-digit code during setup. |
| POST | `/auth/2fa/enable` | Bearer | ```json { "secret": "string", "token": "string" }``` | Saves secret after verification. |

---

## User Routes (JWT required)

### Profile & Security

| Method | Path | Body |
| --- | --- | --- |
| GET | `/user/profile` | _none_ |
| PATCH | `/user/profile` | ```json { "firstName?": "string", "lastName?": "string", "email?": "string(email)", "country?": "string", "phoneNumber?": "string" }``` |
| PATCH | `/user/security` | ```json { "currentPassword?": "string(min6)", "newPassword?": "string(min6)", "twoFactorToken?": "string" }``` (if changing password, prompt for current + new) |
| DELETE | `/user/account` | _none_ |
| POST | `/user/kyc` | multipart → text: none; file: `idDocument` (required, jpg/jpeg/png/pdf, ≤5 MB) |
| GET | `/user/balances?currency=USD` | optional query `currency` |
| PATCH | `/user/currency` | ```json { "currency": "string" }``` |

### Plans, Signals, Mining, Trades

| Method | Path | Body |
| --- | --- | --- |
| POST | `/user/subscribe` | ```json { "planId": "string(ObjectId)", "amount": "number>0" }``` (amount must be between the plan’s min/max; deducted from main balance and stored on the subscription record alongside ROI/duration data) |
| POST | `/user/signal/purchase` | ```json { "signalPriceId": "string(ObjectId)", "amount": "number>=0" }``` |
| POST | `/user/stake` | ```json { "poolId": "string(ObjectId)", "amount": "number>=0" }``` |
| POST | `/user/trade` | ```json { "tradeType": "string", "pair": "string", "amount": "number>=0", "leverage": "number(0-100)", "takeProfit?": "number", "stopLoss?": "number", "duration": "number(hours)", "direction": "string(enum: BUY|SELL)", "isSwap?": "boolean", "swapPair?": "string" }``` (if `isSwap=true`, UI should require `swapPair`) |
| POST | `/user/real-estate/invest` | ```json { "realEstateId": "string(ObjectId)", "amount": "number>=0", "duration": "number>=1 (months)" }``` |

### Subscriptions

| Method | Path | Body / Notes |
| --- | --- | --- |
| GET | `/user/subscription-plans` | _none_. Returns array of `{ _id, planId, plan, planName, amount, roi, durationDays, status, startDate, endDate, createdAt, updatedAt }`. |
| PATCH | `/user/subscription-plans/:subscriptionId/status` | ```json { "status": "string(enum: active|pending|completed|canceled|cancelled)" }``` (users should stick to cancel/pending/completed; reactivating to `active` is blocked server-side). |
| GET | `/user/subscription-plans/available` | _none_. Lists catalog plans (same as before). |

### Deposits & Withdrawals

| Method | Path | Body |
| --- | --- | --- |
| POST | `/user/deposit` | multipart → text: `methodId` (string), `amount` (string/number), `currency` (string); file: `proof` (required, jpg/jpeg/png/pdf, ≤5 MB). Backend parses `amount` to float. |
| POST | `/user/withdrawal` | ```json { "balanceType": "string(enum: main|mining|trade|realEstate|referral)", "methodId": "string(ObjectId)", "amount": "number>=0", "currency": "string", "details?": "object", "withdrawalCode?": "string" }``` |

### Copy-Trader Follow

| Method | Path | Body |
| --- | --- | --- |
| POST | `/user/copy-trader/follow` | ```json { "traderId": "string(ObjectId)" }``` |
| POST | `/user/copy-trader/unfollow` | same payload |

### Read-only collections (no body)

`GET /user/trades`, `/deposits`, `/withdrawals`, `/stakings`, `/real-estate-investments`, `/deposit-methods`, `/withdrawal-methods`, `/mining-pools`, `/real-estate`, `/subscription-plans`, `/signal-prices`, `/copy-traders`.

---

## Admin Routes (Admin JWT required)

### Real Estate

| Method | Path | Body |
| --- | --- | --- |
| POST | `/admin/real-estate` | ```json { "title": "string", "image": "string(url/path)", "minimumInvestment": "number>=0", "roi": "number>=0", "strategy": "string", "overview": "string", "documents?": ["string"], "type": "string", "kind": "string", "objective": "string", "whyThisProject": "string", "whyThisSponsor": "string" }``` |
| PATCH | `/admin/real-estate/:id` | same fields, all optional |

### Mining Pools

| Method | Path | Body |
| --- | --- | --- |
| POST | `/admin/mining-pool` | ```json { "name": "string", "roi": "number>=0", "cycle": "string(enum: daily|weekly|monthly)", "minStake": "number>=0", "durationDays": "number>=1" }``` |
| PATCH | `/admin/mining-pool/:id` | all fields optional |

### Copy Traders (with image upload)

| Method | Path | Body |
| --- | --- | --- |
| POST | `/admin/copy-trader` | multipart: text fields `name` (string), `description` (string), `performance` (number>=0) required; file `image` optional (jpg/jpeg/png/webp ≤5 MB). Uploaded path stored in `image`. |
| PATCH | `/admin/copy-trader/:id` | same form, all text fields optional; file optional (replaces prior image, backend deletes old file). |

### Subscription Plans & Signals

| Method | Path | Body |
| --- | --- | --- |
| POST | `/admin/subscription-plan` | ```json { "name": "string", "minAmount": "number>=0", "maxAmount": "number>=0", "roi": "number>=0", "durationDays": "number>=1" }``` |
| PATCH | `/admin/subscription-plan/:id` | optional fields (including `roi` and `durationDays`) |
| POST | `/admin/signal-price` | ```json { "amount": "number>=0", "signalValue": "number>=0" }``` |
| PATCH | `/admin/signal-price/:id` | optional fields |

### Deposit/Withdrawal Methods

| Method | Path | Body |
| --- | --- | --- |
| POST | `/admin/deposit-method` | ```json { "name": "string", "type": "string", "details?": "object", "isActive?": "boolean" }``` |
| PATCH | `/admin/deposit-method/:id` | optional |
| POST | `/admin/withdrawal-method` | same schema as deposit methods |
| PATCH | `/admin/withdrawal-method/:id` | optional |

### Deposits & Withdrawals (Admin actions)

| Method | Path | Body / Notes |
| --- | --- | --- |
| GET | `/admin/deposits` | _none_ |
| PATCH | `/admin/deposit/:id` | ```json { "status": "string(enum: pending|approved|rejected)", "adminNotes?": "string" }``` (approval credits user main balance + email). |
| GET | `/admin/withdrawals` | _none_ |
| POST | `/admin/withdrawal/:id/generate-code` | _none_ (returns code). |
| PATCH | `/admin/withdrawal/:id` | ```json { "status": "string(enum: pending|approved|rejected)", "adminNotes?": "string" }``` (approval debits user balances + email). |

### Users & Trades

| Method | Path | Body / Notes |
| --- | --- | --- |
| GET | `/admin/users` | _none_ |
| GET | `/admin/users/:id` | _none_ |
| PATCH | `/admin/users/:id` | ```json { "mainBalance?": "number>=0", "miningBalance?": "number>=0", "tradeBalance?": "number>=0", "realEstateBalance?": "number>=0", "referralBalance?": "number>=0", "signalStrength?": "number(0-100)", "kycStatus?": "string(enum: pending|approved|rejected)", "isAdmin?": "boolean" }``` |
| POST | `/admin/users/:id/kyc/approve` | _none_ |
| POST | `/admin/users/:id/kyc/reject` | _none_ |
| PATCH | `/admin/users/:userId/subscriptions/:subscriptionId` | ```json { "status": "string(enum: active|pending|completed|canceled|cancelled)" }``` |
| GET | `/admin/trades` | _none_ |
| POST | `/admin/trades/execute` | ```json { "userId": "string(ObjectId)", "tradeType": "string", "pair": "string", "amount": "number>=0", "leverage": "number(0-100)", "duration": "number(hours)", "direction": "string(enum: BUY|SELL)", "takeProfit?": "number", "stopLoss?": "number", "isSwap?": "boolean", "swapPair?": "string", "result": "string(enum: win|loss)" }``` (debids user's main balance, records trade, and immediately applies the given result with profit/loss settlement.) |
| PATCH | `/admin/trades/:id` | ```json { "status?": "string(enum: open|closed|canceled)", "result?": "string(enum: win|loss)" }``` (changing `result` runs the same settlement logic as execute). |

---

## File Upload Destinations
| Endpoint | Field | Stored Path | Notes |
| --- | --- | --- | --- |
| `/user/kyc` | `idDocument` | `/uploads/kyc` | JPG/JPEG/PNG/PDF ≤5 MB |
| `/user/deposit` | `proof` | `/uploads/deposits` | Same restrictions |
| `/admin/copy-trader` & `/admin/copy-trader/:id` | `image` | `/uploads/copy-traders` | JPG/JPEG/PNG/WEBP ≤5 MB; updating deletes previous file |

---

## Error Semantics (global)
- `400` – validation failure, insufficient state, already processed, etc.
- `401` – missing/invalid JWT.
- `403` – lacks admin role.
- `404` – resource not found.
- `409` – registration conflict.
- `422` – currently reported as `400`.
- Responses always wrapped as `{ data, message, status }` on success.

---

Use this cheat sheet to wire up front-end forms, type definitions, and request builders directly. Let me know if you need a JSON schema export or Postman collection generated from it.