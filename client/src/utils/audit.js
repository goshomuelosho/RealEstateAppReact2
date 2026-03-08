import { supabase } from "../supabaseClient";


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
    console.error("Audit log failed:", e?.message || e);
  }
}

