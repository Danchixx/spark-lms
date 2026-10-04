// src/services/tenantService.ts
// Supabase data layer for tenant (company) management.

import { supabase } from '../lib/supabase';

// ── Types ─────────────────────────────────────────────────────

export interface TenantCompany {
  id: number;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  year_founded?: number;
  office_address?: string;
  country?: string;
  contact_person?: string;
  contact_email?: string;
  phone_number?: string;
  website_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  logo_url?: string;
  cover_photo_url?: string;
  subscription_plan?: string;
  subscription_ends_at?: string;
  subscription_duration_years?: number;
  subscribed_at?: string;
  is_archived: boolean;
  archived_at?: string;
}

export interface CompanySubscription {
  id: number;
  company_id: number;
  plan: string;
  started_at: string;
  ends_at: string;
  status: string;
  created_at: string;
}

export interface ManagementUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  created_at: string;
}

// ── Fetch all tenants ─────────────────────────────────────────
export const fetchTenants = async (): Promise<TenantCompany[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

// ── Fetch single tenant ───────────────────────────────────────
export const fetchTenantById = async (id: number): Promise<TenantCompany | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// ── Update tenant ─────────────────────────────────────────────
export const updateTenant = async (id: number, updates: Partial<TenantCompany>): Promise<void> => {
  const { error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
};

// ── Archive tenant ────────────────────────────────────────────
export const archiveTenant = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('companies')
    .update({ is_archived: true, archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

// ── Create tenant (company + subscription + management users) ─
export interface CreateTenantPayload {
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  year_founded?: number;
  office_address?: string;
  country?: string;
  contact_person?: string;
  contact_email?: string;
  phone_number?: string;
  website_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  logo_url?: string;
  cover_photo_url?: string;
  plan: '1_year' | '3_year';
}

const generatePassword = (length = 12): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pw = '';
  for (let i = 0; i < length; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pw;
};

// Role name → role_id lookup (based on public.roles table)
const ROLE_IDS: Record<string, number> = {
  admin:   2, // adjust if your roles table IDs differ
  creator: 3,
  approver: 4,
};

export interface CreatedCredential {
  role: string;
  email: string;
  password: string;
}

export const createTenantWithAccounts = async (
  payload: CreateTenantPayload
): Promise<{ company: TenantCompany; credentials: CreatedCredential[] }> => {
  const now = new Date();
  const yearsToAdd = payload.plan === '3_year' ? 3 : 1;
  const endsAt = new Date(now);
  endsAt.setFullYear(endsAt.getFullYear() + yearsToAdd);

  // 1. Insert company
  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .insert({
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      industry: payload.industry ?? null,
      year_founded: payload.year_founded ?? null,
      office_address: payload.office_address ?? null,
      country: payload.country ?? null,
      contact_person: payload.contact_person ?? null,
      contact_email: payload.contact_email ?? null,
      phone_number: payload.phone_number ?? null,
      website_url: payload.website_url ?? null,
      facebook_url: payload.facebook_url ?? null,
      linkedin_url: payload.linkedin_url ?? null,
      twitter_url: payload.twitter_url ?? null,
      logo_url: payload.logo_url ?? null,
      cover_photo_url: payload.cover_photo_url ?? null,
      subscription_plan: payload.plan,
      subscription_ends_at: endsAt.toISOString(),
      subscription_duration_years: yearsToAdd,
      subscribed_at: now.toISOString(),
      is_archived: false,
    })
    .select()
    .single();

  if (companyErr || !company) throw companyErr ?? new Error('Failed to create company');

  // 2. Insert subscription record
  const { error: subErr } = await supabase
    .from('company_subscriptions')
    .insert({
      company_id: company.id,
      plan: payload.plan,
      started_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'active',
    });
  if (subErr) throw subErr;

  // 3. Create management accounts
  const roles = ['admin', 'creator', 'approver'] as const;
  const credentials: CreatedCredential[] = [];

  // Fetch role ids from db to be safe
  const { data: rolesData } = await supabase.from('roles').select('id, name');
  const roleMap: Record<string, number> = {};
  (rolesData ?? []).forEach((r: { id: number; name: string }) => { roleMap[r.name] = r.id; });

  for (const role of roles) {
    const email = `${role}@${payload.slug}.spark`;
    const password = generatePassword();
    const roleId = roleMap[role] ?? ROLE_IDS[role];

    const { error: userErr } = await supabase
      .from('users')
      .insert({
        company_id: company.id,
        role_id: roleId,
        email,
        password, // Note: store hashed in production; plaintext here for demo
        firstname: role.charAt(0).toUpperCase() + role.slice(1),
        lastname: payload.name.split(' ')[0],
        status: 'active',
      });

    if (userErr) console.warn(`Could not create ${role} user:`, userErr.message);
    credentials.push({ role, email, password });
  }

  return { company, credentials };
};

// ── Upload image to Supabase Storage ─────────────────────────
export const uploadTenantImage = async (
  file: File,
  bucket: string,
  path: string
): Promise<string> => {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// ── Fetch subscription history ────────────────────────────────
export const fetchSubscriptionHistory = async (companyId: number): Promise<CompanySubscription[]> => {
  const { data, error } = await supabase
    .from('company_subscriptions')
    .select('*')
    .eq('company_id', companyId)
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

// ── Fetch management users ────────────────────────────────────
export const fetchManagementUsers = async (companyId: number): Promise<ManagementUser[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, firstname, lastname, email, status, avatar_url, created_at, roles(name)')
    .eq('company_id', companyId)
    .eq('is_archived', false);

  if (error) throw error;

  const mgmtRoles = ['admin', 'creator', 'approver'];
  return (data ?? [])
    .map((u: any) => ({ ...u, role: u.roles?.name ?? '' }))
    .filter((u: ManagementUser) => mgmtRoles.includes(u.role));
};

// ── Fetch total user count ────────────────────────────────────
export const fetchUserCount = async (companyId: number): Promise<number> => {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('is_archived', false);
  if (error) throw error;
  return count ?? 0;
};
