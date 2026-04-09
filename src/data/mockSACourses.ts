// src/data/mockCourses.ts
// SuperAdmin course data — used by SparkCourses, CourseDetail, and AssignUsersModal.
// MOCK_COURSES, MOCK_COMPANIES_COURSES, MOCK_ENROLLED_USERS, MOCK_ALL_ASSIGNABLE_USERS

// ── Types ─────────────────────────────────────────────────────
export interface MockCourse {
  id: number;
  title: string;
  description: string;
  status: "active" | "pending";
  companyId: number;
  modules: number;
  units: number;
  enrolled: number;
  avgCompletion: number;
  createdBy: string;
  publishedAt: string;
  thumbColor: string;
}

export interface MockCompanyCourse {
  id: number;
  name: string;
}

export interface EnrolledUser {
  id: number;
  name: string;
  email: string;
  company: string;
  companyId: number;
  department: string;
  progress: number;
  assignedAt: string;
}

export interface AssignableUser {
  id: number;
  name: string;
  email: string;
  company: string;
  companyId: number;
  department: string;
}

// ── Company filter list ────────────────────────────────────────
export const MOCK_COMPANIES_COURSES: MockCompanyCourse[] = [
  { id: 0,  name: "SPARK"                    },
  { id: 1,  name: "De La Salle University"   },
  { id: 2,  name: "Department of Education"  },
  { id: 3,  name: "Eleksis Marketing Corp"   },
  { id: 4,  name: "Build Hub PH"             },
  { id: 5,  name: "Zoup Corporation"         },
  { id: 6,  name: "Sunlight Air"             },
];

// ── Course catalogue ──────────────────────────────────────────
export const MOCK_COURSES: MockCourse[] = [
  {
    id: 1,
    title: "Sales Fundamentals",
    description: "Master the art of selling — understanding buyer psychology, building a pitch, handling objections, and retaining clients.",
    status: "active",
    companyId: 0,
    modules: 4,
    units: 18,
    enrolled: 42,
    avgCompletion: 68,
    createdBy: "Spark Admin",
    publishedAt: "Jan 01 2026",
    thumbColor: "#e8c9a0",
  },
  {
    id: 2,
    title: "Customer Service Pro",
    description: "Build world-class customer service skills — empathy, communication, complaint handling, and satisfaction measurement.",
    status: "active",
    companyId: 0,
    modules: 4,
    units: 12,
    enrolled: 38,
    avgCompletion: 54,
    createdBy: "Spark Admin",
    publishedAt: "Jan 05 2026",
    thumbColor: "#a0c8e8",
  },
  {
    id: 3,
    title: "Digital Marketing",
    description: "From SEO to social media strategy — learn how to grow brand presence and drive conversions in the digital landscape.",
    status: "active",
    companyId: 0,
    modules: 4,
    units: 11,
    enrolled: 55,
    avgCompletion: 82,
    createdBy: "Spark Admin",
    publishedAt: "Dec 15 2025",
    thumbColor: "#c8a0e8",
  },
  {
    id: 4,
    title: "Technical Onboarding",
    description: "Get new technical hires up to speed — systems overview, tools, processes, and hands-on exercises.",
    status: "active",
    companyId: 0,
    modules: 6,
    units: 22,
    enrolled: 20,
    avgCompletion: 30,
    createdBy: "Spark Admin",
    publishedAt: "Feb 01 2026",
    thumbColor: "#a0e8c8",
  },
  {
    id: 5,
    title: "Leadership Fundamentals",
    description: "Develop essential leadership skills — decision-making, delegation, conflict resolution, and team motivation.",
    status: "pending",
    companyId: 1,
    modules: 5,
    units: 15,
    enrolled: 0,
    avgCompletion: 0,
    createdBy: "DLSU Admin",
    publishedAt: "—",
    thumbColor: "#e8a0a0",
  },
  {
    id: 6,
    title: "Workplace Professionalism",
    description: "Workplace etiquette, time management, email communication, and building a professional reputation.",
    status: "pending",
    companyId: 2,
    modules: 3,
    units: 9,
    enrolled: 0,
    avgCompletion: 0,
    createdBy: "DepEd Admin",
    publishedAt: "—",
    thumbColor: "#e8e0a0",
  },
];

// ── Enrolled users per course ─────────────────────────────────
export const MOCK_ENROLLED_USERS: Record<number, EnrolledUser[]> = {
  1: [
    { id: 1,  name: "Ian Emmanuel B. Palabrica", email: "ianemmanuel.b.p@dlsu.edu.ph",    company: "De La Salle University",  companyId: 1, department: "Engineering", progress: 100, assignedAt: "Jan 05 2026" },
    { id: 2,  name: "Daryl R. Dixon",            email: "daryldixon@gmail.com",            company: "De La Salle University",  companyId: 1, department: "Technical",   progress: 72,  assignedAt: "Jan 05 2026" },
    { id: 5,  name: "Chris Brown",               email: "chrisbrown.at.p.p@dlsu.edu.ph",  company: "De La Salle University",  companyId: 1, department: "Marketing",   progress: 45,  assignedAt: "Jan 06 2026" },
    { id: 10, name: "Jenny F. Garcia",           email: "jenny.garcia@zoup.com",           company: "Zoup Corporation",        companyId: 5, department: "HR",          progress: 88,  assignedAt: "Jan 18 2026" },
    { id: 13, name: "Paul C. Mendoza",           email: "paul.mendoza@sunlightair.com",    company: "Sunlight Air",            companyId: 6, department: "Marketing",   progress: 30,  assignedAt: "Jan 21 2026" },
  ],
  2: [
    { id: 4,  name: "Janica Annya Q. Chiu",      email: "janica.annya.q.p@dlsu.edu.ph",   company: "De La Salle University",  companyId: 1, department: "HR",          progress: 60,  assignedAt: "Jan 06 2026" },
    { id: 6,  name: "Maria L. Santos",           email: "maria.santos@deped.gov.ph",       company: "Department of Education", companyId: 2, department: "HR",          progress: 100, assignedAt: "Jan 08 2026" },
    { id: 11, name: "Mark A. Torres",            email: "mark.torres@sunlightair.com",     company: "Sunlight Air",            companyId: 6, department: "HR",          progress: 50,  assignedAt: "Jan 20 2026" },
    { id: 14, name: "Nina D. Aquino",            email: "nina.aquino@sunlightair.com",     company: "Sunlight Air",            companyId: 6, department: "HR",          progress: 75,  assignedAt: "Jan 22 2026" },
  ],
  3: [
    { id: 2,  name: "Daryl R. Dixon",            email: "daryldixon@gmail.com",            company: "De La Salle University",  companyId: 1, department: "Technical",   progress: 100, assignedAt: "Jan 05 2026" },
    { id: 5,  name: "Chris Brown",               email: "chrisbrown.at.p.p@dlsu.edu.ph",  company: "De La Salle University",  companyId: 1, department: "Marketing",   progress: 100, assignedAt: "Jan 06 2026" },
    { id: 7,  name: "Carlos M. Reyes",           email: "carlos.reyes@eleksis.com",        company: "Eleksis Marketing Corp",  companyId: 3, department: "Marketing",   progress: 90,  assignedAt: "Jan 13 2026" },
    { id: 8,  name: "Ana R. Dela Cruz",          email: "ana.delacruz@eleksis.com",        company: "Eleksis Marketing Corp",  companyId: 3, department: "Marketing",   progress: 65,  assignedAt: "Jan 13 2026" },
    { id: 13, name: "Paul C. Mendoza",           email: "paul.mendoza@sunlightair.com",    company: "Sunlight Air",            companyId: 6, department: "Marketing",   progress: 100, assignedAt: "Jan 21 2026" },
  ],
  4: [
    { id: 1,  name: "Ian Emmanuel B. Palabrica", email: "ianemmanuel.b.p@dlsu.edu.ph",    company: "De La Salle University",  companyId: 1, department: "Engineering", progress: 20,  assignedAt: "Jan 05 2026" },
    { id: 9,  name: "Robert C. Lim",             email: "robert.lim@buildhub.ph",          company: "Build Hub PH",            companyId: 4, department: "Engineering", progress: 0,   assignedAt: "Jan 15 2026" },
    { id: 12, name: "Lisa B. Ramos",             email: "lisa.ramos@sunlightair.com",      company: "Sunlight Air",            companyId: 6, department: "Engineering", progress: 55,  assignedAt: "Jan 20 2026" },
    { id: 15, name: "Felix E. Cruz",             email: "felix.cruz@sunlightair.com",      company: "Sunlight Air",            companyId: 6, department: "Engineering", progress: 0,   assignedAt: "Jan 20 2026" },
  ],
  5: [],
  6: [],
};

// ── Assignable (approved, active) users for AssignUsersModal ──
export const MOCK_ALL_ASSIGNABLE_USERS: AssignableUser[] = [
  { id: 1,  name: "Ian Emmanuel B. Palabrica", email: "ianemmanuel.b.p@dlsu.edu.ph",    company: "De La Salle University",  companyId: 1, department: "Engineering" },
  { id: 2,  name: "Daryl R. Dixon",            email: "daryldixon@gmail.com",            company: "De La Salle University",  companyId: 1, department: "Technical"   },
  { id: 5,  name: "Chris Brown",               email: "chrisbrown.at.p.p@dlsu.edu.ph",  company: "De La Salle University",  companyId: 1, department: "Marketing"   },
  { id: 6,  name: "Maria L. Santos",           email: "maria.santos@deped.gov.ph",       company: "Department of Education", companyId: 2, department: "HR"          },
  { id: 7,  name: "Carlos M. Reyes",           email: "carlos.reyes@eleksis.com",        company: "Eleksis Marketing Corp",  companyId: 3, department: "Marketing"   },
  { id: 8,  name: "Ana R. Dela Cruz",          email: "ana.delacruz@eleksis.com",        company: "Eleksis Marketing Corp",  companyId: 3, department: "Marketing"   },
  { id: 9,  name: "Robert C. Lim",             email: "robert.lim@buildhub.ph",          company: "Build Hub PH",            companyId: 4, department: "Engineering" },
  { id: 10, name: "Jenny F. Garcia",           email: "jenny.garcia@zoup.com",           company: "Zoup Corporation",        companyId: 5, department: "HR"          },
  { id: 11, name: "Mark A. Torres",            email: "mark.torres@sunlightair.com",     company: "Sunlight Air",            companyId: 6, department: "HR"          },
  { id: 12, name: "Lisa B. Ramos",             email: "lisa.ramos@sunlightair.com",      company: "Sunlight Air",            companyId: 6, department: "Engineering" },
  { id: 13, name: "Paul C. Mendoza",           email: "paul.mendoza@sunlightair.com",    company: "Sunlight Air",            companyId: 6, department: "Marketing"   },
  { id: 14, name: "Nina D. Aquino",            email: "nina.aquino@sunlightair.com",     company: "Sunlight Air",            companyId: 6, department: "HR"          },
];
