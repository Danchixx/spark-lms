// src/data/mockUsers.js
// All users across all tenant companies — used by the Users management page.
// Status: Active | Pending | Suspended | Banned | Rejected

export const MOCK_ALL_USERS = [
  // ── De La Salle University ──────────────────────────────────
  {
    id: 1, company: "De La Salle University", companyId: 1, companyColor: "#27ae60", companyAbbr: "DLSU",
    name: "Ian Emmanuel B. Palabrica", email: "ianemmanuel.b.p@dlsu.edu.ph",
    username: "ianemmanuel", password: "Pass1234",
    lastName: "Palabrica", firstName: "Ian Emmanuel", middleName: "B.",
    employeeId: "22-1001", dateOfBirth: "March 15, 1999", jobTitle: "Software Engineer",
    gender: "Male", department: "Engineering", phone: "0912 345 6789",
    status: "Active", approvedOn: "Jan 05 2026", createdOn: "Jan 02 2026",
    assignedCourses: ["Effective Communication Skills", "Problem Solving and Critical Thinking", "Leadership Fundamentals"],
  },
  {
    id: 2, company: "De La Salle University", companyId: 1, companyColor: "#27ae60", companyAbbr: "DLSU",
    name: "Daryl R. Dixon", email: "daryldixon@gmail.com",
    username: "daryldixon", password: "TWD_Goat",
    lastName: "Dixon", firstName: "Daryl", middleName: "Rudeus",
    employeeId: "22-1111", dateOfBirth: "November 2, 1997", jobTitle: "Technician",
    gender: "Male", department: "Technical", phone: "0912 345 6789",
    status: "Active", approvedOn: "Jan 05 2026", createdOn: "Jan 02 2026",
    assignedCourses: ["Sales Fundamentals", "Digital Marketing"],
  },
  {
    id: 3, company: "De La Salle University", companyId: 1, companyColor: "#27ae60", companyAbbr: "DLSU",
    name: "Maverick Danielle P. Andres", email: "maverick.danielle.r.p@dlsu.edu.ph",
    username: "maverick.andres", password: "Maverick@123",
    lastName: "Andres", firstName: "Maverick Danielle", middleName: "P.",
    employeeId: "22-1002", dateOfBirth: "June 10, 2000", jobTitle: "QA Engineer",
    gender: "Male", department: "Engineering", phone: "0917 111 2222",
    status: "Pending", approvedOn: null, createdOn: "Jan 02 2026",
    assignedCourses: ["Technical Onboarding"],
  },
  {
    id: 4, company: "De La Salle University", companyId: 1, companyColor: "#27ae60", companyAbbr: "DLSU",
    name: "Janica Annya Q. Chiu", email: "janica.annya.q.p@dlsu.edu.ph",
    username: "janica.chiu", password: "Janica@456",
    lastName: "Chiu", firstName: "Janica Annya", middleName: "Q.",
    employeeId: "22-1003", dateOfBirth: "April 5, 2001", jobTitle: "HR Associate",
    gender: "Female", department: "HR", phone: "0918 222 3333",
    status: "Suspended", approvedOn: "Jan 06 2026", createdOn: "Jan 02 2026",
    suspendReason: "Suspicious login activity detected.",
    assignedCourses: ["Customer Service Pro"],
  },
  {
    id: 5, company: "De La Salle University", companyId: 1, companyColor: "#27ae60", companyAbbr: "DLSU",
    name: "Chris Brown", email: "chrisbrown.at.p.p@dlsu.edu.ph",
    username: "chrisbrown", password: "Chris@789",
    lastName: "Brown", firstName: "Chris", middleName: "",
    employeeId: "22-1004", dateOfBirth: "January 1, 1998", jobTitle: "Marketing Lead",
    gender: "Male", department: "Marketing", phone: "0919 333 4444",
    status: "Banned", approvedOn: "Jan 06 2026", createdOn: "Jan 02 2026",
    banReason: "Confirmed fake employee account.",
    assignedCourses: ["Digital Marketing", "Sales Fundamentals"],
  },

  // ── Department of Education ─────────────────────────────────
  {
    id: 6, company: "Department of Education", companyId: 2, companyColor: "#2980b9", companyAbbr: "DepEd",
    name: "Maria L. Santos", email: "maria.santos@deped.gov.ph",
    username: "maria.santos", password: "Maria@123",
    lastName: "Santos", firstName: "Maria", middleName: "L.",
    employeeId: "23-0001", dateOfBirth: "May 20, 1995", jobTitle: "Teacher",
    gender: "Female", department: "HR", phone: "0920 444 5555",
    status: "Active", approvedOn: "Jan 08 2026", createdOn: "Jan 05 2026",
    assignedCourses: ["Customer Service Pro", "Workplace Professionalism"],
  },

  // ── Eleksis Marketing Corp ──────────────────────────────────
  {
    id: 7, company: "Eleksis Marketing Corp", companyId: 3, companyColor: "#c0392b", companyAbbr: "ELEKSIS",
    name: "Carlos M. Reyes", email: "carlos.reyes@eleksis.com",
    username: "carlos.reyes", password: "Carlos@321",
    lastName: "Reyes", firstName: "Carlos", middleName: "M.",
    employeeId: "24-0001", dateOfBirth: "August 14, 1993", jobTitle: "Marketing Specialist",
    gender: "Male", department: "Marketing", phone: "0921 555 6666",
    status: "Active", approvedOn: "Jan 13 2026", createdOn: "Jan 10 2026",
    assignedCourses: ["Digital Marketing", "Team Collaboration and Dynamics"],
  },
  {
    id: 8, company: "Eleksis Marketing Corp", companyId: 3, companyColor: "#c0392b", companyAbbr: "ELEKSIS",
    name: "Ana R. Dela Cruz", email: "ana.delacruz@eleksis.com",
    username: "ana.delacruz", password: "Ana@654",
    lastName: "Dela Cruz", firstName: "Ana", middleName: "R.",
    employeeId: "24-0002", dateOfBirth: "February 28, 1996", jobTitle: "Content Creator",
    gender: "Female", department: "Marketing", phone: "0922 666 7777",
    status: "Pending", approvedOn: null, createdOn: "Jan 11 2026",
    assignedCourses: ["Digital Marketing", "Sales Fundamentals"],
  },

  // ── Build Hub PH ────────────────────────────────────────────
  {
    id: 9, company: "Build Hub PH", companyId: 4, companyColor: "#e67e22", companyAbbr: "BHUB",
    name: "Robert C. Lim", email: "robert.lim@buildhub.ph",
    username: "robert.lim", password: "Robert@987",
    lastName: "Lim", firstName: "Robert", middleName: "C.",
    employeeId: "25-0001", dateOfBirth: "September 3, 1990", jobTitle: "Civil Engineer",
    gender: "Male", department: "Engineering", phone: "0923 777 8888",
    status: "Active", approvedOn: "Jan 15 2026", createdOn: "Jan 12 2026",
    assignedCourses: ["Technical Onboarding", "Problem Solving and Critical Thinking"],
  },

  // ── Zoup Corporation ────────────────────────────────────────
  {
    id: 10, company: "Zoup Corporation", companyId: 5, companyColor: "#8e44ad", companyAbbr: "ZOUP",
    name: "Jenny F. Garcia", email: "jenny.garcia@zoup.com",
    username: "jenny.garcia", password: "Jenny@111",
    lastName: "Garcia", firstName: "Jenny", middleName: "F.",
    employeeId: "26-0001", dateOfBirth: "December 12, 1994", jobTitle: "Sales Associate",
    gender: "Female", department: "HR", phone: "0924 888 9999",
    status: "Active", approvedOn: "Jan 18 2026", createdOn: "Jan 15 2026",
    assignedCourses: ["Sales Fundamentals", "Effective Communication Skills"],
  },

  // ── Sunlight Air ────────────────────────────────────────────
  {
    id: 11, company: "Sunlight Air", companyId: 6, companyColor: "#f39c12", companyAbbr: "SUN",
    name: "Mark A. Torres", email: "mark.torres@sunlightair.com",
    username: "mark.torres", password: "Mark@123",
    lastName: "Torres", firstName: "Mark", middleName: "A.",
    employeeId: "27-0001", dateOfBirth: "Jan 16, 1995", jobTitle: "Flight Attendant",
    gender: "Male", department: "HR", phone: "0925 000 1111",
    status: "Active", approvedOn: "Jan 20 2026", createdOn: "Jan 16 2026",
    assignedCourses: ["Customer Service Pro", "Workplace Professionalism"],
  },
  {
    id: 12, company: "Sunlight Air", companyId: 6, companyColor: "#f39c12", companyAbbr: "SUN",
    name: "Lisa B. Ramos", email: "lisa.ramos@sunlightair.com",
    username: "lisa.ramos", password: "Lisa@456",
    lastName: "Ramos", firstName: "Lisa", middleName: "B.",
    employeeId: "27-0002", dateOfBirth: "Feb 20, 1993", jobTitle: "Engineer",
    gender: "Female", department: "Engineering", phone: "0926 111 2222",
    status: "Suspended", approvedOn: "Jan 20 2026", createdOn: "Jan 17 2026",
    suspendReason: "Account under review for policy violation.",
    assignedCourses: ["Technical Onboarding"],
  },
  {
    id: 13, company: "Sunlight Air", companyId: 6, companyColor: "#f39c12", companyAbbr: "SUN",
    name: "Paul C. Mendoza", email: "paul.mendoza@sunlightair.com",
    username: "paul.mendoza", password: "Paul@789",
    lastName: "Mendoza", firstName: "Paul", middleName: "C.",
    employeeId: "27-0003", dateOfBirth: "Mar 14, 1991", jobTitle: "Marketing Lead",
    gender: "Male", department: "Marketing", phone: "0927 222 3333",
    status: "Active", approvedOn: "Jan 21 2026", createdOn: "Jan 18 2026",
    assignedCourses: ["Digital Marketing", "Leadership Fundamentals"],
  },
  {
    id: 14, company: "Sunlight Air", companyId: 6, companyColor: "#f39c12", companyAbbr: "SUN",
    name: "Nina D. Aquino", email: "nina.aquino@sunlightair.com",
    username: "nina.aquino", password: "Nina@321",
    lastName: "Aquino", firstName: "Nina", middleName: "D.",
    employeeId: "27-0004", dateOfBirth: "Apr 10, 1997", jobTitle: "HR Officer",
    gender: "Female", department: "HR", phone: "0928 333 4444",
    status: "Active", approvedOn: "Jan 22 2026", createdOn: "Jan 19 2026",
    assignedCourses: ["Customer Service Pro"],
  },
  {
    id: 15, company: "Sunlight Air", companyId: 6, companyColor: "#f39c12", companyAbbr: "SUN",
    name: "Felix E. Cruz", email: "felix.cruz@sunlightair.com",
    username: "felix.cruz", password: "Felix@654",
    lastName: "Cruz", firstName: "Felix", middleName: "E.",
    employeeId: "27-0005", dateOfBirth: "May 5, 1992", jobTitle: "Technician",
    gender: "Male", department: "Engineering", phone: "0929 444 5555",
    status: "Rejected", approvedOn: null, createdOn: "Jan 20 2026",
    assignedCourses: ["Technical Onboarding"],
  },
];

export const COMPANIES_LIST = [
  { id: 1, name: "De La Salle University",  abbr: "DLSU",    color: "#27ae60" },
  { id: 2, name: "Department of Education", abbr: "DepEd",   color: "#2980b9" },
  { id: 3, name: "Eleksis Marketing Corp",  abbr: "ELEKSIS", color: "#c0392b" },
  { id: 4, name: "Build Hub PH",            abbr: "BHUB",    color: "#e67e22" },
  { id: 5, name: "Zoup Corporation",        abbr: "ZOUP",    color: "#8e44ad" },
  { id: 6, name: "Sunlight Air",            abbr: "SUN",     color: "#f39c12" },
];

export const DEPARTMENTS_LIST = [
  "Engineering", "Marketing", "HR", "Technical", "Finance", "Operations",
];
