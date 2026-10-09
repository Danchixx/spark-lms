import { supabase } from '../lib/supabase';

export type AuditEvent = {
  action: string;
  tableName?: string;
  recordId?: number | null;
  userId?: string | null;
  oldValue?: string | null;
  newValue?: string | Record<string, any> | null;
};

/**
 * Logs an event to the public.audit_logs table for platform-wide auditing and SuperAdmin monitoring.
 */
export const logAuditEvent = async ({
  action,
  tableName,
  recordId = null,
  userId = null,
  oldValue = null,
  newValue = null,
}: AuditEvent) => {
  try {
    const formattedNewValue =
      typeof newValue === 'object' && newValue !== null
        ? JSON.stringify(newValue)
        : newValue;

    const payload: Record<string, any> = {
      action,
      table_name: tableName || null,
      record_id: recordId || null,
      old_value: oldValue || null,
      new_value: formattedNewValue || null,
    };

    if (userId) {
      payload.user_id = userId;
    }

    const { error } = await supabase.from('audit_logs').insert(payload);
    if (error) {
      console.warn('Audit log insert warning:', error.message);
    }
  } catch (err) {
    console.warn('Failed to log audit event:', err);
  }
};

/**
 * Fetches recent audit logs joined with user details if present.
 */
export const fetchRecentAuditLogs = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    return [];
  }
};
