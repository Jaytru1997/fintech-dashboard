# Fintech Dashboard

Frontend for a fintech dashboard that communicates with a NestJS/Mongoose backend API. The frontend integrates all backend endpoints, features a modern UI with responsive design, and includes robust state management, smooth animations, error handling, and best practices for performance, accessibility, and maintainability.

## Features

- **Authentication**: Login, registration, password reset, and 2FA setup
- **User Dashboard**: 
  - Multi-currency balance management
  - Trading (CFD, Forex, Crypto)
  - Mining pool staking
  - Real estate investments
  - Copy trading
  - Deposits and withdrawals
  - Subscription plans
  - Signal strength management
  - Profile and security settings
  - KYC verification
  - Transaction history
- **Admin Dashboard**:
  - User management
  - Deposit/withdrawal approval
  - Trade management
  - Resource management (real estate, mining pools, copy traders, etc.)
- **Responsive Design**: Desktop and mobile views
- **Animations**: Smooth transitions with Framer Motion
- **State Management**: Zustand for global state
- **Form Validation**: React Hook Form with Zod
- **UI Components**: shadcn/ui components customized to match design

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **UI Library**: shadcn/ui
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod
- **File Uploads**: react-dropzone
- **Notifications**: react-toastify
- **Testing**: Jest + React Testing Library

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running at `http://localhost:10000` (configurable)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd fintech-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_JWT_STORAGE=localStorage
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal)

## Project Structure

```
fintech-dashboard/
├── app/                     # Next.js App Router
│   ├── auth/               # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── 2fa/
│   ├── dashboard/          # User dashboard pages
│   │   ├── balances/
│   │   ├── subscriptions/
│   │   ├── signal/
│   │   ├── mining/
│   │   ├── trading/
│   │   ├── real-estate/
│   │   ├── deposits/
│   │   ├── withdrawals/
│   │   ├── copy-trading/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── history/
│   ├── admin/              # Admin dashboard pages
│   │   ├── users/
│   │   ├── deposits/
│   │   ├── withdrawals/
│   │   └── trades/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css           # Global styles
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   └── layout/              # Layout components
├── lib/                     # Utilities and API client
│   ├── api/                 # Axios client and endpoints
│   ├── hooks/               # Custom hooks
│   └── types/               # TypeScript types
├── stores/                  # Zustand stores
├── public/                  # Static assets
├── tests/                   # Unit tests
└── README.md                # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Backend API Integration

The frontend communicates with a NestJS backend API. All endpoints are configured in `lib/api/endpoints.ts` and use the Axios client in `lib/api/client.ts`.

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/reset-password/request` - Request password reset
- `POST /auth/reset-password/confirm` - Confirm password reset
- `POST /auth/2fa/setup` - Setup 2FA
- `POST /auth/2fa/verify` - Verify 2FA token
- `POST /auth/2fa/enable` - Enable 2FA

### User Endpoints (Authenticated)
- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update profile
- `PATCH /user/security` - Update security settings
- `DELETE /user/account` - Delete account
- `POST /user/kyc` - Submit KYC document
- `GET /user/balances` - Get balances
- `PATCH /user/currency` - Update currency
- `POST /user/subscribe` - Subscribe to plan
- `POST /user/signal/purchase` - Purchase signal strength
- `POST /user/stake` - Stake in mining pool
- `POST /user/trade` - Execute trade
- `POST /user/real-estate/invest` - Invest in real estate
- `POST /user/deposit` - Create deposit request
- `POST /user/withdrawal` - Create withdrawal request
- `POST /user/copy-trader/follow` - Follow copy trader
- `POST /user/copy-trader/unfollow` - Unfollow copy trader
- `GET /user/trades` - Get user trades
- `GET /user/deposits` - Get user deposits
- `GET /user/withdrawals` - Get user withdrawals
- `GET /user/stakings` - Get user stakings
- `GET /user/real-estate-investments` - Get user investments
- `GET /user/deposit-methods` - Get available deposit methods
- `GET /user/withdrawal-methods` - Get available withdrawal methods
- `GET /user/mining-pools` - Get available mining pools
- `GET /user/real-estate` - Get available real estate
- `GET /user/subscription-plans` - Get available subscription plans
- `GET /user/signal-prices` - Get available signal prices
- `GET /user/copy-traders` - Get available copy traders

### Admin Endpoints (Authenticated, Admin Only)
- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get user by ID
- `PATCH /admin/users/:id` - Update user
- `POST /admin/users/:id/kyc/approve` - Approve KYC
- `POST /admin/users/:id/kyc/reject` - Reject KYC
- `GET /admin/deposits` - Get all deposits
- `PATCH /admin/deposit/:id` - Approve/reject deposit
- `GET /admin/withdrawals` - Get all withdrawals
- `POST /admin/withdrawal/:id/generate-code` - Generate withdrawal code
- `PATCH /admin/withdrawal/:id` - Approve/reject withdrawal
- `GET /admin/trades` - Get all trades
- `PATCH /admin/trades/:id` - Update trade status/result
- Resource management endpoints (real estate, mining pools, copy traders, etc.)

## State Management

The application uses Zustand for global state management:

- **Auth Store** (`stores/auth.ts`): Manages authentication state, user data, and admin status
- **User Store** (`stores/user.ts`): Manages user balances and related data

## Styling

The application uses Tailwind CSS with a custom color palette from `Dashboard Views/colors.json`:

- Primary: `#01B28B`
- Blue: `#0C6CF2`, `#3C54CC`, `#4763F0`, `#5F9FFF`
- Background: `#F8F6FF`, `#03050A`, `#050024`, `#08091A`
- Error: `#FF3344`
- Purple: `#6226D9`

## Responsive Design

The application is fully responsive:
- **Desktop**: Optimized for screens ≥ 1024px
- **Mobile**: Optimized for screens ≤ 768px
- Uses Tailwind's responsive utilities (`sm:`, `md:`, `lg:`) for fluid transitions

## Animations

Framer Motion is used for smooth animations:
- Page transitions (fade-in/out)
- Modal animations (scale and fade)
- Button hover effects
- Loading states

## Testing

Unit tests are located in the `tests/` directory. Run tests with:

```bash
npm run test
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Build the application:

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_JWT_STORAGE` | JWT storage method (`localStorage` or `cookie`) | `localStorage` |

## Troubleshooting

### API Connection Issues
- Ensure the backend API is running at the configured URL
- Check CORS settings on the backend
- Verify environment variables are set correctly

### Authentication Issues
- Clear browser localStorage/cookies
- Check JWT token expiration
- Verify backend authentication endpoints

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

This project is proprietary software.

## Support

For issues and questions, please contact the development team.
