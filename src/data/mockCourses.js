import salesImg from "../assets/images/sales_fundamentals.png";
import customerImg from "../assets/images/customer_service_pro.png";
import digitalImg from "../assets/images/digital_marketing.png";
import technicalImg from "../assets/images/technical_onboarding.png";

export const COURSES = [
  {
    id: 1,
    name: "Sales Fundamentals",
    modulesCount: 5,
    unitsCount: 18,
    assessmentsCount: 5,
    status: "Ongoing",
    progress: 94,
    assignedBy: "Admin",
    icon: "💼",
    thumbnail: salesImg,
    lastModule: "Module 5 · Unit 3: The AIDA Framework",
    modules: [
      {
        id: 1,
        name: "Understanding the Modern Buyer",
        unitsCount: 4,
        status: "completed",
        progressText: "Done 100%",
        units: [
          { id: 1, type: "video", title: "Video: Buyer Psychology", status: "completed" },
          { id: 2, type: "reading", title: "Reading: Market Analysis", status: "completed" },
          { id: 3, type: "reading", title: "Reading: Identifying Pain Points", status: "completed" },
          { id: 4, type: "assessment", title: "Assessment: Module 1 Quiz", status: "completed" }
        ]
      },
      {
        id: 2,
        name: "Building Your Sales",
        unitsCount: 4,
        status: "in-progress",
        progressText: "In Progress · 2/4 Done",
        units: [
          { id: 1, type: "video", title: "Intro: Perfect Pitch", status: "completed" },
          { id: 2, type: "reading", title: "Reading: Spin Selling Framework", status: "completed" },
          { id: 3, type: "video", title: "Video: The AIDA Framework", status: "open" },
          { id: 4, type: "assessment", title: "Assessment: Module 2 Quiz", status: "locked" }
        ]
      },
      {
        id: 3,
        name: "Handling Objections",
        unitsCount: 4,
        status: "locked",
        progressText: "Locked",
        units: []
      },
      {
        id: 4,
        name: "Post-Sale & Client Retention",
        unitsCount: 4,
        status: "locked",
        progressText: "Locked",
        units: []
      }
    ]
  },
  {
    id: 2,
    name: "Customer Service Pro",
    modulesCount: 4,
    unitsCount: 12,
    assessmentsCount: 2,
    status: "Ongoing",
    progress: 54,
    assignedBy: "Admin",
    icon: "👤",
    thumbnail: customerImg,
    lastModule: "Module 3 · Unit 2: Handling Complaints",
    modules: []
  },
  {
    id: 3,
    name: "Digital Marketing",
    modulesCount: 4,
    unitsCount: 11,
    assessmentsCount: 4,
    status: "Completed",
    progress: 100,
    assignedBy: "Admin",
    icon: "📢",
    thumbnail: digitalImg,
    lastModule: "Module 4 · Unit 11: Campaign Analytics",
    modules: [
      {
        id: 1,
        name: "SEO Fundamentals",
        unitsCount: 3,
        status: "completed",
        progressText: "Done 100%",
        units: [
          { id: 1, type: "video", title: "Video: How Search Engines Work", status: "completed" },
          { id: 2, type: "reading", title: "Reading: Keyword Research Basics", status: "completed" },
          { id: 3, type: "assessment", title: "Assessment: SEO Quiz", status: "completed" }
        ]
      },
      {
        id: 2,
        name: "Content Marketing",
        unitsCount: 3,
        status: "completed",
        progressText: "Done 100%",
        units: [
          { id: 1, type: "video", title: "Video: The Content Funnel", status: "completed" },
          { id: 2, type: "reading", title: "Reading: Crafting Engaging Copy", status: "completed" },
          { id: 3, type: "assessment", title: "Assessment: Content Quiz", status: "completed" }
        ]
      },
      {
        id: 3,
        name: "Social Media Strategy",
        unitsCount: 2,
        status: "completed",
        progressText: "Done 100%",
        units: [
          { id: 1, type: "video", title: "Video: Choosing the Right Platforms", status: "completed" },
          { id: 2, type: "reading", title: "Reading: Community Management", status: "completed" }
        ]
      },
      {
        id: 4,
        name: "Campaign Analytics",
        unitsCount: 3,
        status: "completed",
        progressText: "Done 100%",
        units: [
          { id: 1, type: "video", title: "Video: Understanding Key Metrics", status: "completed" },
          { id: 2, type: "reading", title: "Reading: Google Analytics Basics", status: "completed" },
          { id: 3, type: "assessment", title: "Assessment: Final Exam", status: "completed" }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Technical Onboarding",
    modulesCount: 6,
    unitsCount: 22,
    assessmentsCount: 3,
    status: "Not Started",
    progress: 0,
    assignedBy: "Admin",
    icon: "⚙️",
    thumbnail: technicalImg,
    lastModule: null,
    modules: []
  },
];

export const MOCK_COMPANIES_COURSES = [
  { id: 0, name: "All Companies / SPARK" },
  { id: 1, name: "Department of Education" },
  { id: 2, name: "Eleksis Marketing Corp" },
  { id: 3, name: "De La Salle University" },
  { id: 4, name: "Zoup Sales & Marketing" },
  { id: 5, name: "Build Hub PH" },
];

export const MOCK_COURSES = [
  {
    id: 1,
    title: "Sales Fundamentals",
    companyId: 0,
    companyName: "SPARK",
    status: "active",
    modules: 5,
    units: 18,
    enrolled: 42,
    avgCompletion: 86,
    createdBy: "Spark Admin",
    thumbColor: "#e8c9a0",
    description: "Master modern enterprise sales cycles, objection handling, and conversion frameworks.",
    enrolledUsers: [
      { id: "u-1", name: "Maria Santos", email: "maria@deped.gov.ph", role: "Learner", progress: 95 },
      { id: "u-2", name: "John Doe", email: "john@eleksis.com", role: "Learner", progress: 70 },
    ],
  },
  {
    id: 2,
    title: "Customer Service Pro",
    companyId: 2,
    companyName: "Eleksis Marketing Corp",
    status: "active",
    modules: 4,
    units: 12,
    enrolled: 28,
    avgCompletion: 64,
    createdBy: "Eleksis Creator",
    thumbColor: "#a0c4e8",
    description: "Deliver world-class omnichannel customer care, dispute mediation, and retention.",
    enrolledUsers: [],
  },
  {
    id: 3,
    title: "Digital Marketing Mastery",
    companyId: 3,
    companyName: "De La Salle University",
    status: "active",
    modules: 6,
    units: 24,
    enrolled: 65,
    avgCompletion: 92,
    createdBy: "DLSU Author",
    thumbColor: "#a0e8c4",
    description: "Search engine optimization, programmatic ads, content marketing, and attribution analytics.",
    enrolledUsers: [],
  },
  {
    id: 4,
    title: "Advanced React & Architecture",
    companyId: 0,
    companyName: "SPARK",
    status: "pending",
    modules: 4,
    units: 14,
    enrolled: 0,
    avgCompletion: 0,
    createdBy: "Lead Instructor",
    thumbColor: "#d2a0e8",
    description: "Production architectural blueprints, design patterns, SSR, and state machines.",
    enrolledUsers: [],
  },
  {
    id: 5,
    title: "Technical Onboarding & Compliance",
    companyId: 1,
    companyName: "Department of Education",
    status: "pending",
    modules: 3,
    units: 9,
    enrolled: 0,
    avgCompletion: 0,
    createdBy: "DepEd Admin",
    thumbColor: "#e8a0a0",
    description: "Government IT regulations, compliance protocols, and data security mandates.",
    enrolledUsers: [],
  },
];

export const MOCK_ALL_ASSIGNABLE_USERS = [
  { id: "u-1", name: "Maria Santos", email: "maria@deped.gov.ph", department: "Curriculum Division", companyId: 1 },
  { id: "u-2", name: "John Doe", email: "john@eleksis.com", department: "Sales Operations", companyId: 2 },
  { id: "u-3", name: "Ana Reyes", email: "ana@dlsu.edu.ph", department: "Faculty of Tech", companyId: 3 },
  { id: "u-4", name: "Carlos Mendoza", email: "carlos@zoup.com", department: "Marketing", companyId: 4 },
  { id: "u-5", name: "Patricia Lim", email: "patricia@buildhub.ph", department: "Engineering", companyId: 5 },
];
