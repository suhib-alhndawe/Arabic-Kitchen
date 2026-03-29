type ErrorWithData = {
  message?: string;
  data?: unknown;
};

function getStringField(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object") return null;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "حدث خطأ غير متوقع",
): string {
  const data = (error as ErrorWithData | undefined)?.data;
  return (
    getStringField(data, "error") ||
    getStringField(data, "message") ||
    (error as ErrorWithData | undefined)?.message ||
    fallback
  );
}
