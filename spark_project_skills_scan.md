# Spark LMS: Technical Skills & Project Scan

This document maps the implementation details of the **Spark LMS** codebase against the requirements of the technical skill checklist. It highlights concrete files, design patterns, and mechanisms currently present in the repository.

---

## 1. Strong Proficiency in React.js, JavaScript, TypeScript, HTML5, CSS3

### React 19 & TypeScript (Strict Mode)
The application leverages **React 19** and relies heavily on strict typing to enforce model constraints and robust API data contracts.
*   **Evidence:** Explicit type and interface definitions such as `TenantCompany`, `CompanySubscription`, and `ManagementUser` in [tenantService.ts](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/services/tenantService.ts#L8-L53).

### HTML5 & Semantic Structure
Markup is built using clean, accessible, and structured semantic HTML5 tags:
*   **Evidence:** Structure including `<header>`, `<table>`, `<tbody>`, `<aside>`, and React Router `<Outlet>` boundaries are standard across components.

### CSS3 Variables & Tailwind CSS 4
The design system combines flexible CSS3 custom variables with utility styling powered by the modern Tailwind CSS v4 compiler.
*   **Evidence:** The root configuration in `vite.config.js` links `@tailwindcss/vite`, while page-specific custom themes are defined in [sa-pages.css](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/sa-pages.css).
*   **Transitions & Animations:** Entrance transitions are powered by **Framer Motion** (`PageTransition` wrappers), and custom keyframe loop indicators (e.g. `@keyframes pulse` in `SADashboard.tsx`) are used for status indications.

---

## 2. Experience Building Data-Intensive Enterprise UIs (Tables, Dashboards, Forms)

### Dashboards
The global administrator view features an analytics dashboard that summarizes core telemetry:
*   **Evidence:** [SADashboard.tsx](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/SADashboard.tsx) integrates **Recharts** to plot a LineChart for *Global Activity Trends* and multiple PieCharts representing *Tenant Health* and *Course Statuses*.

### Data-Intensive Tables
Large directories containing tenant and user lists support inline actions, sorting, and status filtering:
*   **Evidence:** The global directory in [SparkUsers.tsx](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/Users/SparkUsers.tsx#L781-L800) displays user accounts inside an HTML5 `<table>`, bound to inline actions like user suspension, deactivation, and reactivation.

### Enterprise Registration Forms
Multi-step flows are used to capture complex configurations and display real-time feedback:
*   **Evidence:** [AddTenantPage.tsx](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/Tenants/AddTenantPage.tsx) implements a 3-step registration wizard for new tenants, complete with a step progress indicator and a **live preview panel** that updates the tenant brand card dynamically in response to form state changes.

---

## 3. Experience Integrating with REST APIs and Handling Async Workflows

### Supabase BaaS Integration
The project relies on direct integration with Supabase for data mutations, table joins, and cloud storage bucket interactions:
*   **Evidence:** The async function `createTenantWithAccounts` in [tenantService.ts](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/services/tenantService.ts#L94-L219) handles a sequential chain of database operations:
    1.  Creating a new record in `companies`.
    2.  Creating subscription terms in `company_subscriptions`.
    3.  Auto-generating credentials for default roles (`admin`, `creator`, `approver`).
*   **Media Uploads:** The `uploadAvatar` function in `AuthContext.tsx` handles media uploading to the Supabase cloud bucket `avatars` before calling database updates.

### Axios Interceptors & JWT Handling
Standard REST integrations are decoupled into a modular request handler:
*   **Evidence:** [api.ts](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/services/api.ts) overrides Axios instance behaviors, injecting active JWT tokens into Request headers via `localStorage.getItem('token')` and handling `401 Unauthorized` responses by flushing local storage and triggering login redirects.

---

## 4. Experience with State Management (Redux, Context API, or similar)

### Context API
State orchestration is modularized into dedicated Context Providers to manage authorization, themes, and content:
*   **Evidence:** [AuthContext.tsx](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/context/AuthContext.tsx) acts as the auth gatekeeper, observing real-time session updates via `supabase.auth.onAuthStateChange` and keeping user profiles in sync.
*   **Evidence:** `ThemeContext.tsx` holds states for layout modes, and `CourseContext.tsx` holds loaded courses across layouts.

---

## 5. Familiarity with Performance Optimization in React Applications

### Memoization
To prevent unnecessary component re-renders during active user queries, heavy search and filtering computations are cached:
*   **Evidence:** `useMemo` is used to filter lists of users in [SparkUsers.tsx:L509-533](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/Users/SparkUsers.tsx#L509-L533).
*   **Evidence:** `useCallback` is used in components like [AddTenantPage.tsx:L180-232](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/Tenants/AddTenantPage.tsx#L180-L232) to memoize asynchronous form submissions.

### Inactivity & DOM Event Optimizations
*   **Evidence:** The inactivity tracking hook [useInactivityTimeout.ts:L27-29](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/hooks/useInactivityTimeout.ts#L27-L29) binds listeners using `{ passive: true }`. This signals to the browser's thread that the event handler will not call `.preventDefault()`, enabling faster UI paint cycles and smoother user interactions.

### Pagination
*   **Evidence:** Tables slice raw data (e.g. `ITEMS_PER_PAGE = 8` in `SparkUsers.tsx`) to avoid rendering massive chunks of the DOM tree simultaneously, reducing the overall layout computation cost.

---

## 6. Experience with Modern Tooling (Webpack, Vite, NPM/Yarn)

### Vite Setup
*   **Evidence:** [vite.config.js](file:///c:/Users/yani/Documents/spark-lms/spark-lms/vite.config.js) acts as the configuration entry point, bundling dependencies and assets via Rollup.
*   **Evidence:** Standard Node scripts in `package.json` coordinate linting, bundling, previewing, and development servers using NPM packages.

---

## 7. Git-Based Source Control and CI/CD Pipeline Participation

### Version Control Best Practices
*   **Evidence:** The project uses Git branching strategies. Running `git branch -a` shows active feature isolation branches (e.g., `superadmin/ian`, `user/danchi`, `admin/ian`).
*   **Evidence:** Commits like `Merge branch 'main' into superadmin/ian and resolve conflict...` demonstrate clean feature branch isolation and upstream rebase merges.

---

## 8. Experience Working in Offshore/Distributed Team Environments

### Collaboration Practices
*   **Evidence:** The division of tasks into feature branches (e.g., `superadmin/ian` and `user/danchi`) indicates developer independence within a shared codebase.
*   **Evidence:** Git commit logs track alignment with team specifications and review recommendations (e.g., commit notes referencing: *"tenant health monitor to be adjusted again after reviewing last meeting's advice of coach prince"*).
