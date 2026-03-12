import eleksisLogo from "./eleksis.png";
import zoupLogo from "./zoup.png";
import buildHubLogo from "./buildhub.png";
import nexusLogo from "./nexus.png";

export const COMPANIES = [
  { id: 1, name: "ELEKSIS",     industry: "Marketing Corporation",    members: 20, logo: eleksisLogo,  color: "#c0392b" },
  { id: 2, name: "ZOUP",        industry: "Sales and Marketing",       members: 32, logo: zoupLogo,    color: "#2980b9" },
  { id: 3, name: "BUILD HUB PH",industry: "Construction Marketplace",  members: 32, logo: buildHubLogo,color: "#c0392b" },
  { id: 4, name: "NEXUS CORP",  industry: "Technology Solutions",      members: 18, logo: nexusLogo,   color: "#8e44ad" },
];

export const MOCK_USERS = {
  "danchi@zoup.com":    { password: "pass123", company: 2, name: "Danchi D." },
  "admin@zoup.com":  { password: "admin123",    company: 1, name: "Admin E." },
};

export const RECENT_COURSES = [
  { name: "Sales Fundamentals",   status: "Completed",  progress: 100, remark: "Passed" },
  { name: "Customer Service Pro", status: "Ongoing",    progress: 78,  remark: "—" },
  { name: "Technical Onboarding", status: "Ongoing",    progress: 92,  remark: "—" },
  { name: "Digital Marketing",    status: "Not Started",progress: 0,   remark: "—" },
];

export const PENDING_ASSESSMENTS = [
  { name: "Pillars of Customer Service" },
  { name: "Intro to Onboarding" },
];

export const RECENT_ACTIVITY = [
  { text: 'You completed "Sales Fundamentals"',       time: "2 mins ago" },
  { text: "You completed an assessment",              time: "14 mins ago" },
  { text: 'Certificate earned from "Basic Sales"',   time: "1 hr ago" },
  { text: "Admin enrolled you to a new course",      time: "2 hrs ago" },
  { text: "Ian Palabrica has been banned",           time: "1 day ago" },
];