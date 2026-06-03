<div align="center">

# 🌱 Zero Hunger

### Rescue surplus food. Feed your community.

Zero Hunger is a food-rescue platform that connects **donors** (restaurants, grocers, businesses) with **NGOs** and **volunteers** to move surplus food to people in need — before it goes to waste.

[Features](#-features) · [Tech stack](#-tech-stack) · [Quick start](#-quick-start) · [Architecture](SYSTEM_ARCHITECTURE.md) · [API](API_DOCUMENTATION.md) · [Deploy](DEPLOYMENT.md)

</div>

---

## 💡 Why

Every year about **1 billion tonnes** of food is wasted while **735 million people** go hungry. The problem usually isn't scarcity — it's logistics. Zero Hunger is the connective tissue: it lets a donor post surplus in seconds, notifies nearby NGOs in real time, and lets volunteers coordinate pickup and delivery so good food reaches a plate instead of a landfill.

## ✨ Features

- **Four roles, one flow** — Donors post food, NGOs claim it, volunteers deliver it, admins keep the platform healthy.
- **Real-time notifications** — Socket.IO pushes updates the moment a donation is posted, claimed, assigned, or completed (with polling fallback).
- **Role-based dashboards** — Animated stats, responsive tables, and a live notification bell for each role.
- **Secure auth** — JWT + bcrypt, admin approval workflow, password reset by email.
- **Donation lifecycle** — `available → assigned → in_progress → completed`, with image uploads and pickup windows.
- **Production-hardened** — input validation, rate limiting, security headers, centralized error handling, health checks.

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Socket.IO client |
| Backend | Node, Express, TypeScript, Mongoose, Socket.IO, JWT, Zod, Helmet |
| Database | MongoDB |
| Email / Images | Nodemailer (Gmail), ImgBB |
| Tooling | Vitest, Supertest, ESLint, GitHub Actions CI |
| Hosting | Render (API web service + static frontend) |

## 📁 Repository layout

```
Zero-Hunger/
├── Backend/        Express + TypeScript API and Socket.IO server
│   └── src/
│       ├── config/        env validation, DB, socket, mailer
│       ├── controllers/   request handlers (auth, donor, ngo, volunteer, admin)
│       ├── middlewares/    auth, validation, security, error handling
│       ├── models/         Mongoose schemas (User, Food, Notification)
│       ├── routes/         API routes
│       ├── validators/     Zod schemas
│       └── server.ts       app entry
├── Frontend/       React + Vite SPA
│   └── src/
│       ├── components/     landing/, dashboard/, ui/ (design system), auth/
│       ├── contexts/       per-role state
│       ├── hooks/          realtime notifications
│       └── utils/          shared axios + socket clients
├── render.yaml     Render blueprint (two services)
└── .github/        CI
```

## 🚀 Quick start

> Requires Node 18–20 and a MongoDB instance (local or Atlas).

```bash
git clone https://github.com/Abdul-Moiz31/Zero-Hunger.git
cd Zero-Hunger

# Backend
cd Backend
cp .env.example .env          # fill in MONGO_URI, JWT_SECRET, EMAIL_*, IMGBB_KEY
npm install
npm run dev                   # http://localhost:5000

# Frontend (new terminal)
cd ../Frontend
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                   # http://localhost:5173
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **macOS:** port 5000 is often used by AirPlay Receiver. Disable it or set a different `PORT`.

## 🧪 Tests

```bash
cd Backend && npm test        # Vitest + in-memory MongoDB
```

## 📚 Documentation

| Doc | What's inside |
|---|---|
| [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) | High-level design, data flow, real-time model |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Every endpoint, auth, and payloads |
| [DATABASE_DOCUMENTATION.md](DATABASE_DOCUMENTATION.md) | Collections, fields, indexes, relationships |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploying to Render |
| [SECURITY.md](SECURITY.md) | Security posture + required secret rotation |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

## 🤝 Roles at a glance

| Role | Can |
|---|---|
| **Donor** | Post donations, track status, view their impact |
| **NGO** | Claim donations, manage volunteers, assign deliveries |
| **Volunteer** | See assigned tasks, update delivery status |
| **Admin** | Approve users, oversee donations, view platform stats |

## 📄 License

Released under the MIT License — see [LICENSE](LICENSE).
