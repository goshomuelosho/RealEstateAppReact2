const BG_ERROR_PATTERNS = [
  [/invalid login credentials/i, "Невалиден имейл или парола."],
  [/email not confirmed/i, "Потвърдете имейла си преди вход."],
  [/user already registered/i, "Потребител с този имейл вече съществува."],
  [/password should be at least/i, "Паролата трябва да е поне 6 символа."],
  [/unable to validate email address|invalid email/i, "Невалиден имейл адрес."],
  [/failed to fetch|network request failed/i, "Проблем с връзката. Опитайте отново."],
  [/jwt expired|token.*expired/i, "Сесията изтече. Влез отново."],
  [
    /email rate limit exceeded|for security purposes, you can only request this/i,
    "Твърде много опити. Изчакайте малко и опитайте отново.",
  ],
  [
    /duplicate key value violates unique constraint|already exists/i,
    "Тези данни вече съществуват.",
  ],
  [/row-level security|permission denied|not allowed/i, "Нямате права за това действие."],
  [/not found/i, "Записът не е намерен."],
];

export function toBgErrorMessage(error, fallback = "Възникна грешка. Опитайте отново.") {
  const rawMessage = typeof error === "string" ? error : error?.message;
  if (!rawMessage || typeof rawMessage !== "string") return fallback;

  const message = rawMessage.trim();
  if (!message) return fallback;

  const match = BG_ERROR_PATTERNS.find(([pattern]) => pattern.test(message));
  if (match) return match[1];

  if (/[А-Яа-я]/.test(message)) return message;

  return fallback;
}
