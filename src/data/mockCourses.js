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
    lastModule: null,
    modules: []
  },
];
