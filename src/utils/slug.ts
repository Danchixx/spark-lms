import type { Company } from "../types";

/**
 * Returns the canonical URL slug for a tenant company.
 * Prefers company.slug (from the database), falling back to a slugified company name.
 */
export const getCompanySlug = (company: Company | null | undefined): string => {
  if (!company) return "";
  return company.slug || company.name?.toLowerCase().replace(/\s+/g, "-") || "";
};
