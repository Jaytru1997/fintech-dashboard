# API Specification

## Base Information

- **Base URL**: `https://your-domain.com` (production) or `http://localhost:3000` (development)
- **API Version**: 1.0
- **Content-Type**: `application/json` (except for file uploads which use `multipart/form-data`)
- **Authentication**: Bearer Token (JWT) in Authorization header

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All successful responses follow this structure:
```json
{
  "data": { ... },
  "message": "Success",
  "status": "success"
}
```

Error responses follow this structure:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## Authentication Endpoints

### 1. Register User

**Endpoint**: `POST /auth/register`

**Description**: Register a new user account

**Headers**: None required

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "country": "United States",
  "phoneNumber": "+1234567890",
  "password": "password123",
  "passwordRepeat": "password123",
  "currency": "USD",
  "referralCode": "REF123456" // Optional
}
```

**Validation Rules**:
- `firstName`: Required, string
- `lastName`: Required, string
- `email`: Required, valid email format, unique
- `country`: Required, string
- `phoneNumber`: Required, string
- `password`: Required, string, minimum 6 characters
- `passwordRepeat`: Required, string, must match password
- `currency`: Required, string (e.g., "USD", "EUR", "GBP")
- `referralCode`: Optional, string

**Response** (201 Created):
```json
{
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "referralCode": "ABC123XYZ"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User successfully registered",
  "status": "success"
}
```

**Error Responses**:
- `400`: Bad request (validation errors)
- `409`: User already exists

---

### 2. Login

**Endpoint**: `POST /auth/login`

**Description**: Login user or admin

**Headers**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation Rules**:
- `email`: Required, valid email format
- `password`: Required, string, minimum 6 characters

**Response** (200 OK):
```json
{
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "role": "user",
      "isAdmin": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "status": "success"
}
```

**Error Responses**:
- `401`: Unauthorized (invalid credentials)

---

### 3. Request Password Reset

**Endpoint**: `POST /auth/reset-password/request`

**Description**: Request password reset link via email

**Headers**: None required

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Validation Rules**:
- `email`: Required, valid email format

**Response** (200 OK):
```json
{
  "data": null,
  "message": "Reset link sent to email",
  "status": "success"
}
```

---

### 4. Confirm Password Reset

**Endpoint**: `POST /auth/reset-password/confirm`

**Description**: Confirm password reset with token

**Headers**: None required

**Request Body**:
```json
{
  "token": "reset-token-123456789",
  "newPassword": "newpassword123"
}
```

**Validation Rules**:
- `token`: Required, string (received via email)
- `newPassword`: Required, string, minimum 6 characters

**Response** (200 OK):
```json
{
  "data": null,
  "message": "Password reset successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: Invalid or expired token

---

### 5. Setup 2FA

**Endpoint**: `POST /auth/2fa/setup`

**Description**: Initialize 2FA setup and get QR code

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "message": "2FA setup initiated",
  "status": "success"
}
```

---

### 6. Verify 2FA Token

**Endpoint**: `POST /auth/2fa/verify`

**Description**: Verify 2FA token during setup

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "token": "123456"
}
```

**Validation Rules**:
- `token`: Required, string (6-digit code from authenticator app)

**Response** (200 OK):
```json
{
  "data": {
    "verified": true
  },
  "message": "2FA verified",
  "status": "success"
}
```

---

### 7. Enable 2FA

**Endpoint**: `POST /auth/2fa/enable`

**Description**: Enable 2FA with secret and verification token

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456"
}
```

**Validation Rules**:
- `secret`: Required, string (from setup endpoint)
- `token`: Required, string (6-digit verification code)

**Response** (200 OK):
```json
{
  "data": null,
  "message": "2FA enabled",
  "status": "success"
}
```

**Error Responses**:
- `400`: Invalid secret or token

---

## User Endpoints

All user endpoints require authentication via JWT token.

### 8. Get User Profile

**Endpoint**: `GET /user/profile`

**Description**: Get authenticated user's profile information

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "country": "United States",
    "phoneNumber": "+1234567890",
    "currency": "USD",
    "referralCode": "ABC123XYZ",
    "signalStrength": 50,
    "kycStatus": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Success",
  "status": "success"
}
```

---

### 9. Update Profile

**Endpoint**: `PATCH /user/profile`

**Description**: Update user profile information

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "firstName": "John", // Optional
  "lastName": "Doe", // Optional
  "email": "newemail@example.com", // Optional
  "country": "United States", // Optional
  "phoneNumber": "+1234567890" // Optional
}
```

**Validation Rules**:
- All fields are optional
- `email`: If provided, must be valid email format
- All fields must be strings

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "newemail@example.com",
    "country": "United States",
    "phoneNumber": "+1234567890",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile updated successfully",
  "status": "success"
}
```

---

### 10. Update Security Settings

**Endpoint**: `PATCH /user/security`

**Description**: Update password or security settings

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "currentPassword": "oldpassword123", // Required if updating password
  "newPassword": "newpassword123", // Optional
  "newPasswordRepeat": "newpassword123" // Optional, must match newPassword
}
```

**Validation Rules**:
- `currentPassword`: Required if updating password
- `newPassword`: Optional, string, minimum 6 characters
- `newPasswordRepeat`: Optional, must match newPassword

**Response** (200 OK):
```json
{
  "data": null,
  "message": "Security settings updated successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: Bad request (invalid current password, passwords don't match)

---

### 11. Delete Account

**Endpoint**: `DELETE /user/account`

**Description**: Delete user account

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": null,
  "message": "Account deleted successfully",
  "status": "success"
}
```

---

### 12. Submit KYC Document

**Endpoint**: `POST /user/kyc`

**Description**: Submit KYC (Know Your Customer) identification document

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (Form Data):
- `idDocument`: File (required)
  - Allowed types: jpg, jpeg, png, pdf
  - Max size: 5MB

**Response** (201 Created):
```json
{
  "data": {
    "kycDocument": "/uploads/kyc/kyc-1234567890-987654321.jpg",
    "kycStatus": "pending"
  },
  "message": "KYC document submitted successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: File required or invalid format

---

### 13. Get User Balances

**Endpoint**: `GET /user/balances?currency=USD`

**Description**: Get user balances in all balance types

**Headers**: 
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `currency`: Optional, string (e.g., "USD", "EUR", "GBP") - converts balances to specified currency

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": {
    "main": {
      "amount": 10000,
      "currency": "USD"
    },
    "mining": {
      "amount": 5000,
      "currency": "USD"
    },
    "trade": {
      "amount": 3000,
      "currency": "USD"
    },
    "realEstate": {
      "amount": 2000,
      "currency": "USD"
    },
    "referral": {
      "amount": 1000,
      "currency": "USD"
    }
  },
  "message": "Success",
  "status": "success"
}
```

---

### 14. Update Currency Preference

**Endpoint**: `PATCH /user/currency`

**Description**: Update user's preferred currency

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "currency": "EUR"
}
```

**Validation Rules**:
- `currency`: Required, string (valid currency code)

**Response** (200 OK):
```json
{
  "data": {
    "currency": "EUR"
  },
  "message": "Currency updated successfully",
  "status": "success"
}
```

---

### 15. Subscribe to Plan

**Endpoint**: `POST /user/subscribe`

**Description**: Subscribe to a subscription plan

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "planId": "507f1f77bcf86cd799439011"
}
```

**Validation Rules**:
- `planId`: Required, valid MongoDB ObjectId

**Response** (201 Created):
```json
{
  "data": {
    "subscription": {
      "_id": "507f1f77bcf86cd799439012",
      "planId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011",
      "expiresAt": "2024-02-01T00:00:00.000Z",
      "status": "active"
    }
  },
  "message": "Subscription created successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: Insufficient balance or invalid plan

---

### 16. Purchase Signal Strength

**Endpoint**: `POST /user/signal/purchase`

**Description**: Purchase signal strength to boost trading signals

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "signalPriceId": "507f1f77bcf86cd799439011",
  "amount": 100
}
```

**Validation Rules**:
- `signalPriceId`: Required, valid MongoDB ObjectId
- `amount`: Required, number, minimum 0

**Response** (201 Created):
```json
{
  "data": {
    "signalStrength": 75,
    "newBalance": 900
  },
  "message": "Signal purchased successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: Insufficient balance

---

### 17. Stake in Mining Pool

**Endpoint**: `POST /user/stake`

**Description**: Stake funds in a mining pool

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "poolId": "507f1f77bcf86cd799439011",
  "amount": 1000
}
```

**Validation Rules**:
- `poolId`: Required, valid MongoDB ObjectId
- `amount`: Required, number, minimum 0, must meet pool's minimum stake requirement

**Response** (201 Created):
```json
{
  "data": {
    "staking": {
      "_id": "507f1f77bcf86cd799439012",
      "poolId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011",
      "amount": 1000,
      "roi": 5,
      "cycle": "daily",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T00:00:00.000Z"
    }
  },
  "message": "Staking created successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: Insufficient balance or below minimum stake

---

### 18. Execute Trade

**Endpoint**: `POST /user/trade`

**Description**: Execute a trade

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "tradeType": "Forex",
  "pair": "EUR/USD",
  "amount": 1000,
  "leverage": 10,
  "takeProfit": 5, // Optional
  "stopLoss": 3, // Optional
  "duration": 24,
  "direction": "BUY",
  "isSwap": false, // Optional
  "swapPair": "BTC/ETH" // Optional, required if isSwap is true
}
```

**Validation Rules**:
- `tradeType`: Required, string
- `pair`: Required, string
- `amount`: Required, number, minimum 0
- `leverage`: Required, number, 0-100
- `takeProfit`: Optional, number
- `stopLoss`: Optional, number
- `duration`: Required, number (hours)
- `direction`: Required, enum: "BUY" or "SELL"
- `isSwap`: Optional, boolean
- `swapPair`: Optional, string (required if isSwap is true)

**Response** (201 Created):
```json
{
  "data": {
    "trade": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "tradeType": "Forex",
      "pair": "EUR/USD",
      "amount": 1000,
      "leverage": 10,
      "takeProfit": 5,
      "stopLoss": 3,
      "duration": 24,
      "direction": "BUY",
      "status": "open",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Trade executed successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: Insufficient balance

---

### 19. Invest in Real Estate

**Endpoint**: `POST /user/real-estate/invest`

**Description**: Invest in a real estate portfolio

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "realEstateId": "507f1f77bcf86cd799439011",
  "amount": 5000
}
```

**Validation Rules**:
- `realEstateId`: Required, valid MongoDB ObjectId
- `amount`: Required, number, minimum 0, must meet portfolio's minimum investment

**Response** (201 Created):
```json
{
  "data": {
    "investment": {
      "_id": "507f1f77bcf86cd799439012",
      "realEstateId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011",
      "amount": 5000,
      "roi": 12,
      "startDate": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Investment created successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: Insufficient balance or below minimum investment

---

### 20. Create Deposit Request

**Endpoint**: `POST /user/deposit`

**Description**: Create a deposit request with proof document

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (Form Data):
- `methodId`: String (required) - Deposit method ID
- `amount`: Number (required) - Deposit amount
- `currency`: String (required) - Currency code
- `proof`: File (required)
  - Allowed types: jpg, jpeg, png, pdf
  - Max size: 5MB

**Response** (201 Created):
```json
{
  "data": {
    "deposit": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "methodId": "507f1f77bcf86cd799439011",
      "amount": 1000,
      "currency": "USD",
      "proof": "/uploads/deposits/deposit-1234567890-987654321.jpg",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Deposit request created successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: File required or invalid format

---

### 21. Create Withdrawal Request

**Endpoint**: `POST /user/withdrawal`

**Description**: Create a withdrawal request

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "balanceType": "main",
  "methodId": "507f1f77bcf86cd799439011",
  "amount": 500,
  "currency": "USD",
  "details": { // Optional
    "accountNumber": "123456789",
    "bankName": "Bank Name"
  },
  "withdrawalCode": "WDR123456" // Optional, if required
}
```

**Validation Rules**:
- `balanceType`: Required, enum: "main", "mining", "trade", "realEstate", "referral"
- `methodId`: Required, valid MongoDB ObjectId
- `amount`: Required, number, minimum 0
- `currency`: Required, string
- `details`: Optional, object
- `withdrawalCode`: Optional, string

**Response** (201 Created):
```json
{
  "data": {
    "withdrawal": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "balanceType": "main",
      "methodId": "507f1f77bcf86cd799439011",
      "amount": 500,
      "currency": "USD",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Withdrawal request created successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: Insufficient balance

---

### 22. Follow Copy Trader

**Endpoint**: `POST /user/copy-trader/follow`

**Description**: Follow a copy trader to automatically copy their trades

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "traderId": "507f1f77bcf86cd799439011"
}
```

**Validation Rules**:
- `traderId`: Required, valid MongoDB ObjectId

**Response** (200 OK):
```json
{
  "data": {
    "followed": true,
    "traderId": "507f1f77bcf86cd799439011"
  },
  "message": "Copy trader followed successfully",
  "status": "success"
}
```

---

### 23. Unfollow Copy Trader

**Endpoint**: `POST /user/copy-trader/unfollow`

**Description**: Unfollow a copy trader

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "traderId": "507f1f77bcf86cd799439011"
}
```

**Validation Rules**:
- `traderId`: Required, valid MongoDB ObjectId

**Response** (200 OK):
```json
{
  "data": {
    "followed": false,
    "traderId": "507f1f77bcf86cd799439011"
  },
  "message": "Copy trader unfollowed successfully",
  "status": "success"
}
```

---

### 24. Get User Trades

**Endpoint**: `GET /user/trades`

**Description**: Get all trades for the authenticated user

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "tradeType": "Forex",
      "pair": "EUR/USD",
      "amount": 1000,
      "leverage": 10,
      "direction": "BUY",
      "status": "open",
      "result": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 25. Get User Deposits

**Endpoint**: `GET /user/deposits`

**Description**: Get all deposit requests for the authenticated user

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "amount": 1000,
      "currency": "USD",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 26. Get User Withdrawals

**Endpoint**: `GET /user/withdrawals`

**Description**: Get all withdrawal requests for the authenticated user

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "balanceType": "main",
      "amount": 500,
      "currency": "USD",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 27. Get User Stakings

**Endpoint**: `GET /user/stakings`

**Description**: Get all staking records for the authenticated user

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "poolId": "507f1f77bcf86cd799439011",
      "amount": 1000,
      "roi": 5,
      "cycle": "daily",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 28. Get User Real Estate Investments

**Endpoint**: `GET /user/real-estate-investments`

**Description**: Get all real estate investments for the authenticated user

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "realEstateId": "507f1f77bcf86cd799439011",
      "amount": 5000,
      "roi": 12,
      "startDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 29. Get Available Deposit Methods

**Endpoint**: `GET /user/deposit-methods`

**Description**: Get all available deposit methods

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bank Transfer",
      "description": "Direct bank transfer",
      "isActive": true
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 30. Get Available Withdrawal Methods

**Endpoint**: `GET /user/withdrawal-methods`

**Description**: Get all available withdrawal methods

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bank Transfer",
      "description": "Direct bank transfer",
      "isActive": true
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 31. Get Available Mining Pools

**Endpoint**: `GET /user/mining-pools`

**Description**: Get all available mining pools

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bitcoin Mining Pool",
      "roi": 5,
      "cycle": "daily",
      "minStake": 100,
      "durationDays": 30
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 32. Get Available Real Estate Portfolios

**Endpoint**: `GET /user/real-estate`

**Description**: Get all available real estate portfolios

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Luxury Apartment Complex",
      "image": "https://example.com/image.jpg",
      "minimumInvestment": 5000,
      "roi": 12,
      "strategy": "Long-term rental income",
      "type": "Residential",
      "kind": "Apartment"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 33. Get Available Subscription Plans

**Endpoint**: `GET /user/subscription-plans`

**Description**: Get all available subscription plans

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Plan",
      "price": 99.99,
      "duration": 30,
      "features": ["Feature 1", "Feature 2"]
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 34. Get Available Signal Prices

**Endpoint**: `GET /user/signal-prices`

**Description**: Get all available signal price portfolios

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Signal Boost",
      "price": 10,
      "strengthIncrease": 5
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 35. Get Available Copy Traders

**Endpoint**: `GET /user/copy-traders`

**Description**: Get all available copy traders

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Professional Trader",
      "description": "Experienced forex trader",
      "winRate": 75.5,
      "totalTrades": 1000
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

## Admin Endpoints

All admin endpoints require authentication via JWT token and admin role.

### 36. Create Real Estate Portfolio

**Endpoint**: `POST /admin/real-estate`

**Description**: Create a new real estate portfolio

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Luxury Apartment Complex",
  "image": "https://example.com/image.jpg",
  "minimumInvestment": 5000,
  "roi": 12,
  "strategy": "Long-term rental income",
  "overview": "A luxury apartment complex in prime location",
  "documents": ["https://example.com/doc1.pdf"], // Optional
  "type": "Residential",
  "kind": "Apartment",
  "objective": "Income generation",
  "whyThisProject": "Prime location with high rental demand",
  "whyThisSponsor": "Experienced developer with proven track record"
}
```

**Validation Rules**:
- `title`: Required, string
- `image`: Required, string (URL or path)
- `minimumInvestment`: Required, number, minimum 0
- `roi`: Required, number, minimum 0
- `strategy`: Required, string
- `overview`: Required, string
- `documents`: Optional, array of strings
- `type`: Required, string
- `kind`: Required, string
- `objective`: Required, string
- `whyThisProject`: Required, string
- `whyThisSponsor`: Required, string

**Response** (201 Created):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Luxury Apartment Complex",
    "image": "https://example.com/image.jpg",
    "minimumInvestment": 5000,
    "roi": 12,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Real estate portfolio created successfully",
  "status": "success"
}
```

---

### 37. Update Real Estate Portfolio

**Endpoint**: `PATCH /admin/real-estate/:id`

**Description**: Update an existing real estate portfolio

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Real estate portfolio ID

**Request Body**: (All fields optional)
```json
{
  "title": "Updated Title",
  "image": "https://example.com/new-image.jpg",
  "minimumInvestment": 6000,
  "roi": 15,
  "strategy": "Updated strategy",
  "overview": "Updated overview",
  "documents": ["https://example.com/doc2.pdf"],
  "type": "Commercial",
  "kind": "Office",
  "objective": "Capital appreciation",
  "whyThisProject": "Updated reason",
  "whyThisSponsor": "Updated sponsor info"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Real estate portfolio updated successfully",
  "status": "success"
}
```

**Error Responses**:
- `404`: Real estate portfolio not found

---

### 38. Get All Real Estate Portfolios

**Endpoint**: `GET /admin/real-estate`

**Description**: Get all real estate portfolios (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Luxury Apartment Complex",
      "image": "https://example.com/image.jpg",
      "minimumInvestment": 5000,
      "roi": 12,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 39. Create Mining Pool

**Endpoint**: `POST /admin/mining-pool`

**Description**: Create a new mining pool

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Bitcoin Mining Pool",
  "roi": 5,
  "cycle": "daily",
  "minStake": 100,
  "durationDays": 30
}
```

**Validation Rules**:
- `name`: Required, string
- `roi`: Required, number, minimum 0
- `cycle`: Required, enum: "daily", "weekly", "monthly"
- `minStake`: Required, number, minimum 0
- `durationDays`: Required, number, minimum 1

**Response** (201 Created):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Bitcoin Mining Pool",
    "roi": 5,
    "cycle": "daily",
    "minStake": 100,
    "durationDays": 30,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Mining pool created successfully",
  "status": "success"
}
```

---

### 40. Update Mining Pool

**Endpoint**: `PATCH /admin/mining-pool/:id`

**Description**: Update an existing mining pool

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Mining pool ID

**Request Body**: (All fields optional)
```json
{
  "name": "Updated Mining Pool",
  "roi": 6,
  "cycle": "weekly",
  "minStake": 200,
  "durationDays": 60
}
```

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Mining Pool",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Mining pool updated successfully",
  "status": "success"
}
```

---

### 41. Get All Mining Pools

**Endpoint**: `GET /admin/mining-pools`

**Description**: Get all mining pools (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bitcoin Mining Pool",
      "roi": 5,
      "cycle": "daily",
      "minStake": 100,
      "durationDays": 30
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 42. Create Copy Trader

**Endpoint**: `POST /admin/copy-trader`

**Description**: Create a new copy trader profile

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Professional Trader",
  "description": "Experienced forex trader with 10+ years",
  "winRate": 75.5,
  "totalTrades": 1000,
  "image": "https://example.com/trader.jpg"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Professional Trader",
    "description": "Experienced forex trader with 10+ years",
    "winRate": 75.5,
    "totalTrades": 1000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Copy trader created successfully",
  "status": "success"
}
```

---

### 43. Update Copy Trader

**Endpoint**: `PATCH /admin/copy-trader/:id`

**Description**: Update an existing copy trader profile

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Copy trader ID

**Request Body**: (All fields optional)
```json
{
  "name": "Updated Trader Name",
  "description": "Updated description",
  "winRate": 80.0,
  "totalTrades": 1200
}
```

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Trader Name",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Copy trader updated successfully",
  "status": "success"
}
```

---

### 44. Get All Copy Traders

**Endpoint**: `GET /admin/copy-traders`

**Description**: Get all copy traders (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Professional Trader",
      "description": "Experienced forex trader",
      "winRate": 75.5,
      "totalTrades": 1000
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 45. Create Subscription Plan

**Endpoint**: `POST /admin/subscription-plan`

**Description**: Create a new subscription plan

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Premium Plan",
  "price": 99.99,
  "duration": 30,
  "features": ["Feature 1", "Feature 2", "Feature 3"]
}
```

**Response** (201 Created):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Plan",
    "price": 99.99,
    "duration": 30,
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Subscription plan created successfully",
  "status": "success"
}
```

---

### 46. Update Subscription Plan

**Endpoint**: `PATCH /admin/subscription-plan/:id`

**Description**: Update an existing subscription plan

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Subscription plan ID

**Request Body**: (All fields optional)
```json
{
  "name": "Updated Plan",
  "price": 149.99,
  "duration": 60,
  "features": ["Updated Feature 1", "Updated Feature 2"]
}
```

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Plan",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Subscription plan updated successfully",
  "status": "success"
}
```

---

### 47. Get All Subscription Plans

**Endpoint**: `GET /admin/subscription-plans`

**Description**: Get all subscription plans (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Plan",
      "price": 99.99,
      "duration": 30,
      "features": ["Feature 1", "Feature 2"]
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 48. Create Signal Price

**Endpoint**: `POST /admin/signal-price`

**Description**: Create a new signal price portfolio

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Signal Boost",
  "price": 10,
  "strengthIncrease": 5
}
```

**Response** (201 Created):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Signal Boost",
    "price": 10,
    "strengthIncrease": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Signal price created successfully",
  "status": "success"
}
```

---

### 49. Update Signal Price

**Endpoint**: `PATCH /admin/signal-price/:id`

**Description**: Update an existing signal price portfolio

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Signal price ID

**Request Body**: (All fields optional)
```json
{
  "name": "Updated Signal Boost",
  "price": 15,
  "strengthIncrease": 10
}
```

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Signal Boost",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Signal price updated successfully",
  "status": "success"
}
```

---

### 50. Get All Signal Prices

**Endpoint**: `GET /admin/signal-prices`

**Description**: Get all signal prices (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Signal Boost",
      "price": 10,
      "strengthIncrease": 5
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 51. Create Deposit Method

**Endpoint**: `POST /admin/deposit-method`

**Description**: Create a new deposit method

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Bank Transfer",
  "description": "Direct bank transfer",
  "isActive": true
}
```

**Response** (201 Created):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Bank Transfer",
    "description": "Direct bank transfer",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Deposit method created successfully",
  "status": "success"
}
```

---

### 52. Update Deposit Method

**Endpoint**: `PATCH /admin/deposit-method/:id`

**Description**: Update an existing deposit method

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Deposit method ID

**Request Body**: (All fields optional)
```json
{
  "name": "Updated Bank Transfer",
  "description": "Updated description",
  "isActive": false
}
```

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Bank Transfer",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Deposit method updated successfully",
  "status": "success"
}
```

---

### 53. Get All Deposit Methods

**Endpoint**: `GET /admin/deposit-methods`

**Description**: Get all deposit methods (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bank Transfer",
      "description": "Direct bank transfer",
      "isActive": true
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 54. Create Withdrawal Method

**Endpoint**: `POST /admin/withdrawal-method`

**Description**: Create a new withdrawal method

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Bank Transfer",
  "description": "Direct bank transfer",
  "isActive": true,
  "requiresCode": false
}
```

**Response** (201 Created):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Bank Transfer",
    "description": "Direct bank transfer",
    "isActive": true,
    "requiresCode": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Withdrawal method created successfully",
  "status": "success"
}
```

---

### 55. Update Withdrawal Method

**Endpoint**: `PATCH /admin/withdrawal-method/:id`

**Description**: Update an existing withdrawal method

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Withdrawal method ID

**Request Body**: (All fields optional)
```json
{
  "name": "Updated Bank Transfer",
  "description": "Updated description",
  "isActive": false,
  "requiresCode": true
}
```

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Bank Transfer",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Withdrawal method updated successfully",
  "status": "success"
}
```

---

### 56. Get All Withdrawal Methods

**Endpoint**: `GET /admin/withdrawal-methods`

**Description**: Get all withdrawal methods (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bank Transfer",
      "description": "Direct bank transfer",
      "isActive": true,
      "requiresCode": false
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 57. Get All Deposits

**Endpoint**: `GET /admin/deposits`

**Description**: Get all deposit requests (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "methodId": "507f1f77bcf86cd799439011",
      "amount": 1000,
      "currency": "USD",
      "proof": "/uploads/deposits/deposit-1234567890.jpg",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 58. Update Deposit Status

**Endpoint**: `PATCH /admin/deposit/:id`

**Description**: Approve or reject a deposit request

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Deposit ID

**Request Body**:
```json
{
  "status": "approved", // or "rejected"
  "notes": "Deposit verified" // Optional
}
```

**Validation Rules**:
- `status`: Required, enum: "approved", "rejected"
- `notes`: Optional, string

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "approved",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Deposit updated successfully",
  "status": "success"
}
```

---

### 59. Get All Withdrawals

**Endpoint**: `GET /admin/withdrawals`

**Description**: Get all withdrawal requests (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "balanceType": "main",
      "methodId": "507f1f77bcf86cd799439011",
      "amount": 500,
      "currency": "USD",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 60. Generate Withdrawal Code

**Endpoint**: `POST /admin/withdrawal/:id/generate-code`

**Description**: Generate and email withdrawal code to user

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: Withdrawal ID

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": {
    "withdrawalCode": "WDR123456",
    "sent": true
  },
  "message": "Withdrawal code generated and sent",
  "status": "success"
}
```

---

### 61. Update Withdrawal Status

**Endpoint**: `PATCH /admin/withdrawal/:id`

**Description**: Approve or reject a withdrawal request

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Withdrawal ID

**Request Body**:
```json
{
  "status": "approved", // or "rejected"
  "notes": "Withdrawal processed" // Optional
}
```

**Validation Rules**:
- `status`: Required, enum: "approved", "rejected"
- `notes`: Optional, string

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "approved",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Withdrawal updated successfully",
  "status": "success"
}
```

---

### 62. Get All Users

**Endpoint**: `GET /admin/users`

**Description**: Get all users (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "role": "user",
      "isAdmin": false,
      "kycStatus": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 63. Get User by ID

**Endpoint**: `GET /admin/users/:id`

**Description**: Get detailed user information by ID

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: User ID

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "country": "United States",
    "phoneNumber": "+1234567890",
    "currency": "USD",
    "balances": {
      "main": { "amount": 10000, "currency": "USD" },
      "mining": { "amount": 5000, "currency": "USD" },
      "trade": { "amount": 3000, "currency": "USD" },
      "realEstate": { "amount": 2000, "currency": "USD" },
      "referral": { "amount": 1000, "currency": "USD" }
    },
    "kycStatus": "pending",
    "isAdmin": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Success",
  "status": "success"
}
```

---

### 64. Update User

**Endpoint**: `PATCH /admin/users/:id`

**Description**: Update user details (including balances and admin status)

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: User ID

**Request Body**: (All fields optional)
```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "email": "updated@example.com",
  "country": "Canada",
  "phoneNumber": "+9876543210",
  "currency": "EUR",
  "balances": {
    "main": { "amount": 15000, "currency": "USD" },
    "mining": { "amount": 6000, "currency": "USD" }
  },
  "isAdmin": false
}
```

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Updated Name",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "User updated successfully",
  "status": "success"
}
```

**Error Responses**:
- `404`: User not found

---

### 65. Approve KYC

**Endpoint**: `POST /admin/users/:id/kyc/approve`

**Description**: Approve user's KYC submission

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: User ID

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "kycStatus": "approved"
  },
  "message": "KYC approved successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: User has not submitted KYC
- `404`: User not found

---

### 66. Reject KYC

**Endpoint**: `POST /admin/users/:id/kyc/reject`

**Description**: Reject user's KYC submission

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Path Parameters**:
- `id`: User ID

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "kycStatus": "rejected"
  },
  "message": "KYC rejected successfully",
  "status": "success"
}
```

**Error Responses**:
- `400`: User has not submitted KYC
- `404`: User not found

---

### 67. Get All Trades

**Endpoint**: `GET /admin/trades`

**Description**: Get all trades (admin view)

**Headers**: 
```
Authorization: Bearer <admin_token>
```

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "tradeType": "Forex",
      "pair": "EUR/USD",
      "amount": 1000,
      "leverage": 10,
      "direction": "BUY",
      "status": "open",
      "result": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success",
  "status": "success"
}
```

---

### 68. Update Trade

**Endpoint**: `PATCH /admin/trades/:id`

**Description**: Update trade status and result (admin only)

**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: Trade ID

**Request Body**:
```json
{
  "status": "closed", // Optional
  "result": "win" // Optional, enum: "win", "loss", "draw"
}
```

**Validation Rules**:
- `status`: Optional, string
- `result`: Optional, enum: "win", "loss", "draw"

**Response** (200 OK):
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "closed",
    "result": "win",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Trade updated successfully",
  "status": "success"
}
```

**Error Responses**:
- `404`: Trade not found

---

## Error Codes

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions (admin only endpoints)
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

### Common Error Response Format

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

## Notes

1. **Authentication**: All user and admin endpoints require a valid JWT token in the Authorization header
2. **File Uploads**: KYC and deposit endpoints accept file uploads via `multipart/form-data`
3. **File Size Limit**: Maximum file size is 5MB (configurable via `MAX_FILE_SIZE` environment variable)
4. **Allowed File Types**: jpg, jpeg, png, pdf
5. **Currency Conversion**: Balance endpoints support optional currency conversion via query parameter
6. **Pagination**: List endpoints may support pagination in future versions
7. **Rate Limiting**: API endpoints are protected by rate limiting (configurable)
8. **CORS**: CORS is enabled for specified origins in production

---

## Changelog

### Version 1.0
- Initial API specification
- All authentication endpoints
- All user endpoints
- All admin endpoints

