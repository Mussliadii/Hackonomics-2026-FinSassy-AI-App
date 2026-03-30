# FinSassy AI 🔥💰

> **Smart Money, Sassy Insights** — An AI-powered financial literacy platform that turns your real spending data into personalized education, witty roasts, and actionable insights.

*Built for Hackonomics 2026 — Economics & Financial Literacy Track*

---

## 📌 The Problem

78% of Americans live paycheck to paycheck. Among Gen Z, only 28% can correctly answer basic financial literacy questions. Traditional financial education is boring, intimidating, and disconnected from how young people actually live.

We have budgeting apps that track numbers, and we have financial courses that lecture. But nobody is *talking* to young people about money in a way that actually sticks — with humor, personality, and real-time insight from their own spending.

**FinSassy AI** bridges this gap by combining AI-driven spending analysis with gamified education and persona-driven engagement — making financial literacy fun, shareable, and personalized.

---

## 🌟 Features

### 🔥 Roast Me — AI Spending Commentary
The signature feature. An AI companion analyzes your real spending data and delivers personalized, humorous commentary to build financial awareness.

- **3 Tone Levels**: Mild 😊 (gentle nudge) → Spicy 🌶️ (sharp wit) → Extra 🔥🔥🔥 (savage roast)
- **3 Time Periods**: Last 7 / 30 / 90 days
- **Micro Tips**: Every roast ends with one concrete, actionable savings hack
- **Social Sharing**: Share to WhatsApp, Twitter, or copy to clipboard
- **Roast History**: Browse and revisit past roasts

### 🤖 Dual AI Personas
Every AI interaction is shaped by the user's chosen personality:

| Persona | Style | Behavior |
|---------|-------|----------|
| **Rizky 🔥** | Sharp Analyst | Direct, data-driven, no sugarcoating. Uses numbers aggressively. Think Gordon Ramsay meets financial advisor. |
| **Dinda 💜** | Supportive Motivator | Warm, encouraging, celebrates small wins. Uses gentle humor. Think best friend who's also a financial planner. |

Same spending data, same tone, completely different voice — meeting users where they are emotionally.

### 📊 Smart Dashboard
- **Financial Health Score** (0-100) with animated progress ring and mood indicator
- **Budget Used** — Color-coded progress bar (🟢 ≤75% / 🟡 75-100% / 🔴 >100%)
- **Savings Progress** — Progress toward monthly savings target
- **Learning Streak** — 7-day calendar visualization of learning activity
- **Monthly Overview** — Total income vs expenses side-by-side
- **Daily Digest** — AI-generated daily spending reflection

### 💸 Transaction Management
Three input methods to capture every expense:

1. **Manual Entry** — Quick inline form (description, amount, type, date)
2. **CSV Upload** — Bulk import up to 5MB (sample CSVs included for both USD and IDR)
3. **Receipt Photo** — Camera capture with auto-detection of merchant name and amount

Additional features:
- Category-based filtering (food, transport, utilities, entertainment, etc.)
- Type filtering (income / expense)
- Date range filtering
- Auto-categorization with manual override

### 🎓 Learn & Level Up
Three-tab educational hub:

- **Quiz Tab** — AI-generated 3-question quizzes based on spending categories. Multiple choice with detailed explanations per answer. Score tracking and badge rewards.
- **Articles Tab** — 6 curated financial literacy articles (50/30/20 rule, compound interest, emergency funds, inflation, debt management, side hustles). Full multilingual support.
- **Badges & Streaks** — Gamified progression with badge collection and daily streak tracking.

### 📈 Forecast
- **5-Week Cash Flow Projection** — Animated bar chart showing predicted weekly income vs expenses with net calculation
- **Upcoming Bills Prediction** — ML-predicted recurring bills with merchant name, predicted date, amount, and confidence score

### ⚙️ Settings & Personalization
- Language switching (English 🇺🇸 / Indonesian 🇮🇩 / Chinese 🇨🇳) — entire UI adapts
- Currency switching (USD / IDR / CNY) — all monetary displays update
- AI personality toggle (Rizky 🔥 ↔ Dinda 💜)
- Monthly savings target
- Default roast tone preference
- Morning notification toggle
- Account data deletion (with confirmation)

### 🔐 Authentication & Onboarding
Secure 5-step signup flow:

1. **Language & Currency** — Select preferred language and currency
2. **Account Details** — Name, email, password with real-time 5-point validation checklist (8+ chars, uppercase, lowercase, number, special character)
3. **Age** — For personalized content
4. **AI Personality** — Choose between Rizky 🔥 or Dinda 💜
5. **OTP Verification** — 6-digit email verification code (5-minute expiry)

JWT-based authentication with access + refresh token rotation.

---

## 🏗️ Architecture

```
finsassy-ai/
├── apps/
│   └── web/                    # Next.js 14 (App Router) — Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── login/          # Login page
│       │   │   ├── signup/         # 5-step onboarding
│       │   │   └── (dashboard)/    # Protected dashboard routes
│       │   │       ├── dashboard/      # Financial overview
│       │   │       ├── transactions/   # Transaction management
│       │   │       ├── roast/          # AI roast generator
│       │   │       ├── learn/          # Quizzes, articles, badges
│       │   │       ├── forecast/       # Cash flow prediction
│       │   │       └── settings/       # User preferences
│       │   ├── components/
│       │   │   ├── ui/             # Button, Card, ProgressRing
│       │   │   └── layout/         # Sidebar, LocaleSwitcher
│       │   ├── lib/                # API client, Zustand store, i18n
│       │   └── styles/             # Tailwind CSS + global styles
│       └── tailwind.config.js
├── services/
│   └── api/                    # FastAPI — Backend API
│       ├── routes/
│       │   ├── auth.py             # Signup, login, OTP, refresh
│       │   ├── transactions.py     # CRUD + CSV upload + receipt
│       │   ├── roast.py            # AI roast generation + history
│       │   ├── learning.py         # Quiz, articles, badges, streaks
│       │   ├── insights.py         # Financial health + daily digest
│       │   ├── forecast.py         # Cash flow + bill prediction
│       │   └── user.py             # Profile + preferences
│       ├── services/
│       │   └── llm_service.py      # Groq LLM integration (roast, quiz, articles)
│       ├── utils/
│       │   ├── jwt_handler.py      # JWT creation + verification
│       │   ├── otp_service.py      # OTP generation + email delivery
│       │   └── security.py         # PII masking, input validation
│       ├── models.py               # SQLAlchemy ORM models
│       ├── schemas.py              # Pydantic request/response schemas
│       ├── database.py             # Database connection + session
│       ├── config.py               # Environment configuration
│       └── main.py                 # FastAPI app initialization
├── packages/
│   └── shared-constants/       # Shared types & constants
├── data/
│   ├── seed.py                 # Database seeder (categories, badges, articles)
│   ├── sample_transactions.csv     # 32 demo transactions (IDR)
│   └── sample_transactions_usd.csv # 32 demo transactions (USD)
├── docker-compose.yml          # PostgreSQL + Redis (production)
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server/client components, routing |
| **UI** | Tailwind CSS | Utility-first styling, dark theme, glass-morphism |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **Icons** | Lucide React | Consistent iconography |
| **Fonts** | Inter + Plus Jakarta Sans | Body text + display headings |
| **State** | Zustand (persisted) | Auth tokens, language, currency, mood, sidebar |
| **Backend** | FastAPI + Uvicorn | Async REST API |
| **ORM** | SQLAlchemy 2.0 | Database models and queries |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Data persistence |
| **AI/LLM** | Groq (Llama 3.3 70B) | Roast generation, quiz creation, article writing |
| **Auth** | JWT (python-jose) | Access + refresh token rotation |
| **Password** | Passlib + bcrypt | Secure password hashing |
| **Validation** | Pydantic v2 | Request/response schema validation |
| **Monorepo** | pnpm workspaces + Turborepo | Multi-package management |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **pnpm** (`npm install -g pnpm`)
- **Python** 3.10+
- A **Groq API key** (free at [console.groq.com](https://console.groq.com))

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/finsassy-ai.git
cd finsassy-ai

# Install frontend dependencies
pnpm install

# Install backend dependencies
cd services/api
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# In services/api/, create a .env file:
echo "GROQ_API_KEY=your_groq_api_key_here" > services/api/.env
```

### 3. Start Backend

```bash
cd services/api
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The database (`finsassy.db`) is created automatically on first startup. Categories and seed data are auto-loaded.

### 4. Start Frontend

```bash
cd apps/web
pnpm dev
```

### 5. Open the App

Visit **http://localhost:3000** — create an account and start exploring!

> **Note**: OTP verification codes are printed to the backend terminal console (look for `📧 [DEV] OTP for email: XXXXXX`).

### Sample Data

Two CSV files are included for demo purposes:

| File | Currency | Transactions | Total Income | Total Expenses |
|------|----------|-------------|-------------|----------------|
| `data/sample_transactions.csv` | IDR (Rp) | 32 | Rp 7,650,000 | ~Rp 3,200,000 |
| `data/sample_transactions_usd.csv` | USD ($) | 32 | $4,830 | ~$1,130 |

Upload either file on the Transactions page after signing up.

---

## 📱 Pages & Routes

| Route | Page | Key Features |
|-------|------|-------------|
| `/login` | Login | Email/password auth, language selector |
| `/signup` | Sign Up | 5-step flow: language → account → age → persona → OTP |
| `/dashboard` | Dashboard | Health score, budget %, savings %, streak, daily digest |
| `/transactions` | Transactions | Manual add, CSV upload, receipt photo, filters, table |
| `/roast` | Roast Me 🔥 | Tone selector, period selector, AI roast, share buttons |
| `/learn` | Learn & Level Up | Quiz tab, articles tab, badges & streaks tab |
| `/forecast` | Forecast | 5-week cash flow bars, predicted upcoming bills |
| `/settings` | Settings | Language, currency, persona, savings target, danger zone |

---

## 🎨 Design System

### Glass-Morphism UI
- **Cards**: `bg-white/[0.04] backdrop-blur-sm border-white/[0.06]`
- **Inputs**: `bg-white/[0.04] border-white/[0.08]` with focus ring
- **Buttons**: Gradient primary (`from-brand-primary to-brand-secondary`), glass secondary

### Mood-Adaptive Theme
The entire UI shifts color based on financial health:
- 🟢 **Healthy** (score ≥ 70) — Green accents, positive mood
- 🟡 **Caution** (score 40-69) — Amber accents, warning mood
- 🔴 **Alert** (score < 40) — Red accents, urgent mood

### Typography
- **Body**: Inter — clean and readable
- **Headings**: Plus Jakarta Sans — bold and modern
- **Animations**: Cubic-bezier `[0.4, 0, 0.2, 1]` easing throughout

### Color Palette
- **Primary**: Indigo `#6366f1`
- **Secondary**: Purple `#8b5cf6`
- **Accent**: Cyan `#06b6d4`
- **Background**: Slate 950 `#020617`

---

## 📄 API Endpoints

### Authentication
```
POST   /api/v1/auth/signup/send-otp    # Send OTP to email
POST   /api/v1/auth/signup/verify-otp  # Verify OTP and create account
POST   /api/v1/auth/login              # Login with email + password
POST   /api/v1/auth/refresh            # Refresh access token
GET    /api/v1/auth/me                 # Get current user profile
```

### Transactions
```
GET    /api/v1/transactions            # List transactions (filtered, paginated)
POST   /api/v1/transactions            # Add single transaction
POST   /api/v1/transactions/upload     # Upload CSV file (max 5MB)
GET    /api/v1/transactions/summary    # Monthly summary (income/expense/net)
```

### Roast
```
POST   /api/v1/roast/generate          # Generate AI roast (tone + period)
GET    /api/v1/roast/history           # Get roast history (paginated)
PUT    /api/v1/roast/{id}/share        # Mark roast as shared
```

### Learning
```
GET    /api/v1/learning/quiz/generate  # Generate AI quiz from spending
POST   /api/v1/learning/quiz/{id}/submit  # Submit quiz answers
GET    /api/v1/learning/articles       # Get featured articles
GET    /api/v1/learning/badges         # Get earned badges
GET    /api/v1/learning/streaks        # Get streak data
```

### Insights
```
GET    /api/v1/insights/financial-health  # Health score + mood + metrics
GET    /api/v1/insights/daily-digest      # AI daily spending insight
```

### Forecast
```
GET    /api/v1/forecast/cashflow       # 5-week income/expense projection
GET    /api/v1/forecast/bills          # Predicted upcoming bills
```

### User
```
GET    /api/v1/user/profile            # Get user profile
PUT    /api/v1/user/preferences        # Update settings (language, currency, etc.)
DELETE /api/v1/user/data               # Delete all user data
```

---

## 🌍 Internationalization (i18n)

All user-facing text supports three languages:

| | English 🇺🇸 | Indonesian 🇮🇩 | Chinese 🇨🇳 |
|---|---|---|---|
| **UI Labels** | ✅ | ✅ | ✅ |
| **AI Roasts** | ✅ | ✅ | ✅ |
| **AI Quizzes** | ✅ | ✅ | ✅ |
| **Articles** | ✅ | ✅ | ✅ |
| **Error Messages** | ✅ | ✅ | ✅ |

Currency formatting adapts automatically:
- USD: `$1,234.56`
- IDR: `Rp 1.234.567`
- CNY: `¥1,234.56`

---

## 🔒 Security

- **Password Hashing**: bcrypt via Passlib (no plaintext storage)
- **JWT Authentication**: Short-lived access tokens (15 min) + refresh tokens (7 days)
- **OTP Verification**: 6-digit codes with 5-minute expiry, single-use
- **PII Masking**: Sensitive data is masked before sending to AI models
- **Input Validation**: Pydantic schema validation on all API inputs
- **CORS**: Configured for frontend origin only
- **Rate Limiting**: API and LLM endpoints rate-limited

---

## 📊 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js    │────▶│   FastAPI     │────▶│   Groq AI   │
│   Frontend   │◀────│   Backend     │◀────│  (Llama 3.3)│
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │   SQLite DB   │
                    │  (finsassy.db)│
                    └──────────────┘
```

1. **User signs up** → chooses language, currency, AI persona
2. **Adds transactions** → manual, CSV, or receipt photo
3. **Dashboard updates** → health score, budget %, savings progress
4. **Roast Me** → AI analyzes real spending data → delivers personalized commentary shaped by persona + tone
5. **Learn** → AI generates quizzes based on spending categories → badges + streaks
6. **Forecast** → Predicts future cash flow and recurring bills

---

## 🏆 Hackonomics 2026

### How FinSassy AI Addresses the Judging Criteria

| Criteria | How We Address It |
|----------|------------------|
| **Relevancy** | Directly tackles financial literacy for young adults through AI-powered spending education. Every feature is designed to increase financial awareness. |
| **Technical Execution** | Full-stack monorepo with Next.js 14 + FastAPI + Groq LLM. JWT auth, OTP verification, multi-language support, real-time AI generation. |
| **Presentation** | Glass-morphism dark UI with Framer Motion animations, mood-adaptive theme, responsive design, professional typography. |
| **Impact** | Turns boring finance into engaging, shareable content. Social sharing of roasts spreads financial awareness virally. Gamified learning builds long-term habits. |
| **Innovation** | Persona-driven AI (Rizky/Dinda) that adapts communication style. "Roast Me" mechanic is a novel approach to financial education — humor as a teaching tool. |

---

## 👥 Team

Built with 🔥 for Hackonomics 2026

---

*"Get roasted. Get smart. Get sassy."* 🔥💰
