# SuperAdmin Dashboard: Professional Requirements & Best Practices

## Overview
The SuperAdmin Dashboard (SADashboard) serves as the "Command Center" for the SPARK LMS platform. In this multi-tenant architecture, the SuperAdmin holds supreme authority, managing the lifecycle of tenant organizations who in turn manage their own users and content.

---

## 1. Role Hierarchy & Access Control
The system follows a strict hierarchical management structure:
- **SuperAdmin (Spark)**: The highest authority. Supreme management of the entire platform, including tenant onboarding and system-wide configurations.
- **Tenant Admin**: Management role for a specific company. Responsible for user registration and local administrative tasks.
- **Course Creator (Tenant)**: Responsible for designing and developing high-quality educational content.
- **Approver (Tenant)**: Responsible for Quality Assurance (QA). They review, approve, or reject courses created by the Course Creator before they go live.
- **User (Tenant)**: The learners who take the courses.

## 2. Onboarding & Registration Flow
- **No Self-Registration**: There are no public user registrations. All users must be added by a Tenant Admin.
- **Tenant Activation**: Upon registration by a SuperAdmin, tenants gain immediate access. Credentials for the management tier (Admin, Course Creator, Approver) are automatically sent to the company’s registered email.
- **User Notification**: Learners are notified of their credentials directly by their respective company's Admin.
- **Backend Integration**: Future integration with **Supabase** will serve as the container for company data, emails, and credentials, utilizing an API-driven emailing system.

## 3. Key Performance Indicators (KPIs)
- **Tenant Health**: Total Active Tenants vs. Archived.
- **Global User Count**: Cumulative count of all users registered by all tenants.
- **Course Throughput**: Total number of courses currently in the "Approved" (Live) state across the platform.

## 4. Actionable Alerts (Priority 1)
- **Churn Prevention**: Highlighting tenants with zero activity (no logins or course progress) in the last 7-14 days.
- **System Logs**: Monitoring the automated credential delivery status (success/failure of onboarding emails).

## 5. Course Quality Assurance (QA)
*Note: While SuperAdmin provides the platform, QA is decentralized.*
- **Tenant-Level QA**: The responsibility for course quality lies strictly with the tenant's **Approver**.
- **Visibility**: The SuperAdmin dashboard may show aggregate stats of "Pending Reviews" within tenants to monitor platform health, but does not interfere with the approval process.

## 6. Global Activity & Analytics
- **Global Activity Trend**: Visual representation of daily logins across the entire platform.
- **Tenant Leaderboard**: Ranking organizations based on course completion rates or user engagement.

## 7. Sidebar Quick Actions
The sidebar should include a quick-access menu for the following administrative tasks:
- [ ] **Register New Tenant**: Initiate the multi-step onboarding process.
- [ ] **Global Announcement**: Send a notification to all Tenant Admins.
- [ ] **Data Export**: Generate global usage reports (CSV/PDF).
- [ ] **Tenant Support**: Quick-search for a specific tenant to view their current status.

---

## Technical Considerations
- **Supabase Integration**: Data structures must account for company-specific containers.
- **Email API**: Implementation of a reliable SMTP or transactional email service (e.g., SendGrid, Postmark) for credential delivery.
- **Role Scoping**: Ensuring the frontend accurately masks or reveals features based on the `superadmin`, `admin`, `creator`, `approver`, and `user` tokens.
