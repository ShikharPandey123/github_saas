# Commitly – AI-Powered Github code summarizer and collaborative platform

## Overview

**GitHub SaaS** is a full-stack, AI-powered platform for teams to manage, analyze, and collaborate on software projects. It integrates with GitHub, provides AI-driven code and meeting insights, supports team management, and offers a modern, responsive UI built with Next.js 15, Prisma, Clerk, Stripe, AssemblyAI and Gemini AI.

---

## Features

### 🚀 Project & Team Management
- **Create, archive, and manage projects** linked to GitHub repositories.
- **Invite team members** and manage roles.
- **View and manage all your projects and teams in one place.**

### 🔒 Authentication & Authorization
- **Clerk** for secure authentication (sign up, sign in, sync user).
- **Role-based access** for project and team actions.

### 🧑‍💻 GitHub Integration
- **Connect GitHub repositories** to projects.
- **Fetch and display commit logs** with author avatars, commit messages, and AI-generated summaries.
- **Code references**: View and search referenced files, with syntax highlighting and markdown rendering.

### 💡 AI-Powered Q&A & Code Insights
- **Ask questions** about your codebase and get AI-generated answers.
- **AI-generated code summaries** and file references for better understanding.
- **Code reference UI**: Responsive, tabbed view for code and markdown, with file summaries.

### 📊 Meeting Management & Transcription
- **Upload meeting audio files** (supports public URLs and local uploads).
- **Automatic transcription and summarization** using AssemblyAI.
- **View meeting issues, summaries, and status (processing/completed).**
- **Delete and manage meetings.**

### 💸 Credits & Billing
- **Stripe integration** for payments and credit management.
- **Credits deducted for AI/meeting processing.**
- **View and purchase credits.**

### 🧩 Modern UI & UX
- **Responsive design** for desktop and mobile.
- **shadcn/ui** and Radix UI for accessible, beautiful components.
- **Next.js App Router** for fast, scalable routing.
- **Dark/light mode support.**

### 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, shadcn/ui, Tailwind CSS, Radix UI, React Query
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL (Neon), Clerk, Stripe, AssemblyAI, Cloudinary
- **AI:** Gemini API, AssemblyAI, LangChain (for advanced code/AI features)
- **Other:** Cloudinary for file storage, Vercel for deployment

---

## Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/ShikharPandey123/github_saas.git
   cd github_saas
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your keys for Clerk, Stripe, AssemblyAI, Gemini, Cloudinary, and your database.

4. **Prisma setup:**
   ```sh
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Run locally:**
   ```sh
   npm run dev
   ```

6. **Deploy:**  
   Deploy to Vercel. Make sure to add `prisma generate` to your build script.

---

## Folder Structure

- `/app` – Next.js app directory (pages, API routes, protected routes)
- `/components` – UI components (shadcn/ui, custom)
- `/hooks` – Custom React hooks
- `/lib` – Utility libraries (AI, GitHub, Stripe, etc.)
- `/prisma` – Prisma schema and migrations
- `/public` – Static assets

---
