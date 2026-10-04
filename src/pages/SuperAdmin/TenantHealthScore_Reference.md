# Tenant Health Score — Reference Document
*SuperAdmin Dashboard · SPARK LMS Platform*

---

## Purpose

The **Tenant Health Score** is a 0–100 numeric indicator computed per tenant (company) in the SuperAdmin Dashboard. It surfaces churn risk at a glance so the SuperAdmin can act before a tenant fully disengages from the platform.

---

## Signal Weights

The score is composed of three independent signals:

| Signal | Max Points | Description |
|---|---|---|
| **Last Login** | 40 pts | How recently any user in the tenant logged into the platform |
| **Lesson Completion Rate** | 35 pts | % of assigned lessons marked completed across all company users |
| **Assignment Activity** | 25 pts | Number of active course assignments belonging to company users |

**Total possible score: 100**

---

## Signal 1 — Last Login (40 pts)

Uses the **most recent `last_login_at`** across all non-archived users in the tenant.

| Days Since Last Login | Points Awarded |
|---|---|
| 0–1 days | **40** |
| 2–3 days | **35** |
| 4–7 days | **25** |
| 8–14 days | **15** |
| More than 14 days | **0** |
| Never logged in (null) | **0** |

> **Why this matters:** Login activity is the strongest leading indicator. A tenant where no user has logged in for over 2 weeks is a clear churn signal regardless of historical progress.

---

## Signal 2 — Lesson Completion Rate (35 pts)

Formula:
```
completionRate = completedLessons / totalLessons
completionScore = completionRate × 35
```

Where `completedLessons` and `totalLessons` are counted from the `lessons_progress` table, filtered to assignments belonging to the tenant's users.

If a tenant has **no assignments at all**, this signal returns **0 points**.

| Completion Rate | Approximate Points |
|---|---|
| 80–100% | 28–35 |
| 60–79% | 21–28 |
| 40–59% | 14–21 |
| 20–39% | 7–14 |
| 0–19% | 0–7 |

> **Why this matters:** A tenant may log in frequently but not actually learn. Completion rate reveals true platform engagement depth.

---

## Signal 3 — Assignment Activity (25 pts)

Formula:
```
assignmentScore = min(25, assignmentCount × 8)
```

| Assignments | Points |
|---|---|
| 0 | 0 |
| 1 | 8 |
| 2 | 16 |
| 3 (max) | 24 |
| 4+ | 25 (capped) |

> **Why this matters:** Tenants with zero course assignments have no learning infrastructure in place. This is a structural churn risk distinct from login frequency.

---

## Health Tiers

| Score Range | Tier | Badge Color | Action |
|---|---|---|---|
| 70–100 | **HEALTHY** | Green | No action required |
| 40–69 | **AT RISK** | Orange | Monitor; consider proactive check-in |
| 0–39 | **CHURNING** | Red | Notify button shown; immediate outreach recommended |

---

## Sort Order

Tenants are sorted **ascending by score** (worst first) so the most urgent cases always appear at the top of the list.

---

## Notify Trigger

The **Notify** button appears for tenants in the **CHURNING** tier (score < 40). Clicking it opens a pre-filled email draft to the tenant's `contact_email` (from the `companies` table) with a re-engagement message.

---

## Live Data Sources

| Metric | DB Table | Column |
|---|---|---|
| Last login date | `public.users` | `last_login_at` |
| Lesson completions | `public.lessons_progress` | `is_completed` |
| Course assignments | `public.course_assignments` | `id`, `user_id` |
| Company details | `public.companies` | `name`, `contact_email`, `subscription_plan` |

---

## Adjusting Thresholds

All thresholds are defined in the `computeHealthScore()` function in `SADashboard.tsx` (inside the `DashboardHome` component). To adjust:

1. Open `src/pages/SuperAdmin/SADashboard.tsx`
2. Find the `computeHealthScore` function
3. Modify the `loginScore` step table or the `getHealthTier` tier boundaries
4. No DB changes required — this is a purely client-computed metric

---

## Future Improvements

- [ ] Replace `last_login_at` (last login only) with a dedicated `login_events` table for true daily activity tracking
- [ ] Add a "time on platform" signal using session duration data
- [ ] Allow SuperAdmin to customize per-tenant thresholds
- [ ] Export health report as CSV
