# 🚀 Team Task Manager (MERN)

A premium, full-stack Task Management application built with the MERN stack (MongoDB, Express, React, Node.js). Featuring a modern **Glassmorphism UI**, robust **Role-Based Access Control (RBAC)**, and real-time project statistics.

**🌐 Live Demo: [team-task-manager-production-24de.up.railway.app](https://team-task-manager-production-24de.up.railway.app)**

![Design Preview](https://img.shields.io/badge/UI-Glassmorphism-purple)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Deployment](https://img.shields.io/badge/Deploy-Railway-green)

---

## ✨ Key Features

- **🛡️ Secure Authentication**: JWT-based auth with encrypted password storage.
- **👥 Advanced Team Management**: 
  - Add/Remove members from projects dynamically.
  - Quick-assign tasks to specific team members.
- **🔑 Role-Based Access Control**:
  - **Admin**: Full oversight, project creation/deletion, and user management.
  - **Project Owner**: Manage their own projects and team members.
  - **Member**: View assigned projects and update task statuses.
- **📊 Real-time Dashboard**: Interactive statistics for total, pending, active, and overdue tasks.
- **🎨 Premium UI**: Beautiful dark-mode interface with Tailwind CSS and glassmorphism effects.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Axios, React Router v6.
- **Backend**: Node.js, Express.js (v5), Mongoose.
- **Database**: MongoDB Atlas.
- **Icons**: Custom SVG system with interactive hover states.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kjagadeeshkumarreddy/Team-Task-Manager.git
   cd Team-Task-Manager
   ```

2. **Install Dependencies**:
   ```bash
   # From root directory
   npm run build
   ```

3. **Environment Setup**:
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. **Run Locally**:
   ```bash
   # Start backend (from backend folder)
   npm run dev
   
   # Start frontend (from frontend folder)
   npm run dev
   ```

---

## 🌐 Deployment (Railway.app)

The project is pre-configured for one-click deployment on Railway.

1. Connect your GitHub repository to Railway.
2. Set the following environment variables in Railway:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
3. Railway will use the root `package.json` to build and start the server automatically.

---

## 📝 Usage Guide

### Roles & Permissions
- **Status Updates**: ONLY users with the **Member** role can change task statuses.
- **Task Management**: ONLY **Admins** and **Project Owners** can create or delete tasks/projects.
- **Team Assignment**: Use the "Team Members" button inside any project to manage your team.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by the TaskMaster Team.**
