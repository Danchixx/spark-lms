# Spark LMS System Documentation

Spark LMS is a high-performance, multi-tenant Learning Management System (LMS) designed for modular scalability and premium user experience. This document serves as the technical source of truth and a blueprint for the ongoing TypeScript migration.

---

## 1. Technical Stack

### Core Technologies
- **Frontend Framework**: [React 19](https://react.dev/) (Vite 8 beta)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Vanilla CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

### Key Libraries
- `react-router-dom` (v7): Routing and navigation.
- `@supabase/supabase-js`: Database interaction and authentication.
- `axios`: External/Legacy API support.

---

## 2. Infrastructure & Database (Supabase)

The system uses Supabase as its primary database. Below is a mapping of the core logical schemas.

### Core Tables & Relationships

| Table Category | Tables | Primary Key | Key Foreign Keys |
| :--- | :--- | :--- | :--- |
| **Identity & Access** | `roles`, `users` | `id` | `users.role_id` → `roles.id` |
| **Multi-Tenancy** | `companies` | `id` | `users.company_id` → `companies.id` |
| **Learning Content** | `courses`, `course_modules`, `course_lessons` | `id` | `modules.course_id` → `courses.id`, `lessons.module_id` → `modules.id` |
| **Assessments** | `assessments`, `assessment_questions`, `assessment_choices` | `id` | `questions.assessment_id` → `assessments.id` |
| **Progress & Tracking** | `course_assignments`, `lessons_progress`, `course_progress` | `id` | `assignments.user_id` → `users.id` |
| **Certification** | `certificates` | `id` | `certificates.assignment_id` → `course_assignments.id` |

### Key Management Features
- **RLS (Row Level Security)**: Configured in Supabase to ensure tenant isolation.
- **Storage Buckets**: `avatars` for user profiles, `courses` for content assets.

---

## 3. Routing & Authentication Architecture

The system distinguishes between **Global Management** (SuperAdmin) and **Tenant Operations** (Companies).

### Access Entry Points
- **SuperAdmin Login**: `/admin`
  - Purpose: Entry point for the Global Administrator (Spark Admin).
  - Scope: Global control over all tenants, users, and system-wide approvals.
- **Tenant Login**: `/:company`
  - Purpose: Specific login page for a company.
  - Slug-based: The system parses the company slug to apply appropriate branding and filtering.

### Role Hierarchy & Authority
1.  **Spark Admin (SuperAdmin)**: Top authority. Can create/manage tenants, ban/suspend users globally, and approve courses.
2.  **Admin (Tenant Admin)**: Manages a specific company (users, course assignments).
3.  **Approver**: Responsible for reviewing course attempts or user registrations within a tenant.
4.  **Creator**: Content creation role for building courses/modules.
5.  **User (Student)**: Standard learner role.

### Session Management
- **Persistence**: Managed via Supabase Auth and `localStorage` for mock sessions.
- **Inactivity Timeout**: Configured via `useInactivityTimeout` hook, defaulting to 1 hour of inactivity for auto-logout.

---

## 4. User Module: Standard Pattern Source

The `src/pages/User` directory is the gold standard for the system's TypeScript migration.

### Integration Patterns
- **Supabase Connectivity**: Direct use of the Supabase client within hooks and components. Data is joined at the database level using Supabase's `select('*, table(*)')` syntax.
- **State Management**: Orchestrated via `AuthContext` (User profile/Session) and `ThemeContext`.
- **UI/UX Branding**: 
  - Strictly uses CSS variables (`var(--color-bg)`, `var(--color-surface)`) to allow theme switching.
  - `PageTransition` component wraps content for consistent entrance animations.
  - Reusable components (buttons, badges, cards) ensure a premium, unified aesthetic.

---

## 5. SuperAdmin Module: Technical Analysis

The SuperAdmin module is currently in transition from React (JSX) to TypeScript (TSX). It maintains the global registry of the entire LMS.

### Directory: `src/pages/SuperAdmin`

#### **[SADashboard.jsx](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/SADashboard.jsx)**
- **Function**: Layout wrapper and entry point for the global admin dashboard.
- **Key Logic**: Manages the `sidebarOpen` state, handles the `WelcomeScreen` splash, and provides the `Outlet` for nested routes.

#### **[Tenants/SparkTenants.jsx](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/Tenants/SparkTenants.jsx)**
- **Function**: Registry of all company tenants.
- **Features**: List view, detailed view, and "Add Tenant" flow. Currently utilizes mock data but designed for Supabase integration.

#### **[Users/SparkUsers.jsx](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/Users/SparkUsers.jsx)**
- **Function**: Global user directory across all companies.
- **Technical Detail**: Includes complex filtering (Search, Company, Dept, Status) and authority actions (Suspend, Ban, Reactivate). Handles massive data sets with pagination.

#### **[Approvals/SparkApprovals.jsx](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/Approvals/SparkApprovals.jsx)**
- **Function**: Centralized approval queue for company-specific pending users.
- **Workflow**: Company-selection grid leading to a filtered list of pending registrations.

---

## 6. Migration Blueprint (SuperAdmin → TypeScript)

To ensure a smooth migration while maintaining branding and connectivity:

1.  **Connectivity**: Refer to `User/Dashboard.tsx` for clean Supabase querying patterns using joined tables.
2.  **Branding Continuity**:
    - Use the same `Header` and `Sidebar` layouts implemented in the `User` directory.
    - Reference `Dashboard.css` and CSS variables from the User folder to maintain "UI/UX smoothness."
3.  **Type Safety**:
    - Centralize types in `src/types/index.ts`.
    - Mirror the `AppUser` and `Company` interfaces established during the User migration.
4.  **Animation**: Continue using `Framer Motion` and the `PageTransition` wrapper for all route-level changes.
