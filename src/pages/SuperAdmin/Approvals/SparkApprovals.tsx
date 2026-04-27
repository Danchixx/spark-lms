// src/pages/SuperAdmin/Approvals/SparkApprovals.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import ApprovalCompanies from "./components/ApprovalCompanies";
import ApprovalUsers from "./components/ApprovalUsers";
import PageTransition from "../../../components/common/PageTransition/PageTransition";

export interface ApprovalCompany {
  id: number;
  name: string;
  abbr: string;
  color: string;
  totalUsers: number;
  pendingCount: number;
  logo_url?: string;
}

export interface ApprovalUser {
  id: string;
  name: string;
  email?: string;
  username?: string;
  password?: string;
  status: string;
  createdOn?: string;
  approvedOn?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  employeeId?: string;
  dateOfBirth?: string;
  jobTitle?: string;
  gender?: string;
  department?: string;
  phone?: string;
  assignedCourses?: string[];
  deactivationReason?: string | null;
}

const COLORS = ["#FF6B00", "#e74c3c", "#8e44ad", "#2980b9", "#27ae60", "#f39c12", "#d35400"];

const getAbbr = (name: string) => name.substring(0, 2).toUpperCase();
const getColor = (id: number) => COLORS[id % COLORS.length];

const SparkApprovals = () => {
  const [companies, setCompanies] = useState<ApprovalCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<ApprovalCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("company_approval_stats")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching companies:", error);
    } else if (data) {
      const formattedCompanies: ApprovalCompany[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        logo_url: c.logo_url,
        abbr: getAbbr(c.name),
        color: getColor(c.id),
        totalUsers: Number(c.total_users),
        pendingCount: Number(c.pending_count),
      }));
      setCompanies(formattedCompanies);
    }
    setLoading(false);
  };

  const handleSelectCompany = (company: ApprovalCompany) => setSelectedCompany(company);
  const handleBack = () => {
    setSelectedCompany(null);
    fetchCompanies(); // Refresh counts on back
  };

  return (
    <PageTransition style={{ height: "100%", display: "flex", flex: 1 }}>
      <div style={{ minHeight: "100%", background: "#f4f4f4", flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedCompany ? (
          <ApprovalUsers
            company={selectedCompany}
            onBack={handleBack}
          />
        ) : loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "#888", marginTop: 40 }}>
            Loading companies...
          </div>
        ) : (
          <ApprovalCompanies
            companies={companies}
            onSelect={handleSelectCompany}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default SparkApprovals;
