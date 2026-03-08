const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export function normalizeUsername(value) {
  return String(value || "").trim();
}

export function validateUsername(value) {
  const normalized = normalizeUsername(value);

  if (!normalized) {
    return "Моля, въведи потребителско име.";
  }

  if (normalized.length < MIN_USERNAME_LENGTH) {
    return `Потребителското име трябва да е поне ${MIN_USERNAME_LENGTH} символа.`;
  }

  if (normalized.length > MAX_USERNAME_LENGTH) {
    return `Потребителското име може да е най-много ${MAX_USERNAME_LENGTH} символа.`;
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    return "Позволени са само латински букви (малки и главни), цифри, точка, тире и долна черта.";
  }

  return "";
}

export function createRandomUsername(prefix = "user") {
  const cleanPrefix = normalizeUsername(prefix).replace(/[^A-Za-z0-9._-]/g, "") || "user";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${cleanPrefix}_${suffix}`;
}

export async function isUsernameTaken(supabase, username, excludedUserId = null) {
  let query = supabase.from("profiles").select("id").eq("name", username).limit(1);
  if (excludedUserId) query = query.neq("id", excludedUserId);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).length > 0;
}
