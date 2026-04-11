// src/pages/SuperAdmin/Approvals/SparkApprovals.tsx
import { useState } from "react";
import { APPROVAL_COMPANIES, MOCK_PENDING_USERS } from "../../../data/mockApprovals";
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
}

export interface ApprovalUser {
  id: number;
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
  suspendReason?: string | null;
  banReason?: string | null;
  suspendDuration?: string;
}

const SparkApprovals = () => {
  const [selectedCompany, setSelectedCompany] = useState<ApprovalCompany | null>(null);

  const handleSelectCompany = (company: ApprovalCompany) => setSelectedCompany(company);
  const handleBack = () => setSelectedCompany(null);

  return (
    <PageTransition style={{ height: "100%", display: "flex", flex: 1 }}>
      <div style={{ minHeight: "100%", background: "#f4f4f4", flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedCompany ? (
          <ApprovalUsers
            company={selectedCompany}
            users={(MOCK_PENDING_USERS as Record<number, ApprovalUser[]>)[selectedCompany.id] || []}
            onBack={handleBack}
          />
        ) : (
          <ApprovalCompanies
            companies={APPROVAL_COMPANIES as ApprovalCompany[]}
            onSelect={handleSelectCompany}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default SparkApprovals;
