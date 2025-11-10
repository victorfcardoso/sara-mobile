export interface FaqEscalation {
  enabled?: boolean;
  trigger_phrases?: string[];
  customer_message?: string;
  default_summary_template?: string;
  pause_ttl_seconds?: number;
  labels?: string[];
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  escalation?: FaqEscalation;
}

const FAQ_BLOCK_REGEX = /###\s*FAQ[\s\S]*?```json\s*([\s\S]*?)```/i;
const FAQ_BLOCK_HEADER = '### FAQ (GROUND TRUTH)';

const buildFaqBlock = (faqs: FaqEntry[]): string => {
  const json = JSON.stringify({ faqs }, null, 2);
  return `${FAQ_BLOCK_HEADER}\n\`\`\`json\n${json}\n\`\`\``;
};

const normalizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
};

const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const normalized = value.map(item => normalizeString(item)).filter(Boolean);
  return normalized.length ? normalized : undefined;
};

const normalizeEscalation = (raw: unknown): FaqEscalation | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }
  const candidate = raw as Record<string, unknown>;
  const escalation: FaqEscalation = {};

  if ('enabled' in candidate) {
    const value = candidate.enabled;
    escalation.enabled =
      typeof value === 'boolean'
        ? value
        : ['1', 'true', 'yes'].includes(normalizeString(value).toLowerCase());
  }
  if ('trigger_phrases' in candidate) {
    escalation.trigger_phrases = normalizeStringArray(candidate.trigger_phrases);
  }
  if ('customer_message' in candidate) {
    escalation.customer_message = normalizeString(candidate.customer_message) || undefined;
  }
  if ('default_summary_template' in candidate) {
    escalation.default_summary_template =
      normalizeString(candidate.default_summary_template) || undefined;
  }
  if ('pause_ttl_seconds' in candidate) {
    const ttl = Number(candidate.pause_ttl_seconds);
    escalation.pause_ttl_seconds = Number.isFinite(ttl) && ttl > 0 ? ttl : undefined;
  }
  if ('labels' in candidate) {
    escalation.labels = normalizeStringArray(candidate.labels);
  }

  return Object.keys(escalation).length ? escalation : undefined;
};

export const parseFaqsFromInstructions = (instructions: string | null | undefined): FaqEntry[] => {
  if (!instructions) {
    return [];
  }

  const blockMatch = instructions.match(FAQ_BLOCK_REGEX);
  if (!blockMatch || !blockMatch[1]) {
    return [];
  }

  try {
    const parsed = JSON.parse(blockMatch[1]);
    const items = Array.isArray(parsed?.faqs) ? parsed.faqs : [];

    return items
      .map(item => {
        if (!item || typeof item !== 'object') {
          return undefined;
        }
        const id = normalizeString((item as Record<string, unknown>).id);
        const question = normalizeString((item as Record<string, unknown>).question);
        const answer = normalizeString((item as Record<string, unknown>).answer);
        if (!id || !question || !answer) {
          return undefined;
        }
        const escalation = normalizeEscalation((item as Record<string, unknown>).escalation);
        return escalation ? { id, question, answer, escalation } : { id, question, answer };
      })
      .filter((entry): entry is FaqEntry => Boolean(entry));
  } catch (error) {
    console.warn('[faq] Failed to parse FAQ block', error);
    return [];
  }
};

export const upsertFaqInstructionsBlock = (
  instructions: string | null | undefined,
  faqs: FaqEntry[],
): string => {
  const safeInstructions = instructions ?? '';
  const block = buildFaqBlock(faqs);

  if (!safeInstructions.trim()) {
    return `${block}\n`;
  }

  if (FAQ_BLOCK_REGEX.test(safeInstructions)) {
    return safeInstructions.replace(FAQ_BLOCK_REGEX, block);
  }

  const trimmed = safeInstructions.trimEnd();
  const separator = trimmed.length ? '\n\n' : '';
  return `${trimmed}${separator}${block}\n`;
};
