# Add User Form Enhancement (Admin Side) — AI Prompt

## Task

Enhance the **Add User form (Admin side)** by implementing comprehensive input validations, integrating user creation with **Supabase Authentication**, and uploading user avatars to **Supabase Storage**.

---

## Success Brief

* All form fields have proper **validation rules and character limits**.
* Inputs enforce correct data types (e.g., text-only, numbers-only).
* Contact number strictly accepts **11-digit numeric values**.
* Additional validations (required fields, email format, etc.) are implemented.
* Avatar uploaded in the form is successfully stored in **Supabase Storage (`avatars` bucket)**.
* Upon submission, users are:

  1. Created in **Supabase Authentication**
  2. Inserted into the `users` table
  3. Linked with uploaded avatar URL/path
* Passwords are **auto-generated** using the format:

  ```
  Spark-(companyname)-XXXX
  ```

---

## Rules

* Enforce **text-only validation** for:

  * First name
  * Last name
  * Middle name (if applicable)
* Enforce **numbers-only validation** for:

  * Contact number (must be exactly 11 digits)
* Email must follow valid email format.
* Apply **max character limits** where appropriate.
* All required fields must be validated before submission.
* Do **NOT** allow manual password input.
* Password must always be **auto-generated**.
* Ensure the same user is created in both:

  * Supabase Auth
  * `users` table
* Avatar must be uploaded to **Supabase Storage (`avatars` bucket)**.
* Store the avatar **URL or file path** in the `users` table.
* Do **NOT** override default database values (e.g., status).
* Handle and display errors properly.

---

## Conversation

* Confirm:

  * Supabase Auth admin access is available.
  * Storage bucket name is `avatars`.
* Check how `companyname` is retrieved for password generation.
* Verify if there’s an existing helper for file uploads.
* Ask for clarification only if schema or structure is unclear.

---

## Plan

### 1. Frontend Validation

* Apply regex:

  * Text-only: `^[A-Za-z\s]+$`
  * Numbers-only: `^[0-9]+$`
* Enforce:

  * Contact number = exactly 11 digits
  * Valid email format
  * Required fields
* Add `maxLength` constraints.

---

### 2. Password Generation

Generate password dynamically:

```
Spark-${companyname}-${random4Digits}
```

---

### 3. Avatar Upload (Supabase Storage)

* Upload selected image to `avatars` bucket.
* Use a unique file name (e.g., timestamp or UUID).
* Retrieve public URL or storage path.

---

### 4. Supabase Auth Integration

* Use Supabase Admin API to create user:

  * Email
  * Generated password
* Retrieve `auth_user_id`.

---

### 5. Database Insert

* Insert into `users` table:

  * `auth_user_id`
  * user details
  * avatar URL/path
* Do NOT include password.
* Do NOT override default status.

---

### 6. Error Handling

Handle:

* Validation errors (frontend)
* Upload errors (storage)
* Auth creation errors
* Database insert errors

Ensure no partial success (avoid inconsistent data).

---

### 7. UI Feedback

* Show success message on completion
* Show clear and user-friendly error messages

---

## Alignment

* Ensure consistency across:

  * Supabase Auth
  * Database (`users`)
  * Storage (`avatars`)
* Follow secure practices (no password exposure).
* Keep implementation scalable and maintainable.
* Maintain clean UX with proper loading and feedback states.
