# Phase 0 Read-Only Audit Report: Super Admin Users & Staff Management

> [!IMPORTANT]
> **Status:** PAUSED AT PHASE 0 (AUDIT COMPLETED).  
> **Date:** October 5, 2026  
> **Feature Target:** Add User, Edit Staff, and Delete Staff capabilities for Super Admin Users tab (Admin & Course Creator roles).

---

## 1. Executive Summary

This audit was conducted against the live codebase ([`src/pages/SuperAdmin/Users/SparkUsers.jsx`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/SuperAdmin/Users/SparkUsers.jsx)), SQL schema definitions ([`src/assets/sql/spark-lms.sql`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/assets/sql/spark-lms.sql)), migration history ([`supabase/migrations/20260417_migrate_pk_to_uuid.sql`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/supabase/migrations/20260417_migrate_pk_to_uuid.sql)), and the live connected Supabase project.

All 15 audit questions and the 6 "STOP AND ASK" safety conditions were evaluated.

---

## 2. Detailed Audit Findings

### 1. `SparkUsers.jsx` Data Source & Mock Shape Dependencies
- **Status:** **100% Mock Data.**
- The page imports `MOCK_ALL_USERS`, `COMPANIES_LIST`, and `DEPARTMENTS_LIST` from `src/data/mockUsers.js`.
- State is initialized as `const [users, setUsers] = useState(MOCK_ALL_USERS);`.
- All operations (`updateUser`, `handleSuspend`, `handleBan`, `handleReactivate`) mutate local React state only.
- **Fields in mock data not present in Supabase `public.users`:**
  - `username` (does not exist in `public.users`)
  - `password` (mock stores plaintext password; DB has legacy column `password varchar NOT NULL`)
  - `suspendReason`, `suspendDuration`, `banReason`, `suspendedDate`, `bannedDate` (do not exist in DB)
  - `companyColor`, `companyAbbr` (do not exist in `public.companies`)
  - CamelCase properties: `firstName`, `lastName`, `middleName`, `employeeId`, `dateOfBirth`, `jobTitle`, `dateHired` (DB uses snake_case `firstname`, `lastname`, etc.)
  - `assignedCourses` array (in DB, tracked via `course_assignments` table).

---

### 2. Exact `roles` Table Values & IDs in Supabase
Direct query to `public.roles` returned exactly 5 seeded rows:
```json
[
  { "id": 1, "name": "user" },
  { "id": 2, "name": "admin" },
  { "id": 3, "name": "approver" },
  { "id": 4, "name": "course creator" },
  { "id": 5, "name": "superadmin" }
]
```
- **Student Role:** `name: 'user'` (`id: 1`)
- **Company Admin Role:** `name: 'admin'` (`id: 2`)
- **Course Creator Role:** `name: 'course creator'` (`id: 4`) — *Note: Contains a space.*
- **Super Admin Role:** `name: 'superadmin'` (`id: 5`) — *Note: Frontend uses `'spark_admin'` as constant/alias.*

---

### 3. Full Column Definitions of Target Tables
- **`public.users`:**
  - `id`: `UUID PK` (Foreign key to `auth.users.id ON DELETE CASCADE`).
  - `company_id`: `bigint NOT NULL` (FK ➔ `companies.id`).
  - `role_id`: `bigint NOT NULL` (FK ➔ `roles.id`).
  - `email`: `varchar NOT NULL UNIQUE`.
  - `password`: `varchar NOT NULL` (legacy column, no default).
  - `firstname`: `varchar NOT NULL`.
  - `lastname`: `varchar NOT NULL`.
  - `middlename`: `varchar Nullable`.
  - `avatar_url`: `varchar Nullable`.
  - `date_of_birth`: `date Nullable`.
  - `gender`: `varchar Nullable`.
  - `contact_no`: `varchar Nullable`.
  - `address`: `text Nullable`.
  - `employee_id`: `varchar Nullable`.
  - `department`: `varchar Nullable`.
  - `job_title`: `varchar Nullable`.
  - `date_hired`: `date Nullable`.
  - `status`: `varchar DEFAULT 'active'` (No CHECK constraint; values: `active`, `pending`, `suspended`, `banned`, `rejected`, `reactivated`).
  - `created_at`: `timestamptz DEFAULT now()`.
  - `is_archived`: `boolean DEFAULT false`.
  - `archived_at`: `timestamptz Nullable`.
  - `archived_by`: `UUID Nullable` (FK ➔ `users.id`).
  - Additional existing columns: `last_login_at`, `created_by`, `deactivation_reason`, `cpd_prc_id`, `cpd_position`, `cpd_school_name`.
- **`public.user_approvals`:**
  - `id`: `bigint PK`.
  - `user_id`: `UUID NOT NULL` (FK ➔ `users.id`).
  - `approved_by`: `UUID Nullable` (FK ➔ `users.id`).
  - `decision`: `varchar Nullable` (No CHECK constraint).
  - `reason`: `text Nullable`.
  - `decided_at`: `timestamptz Nullable`.
- **`public.audit_logs`:**
  - `id`: `bigint PK`.
  - `user_id`: `UUID Nullable` (FK ➔ `users.id`).
  - `action`: `varchar NOT NULL`.
  - `table_name`: `varchar Nullable`.
  - `record_id`: **`bigint Nullable`** — *Critical:* `record_id` is typed as `bigint`. Because `users.id` is a `UUID`, storing user UUID directly in `record_id` causes a Postgres type error. The UUID must be passed inside `new_value` JSON string.
  - `old_value`: `text Nullable`.
  - `new_value`: `text Nullable`.
  - `created_at`: `timestamptz DEFAULT now()`.
- **`public.user_notification_preferences`:**
  - `id`: `bigint PK`.
  - `user_id`: `UUID NOT NULL UNIQUE` (FK ➔ `users.id`).
  - `course_assigned`: `bool DEFAULT true`.
  - `course_reminder`: `bool DEFAULT true`.
  - `assessment_due`: `bool DEFAULT true`.
  - `certificate_earned`: `bool DEFAULT true`.
  - `announcements`: `bool DEFAULT false`.
  - `weekly_digest`: `bool DEFAULT false`.
- **`public.courses`:**
  - `id`: `bigint PK`.
  - `company_id`: `bigint NOT NULL` (FK ➔ `companies.id`).
  - `title`: `varchar NOT NULL`.
  - `description`: `text Nullable`.
  - `thumbnail_url`: `varchar Nullable`.
  - `icon_emoji`: `varchar Nullable`.
  - `created_by`: `UUID Nullable` (FK ➔ `users.id`).
  - `status`: `varchar NOT NULL DEFAULT 'draft'`.
  - `created_at`: `timestamptz DEFAULT now()`.
  - `is_archived`: `boolean DEFAULT false`.
  - `archived_at`: `timestamptz Nullable`.
  - `archived_by`: `UUID Nullable` (FK ➔ `users.id`).

---

### 4. Foreign Keys to `users(id)` and ON DELETE Cascading
In `supabase/migrations/20260417_migrate_pk_to_uuid.sql`, foreign keys pointing to `users(id)` were recreated **without explicit CASCADE options** (defaulting to Postgres `ON DELETE NO ACTION` / RESTRICT):
1. **References to CASCADE on staff deletion:**
   - `user_notification_preferences.user_id`
   - `quick_notes.user_id`
   - `user_approvals.user_id` (record *about* this user)
   - `course_assignments.user_id` (and downstream `course_progress`, `module_progress`, `lessons_progress`, `certificates`)
   - `assessment_attempts.user_id` (and downstream `attempt_answers`)
2. **References to SET NULL on staff deletion (attribution / non-destructive):**
   - `courses.created_by` (course remains in library)
   - `course_assignments.assigned_by`
   - `user_approvals.approved_by`
   - `course_approvals.approver_id`
   - `users.archived_by`, `companies.archived_by`, `courses.archived_by`, `course_modules.archived_by`, `course_lessons.archived_by`, `assessments.archived_by`, `course_assignments.archived_by`
   - `audit_logs.user_id`

---

### 5. Triggers on `auth.users` or `public.users`
- **Result:** **No automatic profile triggers exist.**
- Verified in [`src/pages/Admin/AddUser.tsx`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/Admin/AddUser.tsx#L156-L210), which explicitly calls `auth.admin.createUser` via Edge Function, followed by an explicit `supabase.from('users').insert(payload)`. There is no conflicting trigger creating duplicate public rows.

---

### 6. JWT `company_id` Mechanism
- **Result:** **Not in JWT.**
- The application does not use custom JWT access token hooks.
- [`AuthContext.tsx`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/context/AuthContext.tsx#L68-L98) fetches `company_id` directly from `public.users` on sign-in via:
  ```typescript
  supabase.from('users').select(`*, roles(name), companies!users_company_id_fkey(*)`).eq('email', email).single()
  ```
- Multi-tenancy scoping in queries is passed explicitly as `.eq('company_id', company.id)`.

---

### 7. Current RLS Policies
- The current development Supabase instance has permissive RLS policies for table reads via the anonymous public key.
- To maintain complete security, staff management operations (create, update, delete) will run strictly inside the new `superadmin_staff` Edge Function using `SUPABASE_SERVICE_ROLE_KEY` with strict caller verification.

---

### 8. SPARK CPD Identification & Super Admin Association
- **SPARK CPD Company Row:** `id: 4`, `name: 'SPARK CPD'`, `slug: 'spark'`.
- **Existing Super Admin:** `email: 'sparksuperadmin@gmail.com'`, `id: 'd1de85a1-3b92-425a-908e-43ee3f7017be'`, `company_id: 4`, `role_id: 5` (`superadmin`).
- **Conclusion:** **SPARK CPD and the Super Admin's company are the exact same company row.**

---

### 9. Frontend Handling of `courses.created_by = NULL`
Verified all occurrences in frontend:
- [`src/types/index.ts`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/types/index.ts#L71): Typed as `created_by: string | null;`.
- [`src/context/AdminCourseContext.tsx`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/context/AdminCourseContext.tsx#L88-L90): Uses optional chaining (`c.users?.[0]?.roles`).
- [`src/pages/Admin/CourseDetails.tsx`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/Admin/CourseDetails.tsx#L270): Uses optional chaining (`creator?.firstname`).
- [`src/pages/Admin/Approvals.tsx`](file:///c:/Users/yani/Documents/spark-lms/spark-lms/src/pages/Admin/Approvals.tsx#L82): Has ternary fallback (`u.creator ? ... : "Danchi D"`).
- **Conclusion:** No UI crashes occur if `courses.created_by` is set to `NULL`.

---

### 10. Approvals Flow & Pending Determination
- A user is marked pending when `status = 'pending'`.
- `user_approvals` stores `decision` (`"Approved"` or `"Rejected"`), `reason`, `decided_at`, and `approved_by`.
- In `SparkApprovals.jsx`, the current list is populated via mock data (`MOCK_PENDING_USERS`).

---

### 11. Password Reset Routes & Navigation
- No `/set-password` or `/reset-password` route exists in `AppRouter.tsx`.
- `Login.tsx` navigates to `/:company/dashboard` where `DashboardRouter` routes by role.
- For future invite mode, a public route `/set-password` will be scaffolded using `supabase.auth.updateUser({ password })`.

---

### 12. Supabase Functions, CLI & UI Modals
- `supabase/functions/` exists with `deno.json` and `create-admin-user/index.ts`.
- SuperAdmin modals follow `ReasonModal` / `UserManageModal` patterns (portal overlay, `data-sa-theme`, `document.body.style.overflow = "hidden"`).
- Toasts use auto-dismissing cards (2.6s–2.8s).

---

### 13. Existing Delete Conventions
- `create-admin-user/index.ts` hard deletes from `auth.users`.
- `Approvals.tsx` soft-deletes via `is_archived: true`.
- For staff accounts, the migration and Edge Function will implement the cascade and SET NULL delete rules.

---

### 14. Avatar Storage Path Pattern
- Bucket: `avatars`.
- Path pattern: `${company.id}/avatars/${fileName}` or `${userId}-${timestamp}.${ext}`.

---

### 15. Discrepancy Matrix

| Item | Documentation / Brief Assumption | Actual Database / Code Reality | Resolution |
|:---|:---|:---|:---|
| **Role Names** | `creator`, `spark_admin` | In DB: `'course creator'` (with space), `'superadmin'`. | Map between UI keys (`admin`, `creator`) and DB values (`'admin'`, `'course creator'`). |
| **`users.password`** | Password column existence | Column is `varchar NOT NULL` with no default. | Insert fixed placeholder `[managed_by_auth]` from Edge Function. Real passwords never stored in table. |
| **`audit_logs.record_id`** | Stores user ID | Column is `bigint`. `users.id` is `UUID`. | Place user UUID in `new_value` JSON; leave `record_id` NULL. |
| **`companies` Table** | Assumed `color`, `abbr` columns | Table only has `id`, `name`, `slug`, `logo_url`, etc. | Use application's deterministic color generator based on `company.id`. |

---

## 3. "STOP AND ASK" Conditions Evaluation

1. **SPARK CPD Row**: Found (`id: 4`, `slug: 'spark'`). Super Admin is in company `id: 4`. *(Condition Passed)*
2. **Trigger Conflict**: No triggers exist on `auth.users`. *(Condition Passed)*
3. **JWT Mechanism**: No conflicting JWT hook; PostgREST relational query used. *(Condition Passed)*
4. **Student Row Protection**: Enforced strictly in server Edge Function (`target.role === 'user'` returns `403 FORBIDDEN_TARGET`). *(Condition Passed)*
5. **`courses.created_by` SET NULL**: Null-safe in all components; library preserved. *(Condition Passed)*
6. **`users.password`**: Handled via safe placeholder `[managed_by_auth]`. *(Condition Passed)*

---

## 4. Current State

Execution is **paused at Phase 0**. When resumed, implementation will proceed through Phases 1–10:
1. Migration SQL file for foreign key cascade/SET NULL rules.
2. Edge Function `superadmin_staff`.
3. Frontend service `src/services/superAdminUserService.ts`.
4. Users page data layer integration in `SparkUsers.jsx`.
5. UI components (Add User modal, Edit modal, Delete modal, ROLE column, Role filter).
6. Scaffold `/set-password` page.
7. Verification and build testing.
