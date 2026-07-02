import { supabase } from '../supabaseClient';

export async function logAuditAction(
  actionType: string,
  tableName: string,
  targetId: string | null,
  oldValue: any = null,
  newValue: any = null
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get public.users user ID based on auth_user_id
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (!user) return;

    await supabase.from('audit_logs').insert({
      performed_by_id: user.id,
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
