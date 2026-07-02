import { supabase } from '../supabaseClient';

export async function logAuditAction(
  actionType: string,
  tableName: string,
  targetId: string | null,
  oldValue: any = null,
  newValue: any = null,
  performedById?: string | null
) {
  try {
    let actorId = performedById ?? null;

    if (!actorId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fall back to resolving the profile row only when the caller doesn't already have it.
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      actorId = user?.id ?? null;
    }

    if (!actorId) return;

    await supabase.from('audit_logs').insert({
      performed_by_id: actorId,
      action_type: actionType,
      table_name: tableName,
      target_id: targetId,
      old_value: oldValue,
      new_value: newValue
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
