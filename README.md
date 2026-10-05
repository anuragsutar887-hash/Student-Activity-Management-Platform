# Student Activity Management — IT Pulse

> **Department of Information Technology**  
> *Student Activity & Achievement Platform*  
> **TRACK • VERIFY • GROW**

---

## 📁 Repository Structure

```text
student-activity-mangement/
├── frontend/                  # React 19 + Vite + Tailwind CSS Application
│   ├── src/                   # React components, pages, context, and services
│   │   ├── assets/            # Official 3D emblem and images
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth and global state
│   │   ├── data/              # Mock student and activity database
│   │   ├── layouts/           # Student, Staff, and Admin layouts
│   │   ├── pages/             # Splash, Login, Student, Staff, and Admin pages
│   │   └── services/          # Activity and student business logic
│   ├── public/                # Static assets, logos, and icons
│   ├── package.json           # Frontend dependencies and scripts
│   ├── vite.config.js         # Vite configuration
│   ├── eslint.config.js       # ESLint configuration
│   └── index.html             # HTML entry point
│
└── README.md                  # Project overview and setup guide
```

---

## 🚀 Getting Started

### 1. Run the Frontend Locally

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if cloning freshly)
npm install

# Start development server
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

### 2. Production Build

To test or build the optimized production bundle:

```bash
cd frontend
npm run build
npm run preview
```

---

## 👥 Portals & Access

| Portal | Route | Access Method |
| :--- | :--- | :--- |
| **Splash Screen** | `/` | 5-second animated loading screen |
| **Login** | `/login` | 3D flip card role switcher |
| **Student** | `/student/dashboard` | Search student name (e.g. `Anurag Sharma`, `Priya Patel`, `Rohan Todgire`) |
| **Staff** | `/staff/dashboard` | `staff@itpulse.edu` |
| **Admin** | `/admin/dashboard` | `admin@itpulse.edu` |