import { supabase } from "../supabaseClient";

/**
 * Logs an admin action to public.audit_logs
 * @param {Object} params
 * @param {string} params.action - e.g. "ESTATE_DELETE", "ESTATE_EDIT"
 * @param {string} params.targetTable - e.g. "estates"
 * @param {string} [params.targetId] - uuid
 * @param {Object} [params.meta] - extra json
 */
export async function logAudit({ action, targetTable, targetId = null, meta = {} }) {
  try {
    await supabase.from("audit_logs").insert([
      {
        action,
        target_table: targetTable,
        target_id: targetId,
        meta,
      },
    ]);
  } catch (e) {
    // do not block UX if audit log fails
    console.error("Audit log failed:", e?.message || e);
  }
}
