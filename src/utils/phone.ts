export const formatBrazilPhone = (input?: string | null): string | null => {
  if (!input) {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const withoutPrefix = trimmed.replace(/^whatsapp:/i, '').trim();
  let digits = withoutPrefix.replace(/\D+/g, '');

  if (!digits) {
    return withoutPrefix;
  }

  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(2);
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return withoutPrefix;
};
