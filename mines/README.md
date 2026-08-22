# MINES Game — Complete Implementation

A full-stack, production-quality, web-based **Mines risk/reward casino game** built with React, Vite, TypeScript, Tailwind CSS, Framer Motion, Node.js, Express, Prisma ORM, and SQLite/PostgreSQL.

---

## 🌟 Features

- **Server-Authoritative Game Logic**: Mine positions are generated on the backend using cryptographically secure random integers (`crypto.randomInt`) and kept secret from the client until round completion.
- **Rigorous Mathematical Multipliers**: Real-time calculation of probabilities using combination formulas $C(S, P) / C(T, P)$ and applied configurable house edge (default 5%).
- **1xBet-Inspired Gaming Aesthetic**: Rich dark slate background, glowing metallic 3D stone tiles, gem reveals, red flash mine explosions, screen shake effects, and procedural sound synthesis via Web Audio API.
- **Page Refresh Recovery**: If the user reloads mid-game, active round state is automatically hydrated from the server.
- **Full Password-Protected Admin Dashboard**: Real-time statistics, game configuration editor, house edge setting, emergency stop toggle, maintenance mode, and historical game inspection.
- **Demo Wallet Persistence**: Local demo wallet with balance validation and user-facing balance reset.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti, Web Audio API
- **Backend**: Node.js, Express.js, TypeScript, Zod Validation, JWT Auth, Express Rate Limit
- **Database**: Prisma ORM with SQLite (zero-config local runtime) & PostgreSQL support
- **Monorepo**: Orchestrated with root NPM scripts & Concurrently

---

## 📁 Project Structure

```
mines/
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # GameBoard, BettingPanel, Navbar, AdminDashboard, etc.
│   │   ├── services/           # REST API client
│   │   ├── utils/              # Game math, procedural Web Audio synth, canvas confetti
│   │   └── types/              # Frontend TypeScript definitions
│   └── package.json
├── server/                     # Express + TypeScript + Prisma Backend
│   ├── src/
│   │   ├── controllers/        # gameController, walletController, adminController
│   │   ├── services/           # gameEngine, walletService, adminService
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Combination formulas & probability math
│   │   └── types/              # Backend TypeScript definitions
│   ├── prisma/
│   │   └── schema.prisma       # Prisma DB models
│   └── package.json
├── package.json                # Monorepo root scripts
├── README.md                   # Documentation
├── .env.example                # Environment variables template
└── .env                        # Local environment settings
```

---

## ⚙️ Environment Variables

Create `.env` (or `.env.example`) at root and in `server/`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_PASSWORD=change_this_password
ADMIN_SESSION_SECRET=mines_admin_super_secret_jwt_key_2026_x99
DEFAULT_HOUSE_EDGE=0.05
DEFAULT_STARTING_BALANCE=10000
DATABASE_URL="file:./dev.db"
```

---

## 🚀 Quick Start Guide

### 1. Installation

Run setup in monorepo root:

```bash
npm run setup
```

### 2. Database Initialization

Synchronize Prisma schema and generate Prisma client:

```bash
npm run db:push
```

### 3. Running Development Servers

Run both backend and frontend concurrently:

```bash
npm run dev
```

- **Client App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🎲 Game Mathematics

Let:
- $T$ = Total Tiles (25 for a 5x5 board)
- $M$ = Number of Mines
- $S = T - M$ = Safe Tiles
- $P$ = Number of Safe Picks

The probability of making $P$ consecutive safe picks without hitting a mine:

$$\text{Probability}(P) = \frac{C(S, P)}{C(T, P)} = \prod_{i=0}^{P-1} \frac{S - i}{T - i}$$

Fair Multiplier:

$$\text{Fair Multiplier} = \frac{1}{\text{Probability}(P)}$$

Final Multiplier with House Edge $H$ (e.g., 5% = 0.05):

$$\text{Final Multiplier} = \text{Fair Multiplier} \times (1 - H)$$

Payout:

$$\text{Payout} = \lfloor \text{Bet Amount} \times \text{Final Multiplier} \rfloor$$

---

## 🔑 Admin Access Setup

1. Click the **Admin** button in the top-right corner of the navigation header.
2. Enter the admin password configured in `.env` (default: `change_this_password`).
3. Access the full admin dashboard to adjust house edge, min/max bets, default mine counts, toggle emergency stop, or view system stats and game history.

---

## 🧪 Verification & Testing

To test the application build:

```bash
npm run build
```

Build succeeds with zero TypeScript errors across both client and server!
