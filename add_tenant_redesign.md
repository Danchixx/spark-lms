# SPARK LMS – SuperAdmin Tenant Onboarding Redesign

This document outlines the agreed-upon redesign for the "Add New Tenant" workflow, separating the responsibilities between the SuperAdmin and the new Tenant, and streamlining the initial setup process.

## 1. Overview & Core Philosophy

The current B2B SaaS onboarding standard is to decouple the system "shell" creation from the internal tenant setup (e.g., payment, user management). 

**Why the current process is being changed:**
- **Security & Liability:** SuperAdmins should not be responsible for manually handling, uploading, or processing sensitive payment proofs on behalf of the client during creation.
- **Scalability:** The SuperAdmin creates the "shell", while the Tenant Admin handles the heavy lifting of importing their users, which saves global admins time.
- **Flexibility in Pricing:** Because the management team negotiates prices offline, the system does not need a rigid point-of-sale checkout during creation. Tiers act as assignments rather than strict paywalls.

Workflow Phases:
1. **SuperAdmin Creates the Shell**
2. **System Auto-Generates Credentials**
3. **Tenant Claims and Activates Account**

---

## 2. Phase 1: SuperAdmin Forms (Company Shell Setup)

The current multi-step wizard (`AddTenantStep1` through `Step4`) will be completely replaced. 
The new `AddTenant.tsx` will be a single, beautifully designed unified page, heavily modeled after the `Profile.tsx` layout for visual consistency.

### Expected UI & Data Points
- **Visual Assets:** 
  - Upload Company Profile Picture (Logo)
  - Upload Cover Photo
- **Company Details:**
  - Company Name
  - Industry
  - Address
  - Contact Person
  - Contact Phone & Email
- **Social Media Links:** Input fields for embedded link icons (LinkedIn, Website, Facebook).
- **Tier Assignment (Plan Labels):** 
  - A clean, visual card-based selection to assign the negotiated tier (e.g., "Basic", "Pro", "Custom"). 
  - *Note:* Because prices are negotiated offline, prices and payment gateways are completely removed from this step.

---

## 3. Phase 2: System Automation (Auto-Generating Roles)

When the SuperAdmin clicks **"Create Tenant"**, the system will automatically provision the foundational management structure for that specific company without any further input.

**Automated Database Actions:**
1. Insert the new Company record.
2. Generate 3 initial Management Users linked to the new `company_id`:
   - `admin@[company-slug].com`
   - `course_creator@[company-slug].com`
   - `approver@[company-slug].com`
3. Generate a single-use default password for these accounts (e.g., `SparkWelcome2026!`).
4. Set a database flag requiring them to change this password strictly on their first login.

---

## 4. Phase 3: Tenant-Side Handoff (Claim & Manage)

The responsibility is now passed onto the newly created Tenant Admin.

1. **First Login & Security:** The Tenant logs in using `admin@[company-slug].com` and is forced to set a secure personal password.
2. **Payment Proof (Optional/Later integration):** Based on business rules, if they are paying manually, their dashboard forces them to upload their proof of transaction (Palawan Pay/Bank Transfer). The SuperAdmin simply clicks "Approve Proof" to unlock their system.
3. **Employee Management:** The Tenant Admin gets full access to their dashboard and begins adding the rest of their own company's users.

---

## 5. Development Steps Required

To implement this redesign:
1. **Clean up code:** Delete `AddTenantStep1.tsx`, `AddTenantStep2.tsx`, `AddTenantStep3.tsx`, and `AddTenantStep4.tsx`.
2. **Rebuild UI:** Implement the single page layout in `AddTenant.tsx` utilizing `ProfileCard`-style design elements.
3. **Supabase Integration:** Write the API logic that creates the company and performs the batch insert of the 3 auto-generated users seamlessly in one transaction.
