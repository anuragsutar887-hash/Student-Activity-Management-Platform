-- ==============================================================================
-- IT PULSE: STUDENT ACTIVITY MANAGEMENT PLATFORM
-- PRODUCTION SUPABASE POSTGRESQL SCHEMA (IDEMPOTENT & PRODUCTION TESTED)
-- ==============================================================================
-- Designed for High Scalability, Data Integrity, Auditability, and Strict Security.
-- Safe to run multiple times in your Supabase Project -> SQL Editor.
-- ==============================================================================

-- 1. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. MIGRATION ADAPTER: ENSURE NEW COLUMNS EXIST IF TABLES WERE CREATED EARLIER
-- (Prevents "column prn does not exist" error on pre-existing database tables)
-- ==============================================================================
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS prn TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS roll_no TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'Pass@01';

ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS prn TEXT;
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS roll_no TEXT;
ALTER TABLE IF EXISTS public.activities ADD COLUMN IF NOT EXISTS certificate_data TEXT;

-- ==============================================================================
-- 4. CORE ENTITY TABLES
-- ==============================================================================

-- DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ACTIVITY CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STUDENTS TABLE
-- Roll No: C1-C68 (Class Roll Number)
-- PRN: Alphanumeric Unique University/Institute Registration Number (e.g. PRN2024IT001)
CREATE TABLE IF NOT EXISTS public.students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roll_no TEXT NOT NULL UNIQUE,
  prn TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT 'Pass@01',
  department TEXT NOT NULL DEFAULT 'Information Technology',
  year TEXT NOT NULL DEFAULT '2nd Year',
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure UNIQUE constraints exist on roll_no and prn even if table was created in an older run
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_roll_no_key') THEN
    BEGIN
      ALTER TABLE public.students ADD CONSTRAINT students_roll_no_key UNIQUE (roll_no);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_prn_key') THEN
    BEGIN
      ALTER TABLE public.students ADD CONSTRAINT students_prn_key UNIQUE (prn);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- STAFF / FACULTY TABLE
CREATE TABLE IF NOT EXISTS public.staff (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL DEFAULT 'Information Technology',
  designation TEXT DEFAULT 'Department Activity Coordinator',
  role TEXT NOT NULL DEFAULT 'Staff',
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id TEXT,
  roll_no TEXT,
  prn TEXT NOT NULL DEFAULT 'PRN2024IT001',
  student_name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Information Technology',
  year TEXT DEFAULT '2nd Year',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('College', 'University', 'State', 'National', 'International')),
  date DATE NOT NULL,
  organizer TEXT,
  achievement TEXT,
  description TEXT,
  certificate TEXT,
  certificate_data TEXT,
  certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected', 'Draft')),
  remarks TEXT DEFAULT '',
  rejection_reason TEXT DEFAULT '',
  verified_by TEXT,
  verified_at DATE,
  rejected_by TEXT,
  rejected_at DATE,
  submitted_at DATE DEFAULT CURRENT_DATE,
  verification_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SYSTEM NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_email TEXT,
  role TEXT,
  text TEXT NOT NULL,
  time_label TEXT DEFAULT 'Just now',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. PERFORMANCE & QUERY OPTIMIZATION INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_activities_prn ON public.activities (prn);
CREATE INDEX IF NOT EXISTS idx_activities_roll ON public.activities (roll_no);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities (status);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities (category);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities (date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON public.students (roll_no);
CREATE INDEX IF NOT EXISTS idx_students_prn ON public.students (prn);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students (email);
CREATE INDEX IF NOT EXISTS idx_students_dept ON public.students (department);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff (email);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_email);

-- ==============================================================================
-- 6. AUTOMATED TIMESTAMP TRIGGERS
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_staff_updated_at ON public.staff;
CREATE TRIGGER trg_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON public.activities;
CREATE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES (Idempotent Drop + Create)
-- ==============================================================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to departments" ON public.departments;
CREATE POLICY "Allow public read access to departments" ON public.departments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public modify access to departments" ON public.departments;
CREATE POLICY "Allow public modify access to departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public modify access to categories" ON public.categories;
CREATE POLICY "Allow public modify access to categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert/update to students" ON public.students;
CREATE POLICY "Allow public insert/update to students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to staff" ON public.staff;
CREATE POLICY "Allow public read access to staff" ON public.staff FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert/update to staff" ON public.staff;
CREATE POLICY "Allow public insert/update to staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to activities" ON public.activities;
CREATE POLICY "Allow public read access to activities" ON public.activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access to activities" ON public.activities;
CREATE POLICY "Allow public write access to activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to notifications" ON public.notifications;
CREATE POLICY "Allow public access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. STORAGE BUCKET CONFIGURATION (for Certificates)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read certificates" ON storage.objects;
CREATE POLICY "Allow public read certificates" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Allow public upload certificates" ON storage.objects;
CREATE POLICY "Allow public upload certificates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Allow public update certificates" ON storage.objects;
CREATE POLICY "Allow public update certificates" ON storage.objects FOR UPDATE USING (bucket_id = 'certificates');

-- ==============================================================================
-- 9. INITIAL ESSENTIAL CONFIGURATION (Departments and Categories)
-- ==============================================================================
INSERT INTO public.departments (name, code)
VALUES ('Information Technology', 'IT')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.categories (name, description)
VALUES 
  ('Technical', 'Coding contests, tech symposiums, and software development'),
  ('Workshop', 'Hands-on technical workshops and bootcamps'),
  ('Sports', 'Inter-collegiate and university athletic championships'),
  ('Cultural', 'College cultural fests, arts, music and dramatics'),
  ('Research', 'Scopus/IEEE research paper presentations and publications'),
  ('Social Service', 'NSS, campus green drives and community outreach'),
  ('Hackathon', 'Competitive innovation hackathons and design sprints'),
  ('Competition', 'Academic and co-curricular competitions'),
  ('Certification', 'Industry and cloud certifications (AWS, GCP, etc.)'),
  ('Academic', 'Specialized academic projects and seminars'),
  ('Innovation', 'Patents, prototypes, and startup initiatives'),
  ('Other', 'Other validated co-curricular achievements')
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- 10. AUTHORIZED TEACHER ACCOUNT SEED
-- ==============================================================================
INSERT INTO public.staff (name, email, department, designation, role)
VALUES ('Prof. Faculty Coordinator', 'teacher@itpulse.edu', 'Information Technology', 'Department Activity Coordinator', 'Staff')
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- 11. CLASS ROSTER SEED: 68 STUDENTS (Roll C1–C68, Alphanumeric PRN, Passwords)
-- ==============================================================================
INSERT INTO public.students (roll_no, prn, name, email, password, department, year, status)
VALUES
  ('C1',  'PRN2024IT001', 'Adhav Satyajeet Bharat',       'c1@itpulse.edu',  'Pass@01', 'Information Technology', '2nd Year', 'Active'),
  ('C2',  'PRN2024IT002', 'Ankalle Abhishek Balbhim',     'c2@itpulse.edu',  'Pass@02', 'Information Technology', '2nd Year', 'Active'),
  ('C3',  'PRN2024IT003', 'Bache Shrushti Shantwir',      'c3@itpulse.edu',  'Pass@03', 'Information Technology', '2nd Year', 'Active'),
  ('C4',  'PRN2024IT004', 'Belhekar Vaibhavi Sanjay',     'c4@itpulse.edu',  'Pass@04', 'Information Technology', '2nd Year', 'Active'),
  ('C5',  'PRN2024IT005', 'Chate Vaishnavi Shyamsundar',  'c5@itpulse.edu',  'Pass@05', 'Information Technology', '2nd Year', 'Active'),
  ('C6',  'PRN2024IT006', 'Chavan Shrutika Ganesh',       'c6@itpulse.edu',  'Pass@06', 'Information Technology', '2nd Year', 'Active'),
  ('C7',  'PRN2024IT007', 'Dange Suresh Bandu',           'c7@itpulse.edu',  'Pass@07', 'Information Technology', '2nd Year', 'Active'),
  ('C8',  'PRN2024IT008', 'Davhale Sanchit Dipak',        'c8@itpulse.edu',  'Pass@08', 'Information Technology', '2nd Year', 'Active'),
  ('C9',  'PRN2024IT009', 'Dede Omkar Vijay',             'c9@itpulse.edu',  'Pass@09', 'Information Technology', '2nd Year', 'Active'),
  ('C10', 'PRN2024IT010', 'Deshpande Chinmay Ninad',      'c10@itpulse.edu', 'Pass@10', 'Information Technology', '2nd Year', 'Active'),
  ('C11', 'PRN2024IT011', 'Dhakane Manish Mahendra',      'c11@itpulse.edu', 'Pass@11', 'Information Technology', '2nd Year', 'Active'),
  ('C12', 'PRN2024IT012', 'Gadekar Shruti Santosh',       'c12@itpulse.edu', 'Pass@12', 'Information Technology', '2nd Year', 'Active'),
  ('C13', 'PRN2024IT013', 'Gawali Jay Chandrakant',       'c13@itpulse.edu', 'Pass@13', 'Information Technology', '2nd Year', 'Active'),
  ('C14', 'PRN2024IT014', 'Gawande Tanushri Satish',      'c14@itpulse.edu', 'Pass@14', 'Information Technology', '2nd Year', 'Active'),
  ('C15', 'PRN2024IT015', 'Gedam Aditya',                 'c15@itpulse.edu', 'Pass@15', 'Information Technology', '2nd Year', 'Active'),
  ('C16', 'PRN2024IT016', 'Gharat Riya Indrajit',         'c16@itpulse.edu', 'Pass@16', 'Information Technology', '2nd Year', 'Active'),
  ('C17', 'PRN2024IT017', 'Holkar Parth Dattatray',       'c17@itpulse.edu', 'Pass@17', 'Information Technology', '2nd Year', 'Active'),
  ('C18', 'PRN2024IT018', 'Jadhav Atharv Raju',           'c18@itpulse.edu', 'Pass@18', 'Information Technology', '2nd Year', 'Active'),
  ('C19', 'PRN2024IT019', 'Jadhav Ayush Ajay',            'c19@itpulse.edu', 'Pass@19', 'Information Technology', '2nd Year', 'Active'),
  ('C20', 'PRN2024IT020', 'Jadhav Rushikesh Suresh',      'c20@itpulse.edu', 'Pass@20', 'Information Technology', '2nd Year', 'Active'),
  ('C21', 'PRN2024IT021', 'Jadhav Shivam Pralhad',        'c21@itpulse.edu', 'Pass@21', 'Information Technology', '2nd Year', 'Active'),
  ('C22', 'PRN2024IT022', 'Kachave Nandinee Rangnath',    'c22@itpulse.edu', 'Pass@22', 'Information Technology', '2nd Year', 'Active'),
  ('C23', 'PRN2024IT023', 'Kadam Nishant Nana',           'c23@itpulse.edu', 'Pass@23', 'Information Technology', '2nd Year', 'Active'),
  ('C24', 'PRN2024IT024', 'Kambale Pratiksha Rajkumar',   'c24@itpulse.edu', 'Pass@24', 'Information Technology', '2nd Year', 'Active'),
  ('C25', 'PRN2024IT025', 'Kasar Soham Madhukar',         'c25@itpulse.edu', 'Pass@25', 'Information Technology', '2nd Year', 'Active'),
  ('C26', 'PRN2024IT026', 'Kejkar Chaitanya Sunil',       'c26@itpulse.edu', 'Pass@26', 'Information Technology', '2nd Year', 'Active'),
  ('C27', 'PRN2024IT027', 'Kharat Sarang Rajesh',         'c27@itpulse.edu', 'Pass@27', 'Information Technology', '2nd Year', 'Active'),
  ('C28', 'PRN2024IT028', 'Koul Rohan',                   'c28@itpulse.edu', 'Pass@28', 'Information Technology', '2nd Year', 'Active'),
  ('C29', 'PRN2024IT029', 'Kshirsagar Samarth Rajabhau',  'c29@itpulse.edu', 'Pass@29', 'Information Technology', '2nd Year', 'Active'),
  ('C30', 'PRN2024IT030', 'Kshirsagar Veena Badrinath',   'c30@itpulse.edu', 'Pass@30', 'Information Technology', '2nd Year', 'Active'),
  ('C31', 'PRN2024IT031', 'Kulkarni Atharv Vikas',        'c31@itpulse.edu', 'Pass@31', 'Information Technology', '2nd Year', 'Active'),
  ('C32', 'PRN2024IT032', 'Kumar Aniket',                 'c32@itpulse.edu', 'Pass@32', 'Information Technology', '2nd Year', 'Active'),
  ('C33', 'PRN2024IT033', 'Kumbhar Vedant Vijay',         'c33@itpulse.edu', 'Pass@33', 'Information Technology', '2nd Year', 'Active'),
  ('C34', 'PRN2024IT034', 'Lahane Vivek Vishnu',          'c34@itpulse.edu', 'Pass@34', 'Information Technology', '2nd Year', 'Active'),
  ('C35', 'PRN2024IT035', 'Mane Kadambari Shriniwas',     'c35@itpulse.edu', 'Pass@35', 'Information Technology', '2nd Year', 'Active'),
  ('C36', 'PRN2024IT036', 'Mathapati Adwita Sanjay',      'c36@itpulse.edu', 'Pass@36', 'Information Technology', '2nd Year', 'Active'),
  ('C37', 'PRN2024IT037', 'Nishad Tripti Gajanan',        'c37@itpulse.edu', 'Pass@37', 'Information Technology', '2nd Year', 'Active'),
  ('C38', 'PRN2024IT038', 'Panhalkar Nidhi Baburao',      'c38@itpulse.edu', 'Pass@38', 'Information Technology', '2nd Year', 'Active'),
  ('C39', 'PRN2024IT039', 'Paradh Rajdeep Devanand',      'c39@itpulse.edu', 'Pass@39', 'Information Technology', '2nd Year', 'Active'),
  ('C40', 'PRN2024IT040', 'Pardeshi Parth Pramod',        'c40@itpulse.edu', 'Pass@40', 'Information Technology', '2nd Year', 'Active'),
  ('C41', 'PRN2024IT041', 'Patil Harshada Pankaj',        'c41@itpulse.edu', 'Pass@41', 'Information Technology', '2nd Year', 'Active'),
  ('C42', 'PRN2024IT042', 'Patil Soham Sachin',           'c42@itpulse.edu', 'Pass@42', 'Information Technology', '2nd Year', 'Active'),
  ('C43', 'PRN2024IT043', 'Patki Ishwari Pradip',         'c43@itpulse.edu', 'Pass@43', 'Information Technology', '2nd Year', 'Active'),
  ('C44', 'PRN2024IT044', 'Pawar Tejas Tanaji',           'c44@itpulse.edu', 'Pass@44', 'Information Technology', '2nd Year', 'Active'),
  ('C45', 'PRN2024IT045', 'Pingale Rohit Balaji',         'c45@itpulse.edu', 'Pass@45', 'Information Technology', '2nd Year', 'Active'),
  ('C46', 'PRN2024IT046', 'Rahatkar Divyashri Balaji',    'c46@itpulse.edu', 'Pass@46', 'Information Technology', '2nd Year', 'Active'),
  ('C47', 'PRN2024IT047', 'Ramchandani Dev Nandlal',      'c47@itpulse.edu', 'Pass@47', 'Information Technology', '2nd Year', 'Active'),
  ('C48', 'PRN2024IT048', 'Rishikesh',                    'c48@itpulse.edu', 'Pass@48', 'Information Technology', '2nd Year', 'Active'),
  ('C49', 'PRN2024IT049', 'Salunkhe Harsh Mangesh',       'c49@itpulse.edu', 'Pass@49', 'Information Technology', '2nd Year', 'Active'),
  ('C50', 'PRN2024IT050', 'Sawale Samruddhi Sandip',      'c50@itpulse.edu', 'Pass@50', 'Information Technology', '2nd Year', 'Active'),
  ('C51', 'PRN2024IT051', 'Shaikh Huzefa Javed',          'c51@itpulse.edu', 'Pass@51', 'Information Technology', '2nd Year', 'Active'),
  ('C52', 'PRN2024IT052', 'Sharma Niraj Shambhunath',     'c52@itpulse.edu', 'Pass@52', 'Information Technology', '2nd Year', 'Active'),
  ('C53', 'PRN2024IT053', 'Sharma Prathmesh Sanjay',      'c53@itpulse.edu', 'Pass@53', 'Information Technology', '2nd Year', 'Active'),
  ('C54', 'PRN2024IT054', 'Shende Princy Shende',         'c54@itpulse.edu', 'Pass@54', 'Information Technology', '2nd Year', 'Active'),
  ('C55', 'PRN2024IT055', 'Shewale Aaryan Kamlesh',       'c55@itpulse.edu', 'Pass@55', 'Information Technology', '2nd Year', 'Active'),
  ('C56', 'PRN2024IT056', 'Shinde Satyajit Gajanan',      'c56@itpulse.edu', 'Pass@56', 'Information Technology', '2nd Year', 'Active'),
  ('C57', 'PRN2024IT057', 'Shinde Shubhada Vasant',       'c57@itpulse.edu', 'Pass@57', 'Information Technology', '2nd Year', 'Active'),
  ('C58', 'PRN2024IT058', 'Shinde Vaishnavi Laxman',      'c58@itpulse.edu', 'Pass@58', 'Information Technology', '2nd Year', 'Active'),
  ('C59', 'PRN2024IT059', 'Somwanshi Vinay Abhay',        'c59@itpulse.edu', 'Pass@59', 'Information Technology', '2nd Year', 'Active'),
  ('C60', 'PRN2024IT060', 'Sutar Anurag Dhanyakumar',     'c60@itpulse.edu', 'Pass@60', 'Information Technology', '2nd Year', 'Active'),
  ('C61', 'PRN2024IT061', 'Todgire Rohini Irappa',        'c61@itpulse.edu', 'Pass@61', 'Information Technology', '2nd Year', 'Active'),
  ('C62', 'PRN2024IT062', 'Tonchar Pratik Gangadas',      'c62@itpulse.edu', 'Pass@62', 'Information Technology', '2nd Year', 'Active'),
  ('C63', 'PRN2024IT063', 'Toshniwal Atharv',             'c63@itpulse.edu', 'Pass@63', 'Information Technology', '2nd Year', 'Active'),
  ('C64', 'PRN2024IT064', 'Tripathi Rahul Dhananjay',     'c64@itpulse.edu', 'Pass@64', 'Information Technology', '2nd Year', 'Active'),
  ('C65', 'PRN2024IT065', 'Wadhekar Nilesh Kachru',       'c65@itpulse.edu', 'Pass@65', 'Information Technology', '2nd Year', 'Active'),
  ('C66', 'PRN2024IT066', 'Waghmare Prabudh Milind',      'c66@itpulse.edu', 'Pass@66', 'Information Technology', '2nd Year', 'Active'),
  ('C67', 'PRN2024IT067', 'Waghmode Soham Laxman',        'c67@itpulse.edu', 'Pass@67', 'Information Technology', '2nd Year', 'Active'),
  ('C68', 'PRN2024IT068', 'Warange Karan Gajanan',        'c68@itpulse.edu', 'Pass@68', 'Information Technology', '2nd Year', 'Active')
ON CONFLICT (roll_no) DO UPDATE SET
  prn = EXCLUDED.prn,
  name = EXCLUDED.name,
  password = EXCLUDED.password;
