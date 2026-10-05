# IT Pulse — Student Activity & Achievement Platform

> **IT Department Student Activity & Achievement Platform**  
> *TRACK • VERIFY • GROW*

IT Pulse is a web platform designed for the Department of Information Technology to track, verify, and celebrate student co-curricular, technical, sports, cultural, and academic achievements with role-based faculty verification.

---

## 🌟 Key Features

### 🎓 1. Student Portal (`/student/dashboard`)
- **Activity Tracker**: View all submitted activities, verified credentials, and pending approvals.
- **Peer Accomplishments Feed**: See recent faculty-approved achievements from fellow IT peers.
- **Add Activity**: Submit new technical events, certifications, hackathons, and sports activities with document uploads.
- **Student Profile**: Overview of student details (PRN, Roll No, Department, Year) and achievement portfolio.

### 👩‍🏫 2. Faculty / Staff Portal (`/staff/dashboard`)
- **Verification Queue**: Review student submissions with live preview of uploaded certificates and documents.
- **One-Click Approval / Return**: Approve credentials or reject with actionable feedback reasons.
- **Search Students**: Find students by name, roll number, department, or academic year.
- **Document Repository**: Access verified student certificates.
- **Reports & Analytics**: Faculty-level analytics on verified activities.

### 🛡️ 3. Administrator Portal (`/admin/dashboard`)
- **Institutional Metrics**: Total students, faculty coordinators, verified records, and pending reviews.
- **Activity Analytics**: Charts by category, status, competition level (College, University, State, National, International), and monthly trend.
- **Student & Staff Management**: View and filter institutional records.
- **Export Reports**: Generate CSV and Excel summaries for institutional audits.

---

## 🎨 Design & UI
- **Cosmic Neon Theme**: Deep midnight navy, electric neon cyan, and neon magenta glow matching the IT Pulse 3D emblem.
- **Animated 5-Second Splash Screen**: Smooth loading bar with synchronized status updates, floating emblem with ambient glow, and animated title.
- **3D Card Flip Login**: Interactive role switching and student selection with 3D perspective flip animations.

---

## 🚀 Tech Stack
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Custom Neon Cosmic Design Tokens
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router v7

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate into the project directory
cd student-activity-app

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 👥 Roles & Mock Portals
- **Student**: Search student name to access portfolio
- **Staff**: `staff@itpulse.edu`
- **Admin**: `admin@itpulse.edu`