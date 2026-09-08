# Chamidu Herath - Giveaway Platform 🚀

A modern, high-performance, mobile-first giveaway platform built for the YouTube channel **Chamidu Herath**. The platform connects YouTube viewers to custom giveaways hosted at custom URLs. The architecture prioritizes security, data privacy, resource efficiency, and a clean, dynamic UI/UX.

## 🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/) (Mongoose)
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org/) (Credentials Only)
- **Rate Limiting**: [Upstash Redis](https://upstash.com/)
- **Validation**: [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/)

## ✨ Key Features

- **Mobile-First Premium UI**: Designed with glassmorphism, smooth gradients, and micro-animations for an engaging user experience.
- **Strict Security & Anti-Spam**: 
  - Upstash Redis rate limiting to prevent form spam.
  - MongoDB Compound Unique Indexes to block duplicate entries per phone number or YouTube username.
- **Bulletproof Admin Dashboard**: The `/admin` dashboard uses a strictly environment-variable-backed NextAuth setup. There are no database accounts to hack.
- **Data Privacy**: Automatic E.164 phone number normalization and frontend masking (e.g., `+9477****567`).
- **Interactive Winner Selection**: A fully animated "Slot Machine" algorithm built with Framer Motion that randomly shuffles and reveals winners with confetti celebrations.
- **Automated YouTube Integrations**: Automatically extracts video IDs and fetches maximum resolution thumbnails from YouTube URLs.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/atlas/database) account
- A free [Upstash Redis](https://upstash.com/) account

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/giveaway.chamidu.me.git
cd giveaway.chamidu.me
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following variables. (See `.env.example` if available).

```env
# MongoDB Connection String
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/giveaways?retryWrites=true&w=majority"

# Security (Generate a random 32+ character string)
# You can generate one via: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Admin Authentication (Strictly ENV backed)
ADMIN_USERNAME="your_admin_username"
# Generate a bcrypt hash for your password:
# node -e "require('bcryptjs').hash('your_password', 10, (err, hash) => console.log(hash))"
ADMIN_PASSWORD_HASH="$2a$12$R9h/cIPz0gi.URNNX3rubedAKRoQeb8/..."

# Upstash Redis for Rate Limiting
UPSTASH_REDIS_REST_URL="https://your-upstash-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the public site.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to log in to the dashboard.

## 🔒 Security Notes
- **Never commit your `.env.local` file.**
- The admin dashboard is completely isolated from the database for authentication. The only way to access the dashboard is by knowing the exact `ADMIN_USERNAME` and the plaintext password that corresponds to the `ADMIN_PASSWORD_HASH` stored in your environment variables.

## 📄 License
This project is proprietary and built specifically for Chamidu Herath. All rights reserved.
