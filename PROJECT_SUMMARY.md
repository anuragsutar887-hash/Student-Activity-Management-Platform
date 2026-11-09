# IT Pulse — Student Activity Management Platform (SAMP)
## Comprehensive Technical Architecture & Portal Operating Manual

> **Purpose of this Document:** This reference manual provides an exhaustive architectural, operational, and thematic guide to the **IT Pulse** portal. It is designed to be shared with incoming AI agents, developers, or maintainers so they have instant, complete context to navigate, debug, customize the visual theme, or extend features across the platform.

---

## 1. Project Overview & Quick Reference

| Attribute | Details |
| :--- | :--- |
| **Project Name** | IT Pulse (Student Activity Management Platform) |
| **Department** | Department of Information Technology (IT Dept) |
| **Production URL** | [https://frontend-ten-beta-14.vercel.app](https://frontend-ten-beta-14.vercel.app) |
| **GitHub Repository** | [https://github.com/anuragsutar887-hash/Student-Activity-Management-Platform](https://github.com/anuragsutar887-hash/Student-Activity-Management-Platform) |
| **Main Branch** | `main` |
| **Frontend Framework** | React 19 + Vite 8 (Single Page Application) |
| **Styling Engine** | Tailwind CSS v4 (`@import "tailwindcss";`, `@custom-variant dark`) |
| **Iconography** | Lucide React |
| **Charts Engine** | Recharts (optimized for lag-free rendering & zero slice gaps) |
| **Database & Backend** | Supabase (PostgreSQL) + Resilient Client-Side `localStorage` fallback |

### Live Supabase Credentials
- **Supabase Project URL:** `https://nghxwqnibaaxmgdgdrhx.supabase.co`
- **Supabase Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5naHh3cW5pYmFheG1nZGdkcmh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTk2ODAsImV4cCI6MjEwNjY3NTY4MH0.3ijaE8t7uhvBsInA7MhhW8ihHkNCc8xHebGcscLDB1g`
- **Configuration File:** `frontend/src/lib/supabase.js` and `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

---

## 2. Portal User Roles, Authentication & Credentials

Authentication is handled via `AuthContext.jsx` backed by `authService.js` and `studentService.js`.

### A. Student Account Credentials (68 Pre-seeded Students)
- **Selection:** Students search their name or Roll No (`C01` through `C68`) from the interactive dropdown.
- **PRN (Compulsory):** Each student has an assigned default PRN (e.g. `PRN2024IT001` to `PRN2024IT068`) or can register their custom university PRN (e.g. `72214568K`).
- **PRN Uniqueness Rule:** If Student B enters Student A's PRN, authentication **fails immediately** with the exact error:
  `PRN is wrong. PRN "<entered>" is already registered to another student (<Name>).`
- **Default Password Format:** `Pass@<RollNumber>` (e.g., Roll `C01` is `Pass@01`, Roll `C14` is `Pass@14`, Roll `C60` is `Pass@60`).
- **Example Student:**
  - **Name:** Sutar Anurag Dhanyakumar
  - **Roll No:** `C60`
  - **Default PRN:** `PRN2024IT060`
  - **Password:** `Pass@60`

### B. Faculty / Staff Coordinator Credentials
- **Email:** `faculty@itpulse.edu` (also accepts `teacher@itpulse.edu` or `staff@itpulse.edu`)
- **Password:** `Teacher@IT2026!`
- **Role Permissions:** Student activity review, 1-click verify/reject, academic groups oversight, student directory, certificate viewer.

### C. System Administrator Credentials
- **Email:** `admin@itpulse.edu`
- **Password:** `Admin@IT2026!`
- **Role Permissions:** Full institution oversight, audit logs, student & staff record management, category/department configuration, system settings.

---

## 3. Visual Theme Architecture & How to Change Themes

The application uses **Tailwind CSS v4** with a custom class-based dark mode implementation and standard CSS custom properties.

### Key Theme Files
1. **`ThemeContext.jsx`:**
   - Manages state `'light' | 'dark'`.
   - Persists selection to `localStorage.getItem('itpulse-theme')`.
   - Toggles the `.dark` class directly on `document.documentElement` (`<html>`).
2. **`index.css`:**
   - Line 3: `@custom-variant dark (&:where(.dark, .dark *));` enables Tailwind's `dark:` modifier without legacy `tailwind.config.js`.
   - CSS Custom properties for Light (`:root`) and Dark (`.dark`) color schemes:
     - `--app-background`: `#f8f9fe` (Light) vs `#090d16` (Dark)
     - `--surface-card`: `#ffffff` (Light) vs `#0f172a` (Dark)
     - `--surface-nested`: `#f1f3fb` (Light) vs `#1e293b` (Dark)
     - `--border-primary`: `#e2e8f0` (Light) vs `#334155` (Dark)
     - `--text-primary`: `#0f172a` (Light) vs `#f8fafc` (Dark)
3. **`Header.jsx`:**
   - Header theme toggle button (`Sun` / `Moon` icon) invokes `toggleTheme()`.

### Guidelines for Changing or Extending Themes (Avoiding "Color Patches")
When modifying UI components or creating new pages, follow these strict rules to avoid washed-out patches or illegible dark-mode blocks:

1. **Card Backgrounds:** Never write plain `bg-white`. Always pair with dark styling:
   ```jsx
   // Correct pattern
   className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
   // Or for nested panels:
   className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700"
   ```
2. **Text Contrasts:**
   - Primary headings: `text-slate-900 dark:text-slate-100`
   - Secondary body: `text-slate-600 dark:text-slate-300`
   - Muted/captions: `text-slate-500 dark:text-slate-400`
   - Active brand text: `text-indigo-600 dark:text-indigo-400`
3. **Form Inputs & Selects:**
   ```jsx
   className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500"
   ```
4. **Hero Banners:**
   The `.dashboard-hero` CSS class in `index.css` is an isolation-based gradient that works seamlessly in both light and dark modes with neon cyan/magenta ambient orbs.

---

## 4. Key Portal Features & User Workflows

### A. Student Module ("Add Achievement" Workflow)
- **Terminology:** All student-facing buttons, navbars, and headers are standardized to **"Add Achievement"** (formerly "Add Activity").
- **Compulsory Certificate:**
  - Certificate file upload has a red asterisk (`*Compulsory`).
  - Form validation explicitly enforces certificate attachment when clicking **Submit** (`intent === 'submit'`).
  - Students can also click **Save Draft** without a certificate to return to it later.
- **Seeded Peer Activities for New Users:**
  - In `activityService.js`, storage key `student-activities-v11` seeds 6 verified IT achievements on first load (Smart India Hackathon, AWS Cloud Practitioner, IEEE Paper, etc.).
  - New students immediately see verified peer activities on the dashboard and in "All Activities".

### B. Staff & Faculty Verification Module
- **Verification Queue:** Pending student submissions are listed in `StudentSubmissions.jsx` and `StaffDashboard.jsx`.
- **One-Click Approval / Rejection:**
  - Coordinators can click **Verify** or **Reject** with written feedback in `VerifyActivity.jsx`.
  - Feedback is sent directly to the student dashboard with a revision notice.
- **Certificate Verification:** In-modal document viewer (`CertificateModal.jsx`) displays certificate previews with zoom, print, and download capabilities.
- **Academic Groups:** Faculty coordinators view assigned academic cohorts in `MyGroups.jsx`.

### C. Administrator Module
- **Live Institutional Metrics:** Real-time breakdown of submissions across academic years and categories.
- **Smooth Recharts:**
  - BarCharts configured with `isAnimationActive={false}` and `maxBarSize={36}` to eliminate lag.
  - PieCharts configured with `paddingAngle={0}` and `stroke="none"` to eliminate white slice gaps.
- **User & Category Management:** Create, edit, and deactivate students, faculty members, and activity categories.
- **Audit Logging:** `AuditLog.jsx` tracks all status transitions and administrative updates.

---

## 5. Complete Routing Table

All routes are protected by role-based route guards (`RoleRoute`) in `App.jsx`:

```
/
├── /login                          Public Login Portal (Student, Staff, Admin)
│
├── /student/
│   ├── dashboard                   Student Overview & Peer Feed
│   ├── activity/add                Add Achievement (Compulsory Certificate)
│   ├── activities                  My Activities (Drafts, Pending, Verified)
│   ├── all-activities              All Activities (Institution-wide portal)
│   ├── activity/:id                Detailed Achievement View
│   └── profile                     Student Profile & PRN Details
│
├── /staff/
│   ├── dashboard                   Faculty Verification Dashboard & Metrics
│   ├── submissions                 Full Student Submissions Table
│   ├── pending                     Queue of Pending Submissions
│   ├── verified                    Verified Records
│   ├── rejected                    Rejected / Action-Needed Records
│   ├── verify/:id                  Verify / Reject Activity Form
│   ├── students                    Student Directory & Search
│   ├── students/:id                Individual Student Dossier
│   ├── documents                   Certificates Repository
│   ├── groups                      My Assigned Academic Groups
│   ├── reports                     Faculty Reports & Analytics
│   └── profile                     Staff Profile & Password Management
│
└── /admin/
    ├── dashboard                   System Executive Overview
    ├── students                    Manage Student Accounts
    ├── staff                       Manage Faculty Staff
    ├── categories                  Manage Categories
    ├── activities                  All Activities Master List
    ├── verification                Admin Verification Override
    ├── documents                   Institutional Evidence Files
    ├── groups                      Academic Groups Administration
    ├── audit                       System Audit Log
    ├── reports                     Full Institutional Reports & Export
    ├── settings                    System Configuration & Toggles
    └── profile                     Admin Profile
```

---

## 6. Directory Map & File Architecture

```
student-activity-mangement-main/
├── package.json                    Root package (build proxy for Vercel)
├── vercel.json                     Vercel SPA rewrite & build configuration
├── supabase/
│   ├── schema.sql                  Core database schema
│   └── migration_v2_staff_auth.sql Staff authorization & audit logs
└── frontend/
    ├── index.html                  Vite entry HTML
    ├── package.json                React 19 & Tailwind v4 dependencies
    ├── vercel.json                 Frontend SPA routing rewrites
    ├── vite.config.js              Vite build setup
    └── src/
        ├── App.jsx                 Router & RoleRoute guards
        ├── index.css               Tailwind v4 imports, dark variant, CSS variables
        ├── components/
        │   ├── Header.jsx          Top navigation, theme toggle, notifications
        │   ├── Sidebar.jsx         Responsive role-based drawer sidebar
        │   ├── Card.jsx            Standard metric card
        │   ├── Modal.jsx           Accessible dialog modal
        │   ├── CertificateModal.jsx Certificate viewer with print/zoom
        │   ├── ActivityBrowser.jsx Searchable activity grid & cards
        │   └── StatusBadge.jsx     Status indicators (Verified, Pending, etc.)
        ├── context/
        │   ├── AuthContext.jsx     Authentication state & persistence
        │   └── ThemeContext.jsx    Theme state (Light/Dark) & DOM injector
        ├── layouts/
        │   ├── StudentLayout.jsx   Student dashboard layout wrapper
        │   ├── StaffLayout.jsx     Faculty coordinator layout wrapper
        │   └── AdminLayout.jsx     System administrator layout wrapper
        ├── pages/
        │   ├── auth/Login.jsx      Searchable student/staff/admin login
        │   ├── student/            AddActivity, MyActivities, AllActivities, etc.
        │   ├── staff/              StaffDashboard, VerifyActivity, MyGroups, etc.
        │   └── admin/              AdminDashboard, ManageStudents, AuditLog, etc.
        └── services/
            ├── activityService.js  Activity CRUD, seeds, status updates (v11)
            ├── studentService.js   Student records, PRN validation, seed profiles
            ├── authService.js      Authentication logic & PRN error handling
            └── academicService.js  Academic cohorts & audit logging
```

---

## 7. Build, Deployment & CI/CD

- **Build Command:** `npm run build` (or `npm --prefix frontend run build`)
- **Output Directory:** `frontend/dist`
- **SPA Routing:** Configured in `vercel.json` and `frontend/vercel.json` with rewrite rule `{"source": "/(.*)", "destination": "/index.html"}` to prevent 404s on browser reloads.
- **Git Push Deployment:** Pushing commits to `main` on GitHub triggers automatic deployment on Vercel.
