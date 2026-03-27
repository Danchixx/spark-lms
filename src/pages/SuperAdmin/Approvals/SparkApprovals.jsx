// src/pages/SuperAdmin/Approvals/SparkApprovals.jsx
// Entry point for the Approvals section.
// View 1: Company grid (filter by company)
// View 2: Pending users table for selected company

import { useState } from "react";
import { APPROVAL_COMPANIES, MOCK_PENDING_USERS } from "../../../data/mockApprovals";
import ApprovalCompanies from "./components/ApprovalCompanies";
import ApprovalUsers from "./components/ApprovalUsers";

const SparkApprovals = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleSelectCompany = (company) => setSelectedCompany(company);
  const handleBack = () => setSelectedCompany(null);

  return (
    <div style={{ minHeight: "100%", background: "#f4f4f4", flex: 1 }}>
      {selectedCompany ? (
        <ApprovalUsers
          company={selectedCompany}
          users={MOCK_PENDING_USERS[selectedCompany.id] || []}
          onBack={handleBack}
        />
      ) : (
        <ApprovalCompanies
          companies={APPROVAL_COMPANIES}
          onSelect={handleSelectCompany}
        />
      )}
    </div>
  );
};

export default SparkApprovals;
