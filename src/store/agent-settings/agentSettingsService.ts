import { saraApiService } from '@/services/SaraAPIService';

import type {
  AgentIntegrations,
  AgentService,
  AgentSettings,
  AgentPlanTier,
  AgentSettingsUpdateInput,
  AgentSettingsUpdatePayload,
  RawAgentChatwoot,
  RawAgentEasyAppointments,
  RawAgentMeta,
  RawAgentService,
  RawAgentSettings,
  RawAgentSettingsResponse,
  RawAgentStripe,
} from './agentSettingsTypes';

const toStringOrNull = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

const toUpperStringOrNull = (value: unknown): string | null => {
  const text = toStringOrNull(value);
  return text ? text.toUpperCase() : null;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBooleanOrNull = (value: unknown): boolean | null => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return null;
    }
    return value !== 0;
  }
  if (typeof value === 'string') {
    const text = value.trim().toLowerCase();
    if (!text) {
      return null;
    }
    if (['true', '1', 'yes', 'on'].includes(text)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(text)) {
      return false;
    }
  }
  return null;
};

const normalizeServices = (services: RawAgentService[] | null | undefined): AgentService[] => {
  if (!Array.isArray(services) || services.length === 0) {
    return [];
  }

  return services.map(service => {
    const price = toNumberOrNull(service.price);
    const depositAmount = toNumberOrNull(service.deposit_amount);
    const requiresDeposit = Boolean(toBooleanOrNull(service.requires_deposit));

    return {
      serviceId: toStringOrNull(service.service_id ?? service.id),
      label: toStringOrNull(service.label),
      description: toStringOrNull(service.description),
      durationMin: toNumberOrNull(service.duration_min ?? service.duration),
      price,
      currency: toUpperStringOrNull(service.currency),
      requiresDeposit,
      depositAmount: requiresDeposit ? depositAmount ?? price : null,
      eaServiceId: toNumberOrNull(service.ea_service_id),
      eaProviderId: toNumberOrNull(service.ea_provider_id),
    };
  });
};

const maskSecret = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  if (value.length <= 4) {
    return '••••';
  }
  return `${'•'.repeat(Math.max(4, Math.min(8, value.length - 4)))}${value.slice(-4)}`;
};

const normalizeMeta = (raw: RawAgentMeta | null | undefined): AgentIntegrations['meta'] => {
  const phoneNumberId = toStringOrNull(raw?.phone_number_id);
  return {
    connected: Boolean(phoneNumberId),
    wabaId: toStringOrNull(raw?.waba_id),
    phoneNumberId,
    businessAppId: toStringOrNull(raw?.business_app_id),
    approvedTemplates: Array.isArray(raw?.approved_templates)
      ? raw!.approved_templates.filter(template => typeof template === 'string' && template.trim().length > 0)
      : [],
  };
};

const normalizeChatwoot = (
  raw: RawAgentChatwoot | null | undefined,
): AgentIntegrations['chatwoot'] => {
  const apiBase = toStringOrNull(raw?.api_base);
  const accountId = toNumberOrNull(raw?.account_id);
  const inboxId = toNumberOrNull(raw?.inbox_id);
  const agentbotEnabled = Boolean(toBooleanOrNull(raw?.agentbot_enabled));

  return {
    connected: Boolean(apiBase && accountId && inboxId),
    apiBase,
    accountId,
    inboxId,
    agentbotEnabled,
    agentbotWebhookSecret: maskSecret(toStringOrNull(raw?.agentbot_webhook_secret)),
  };
};

const normalizeEasyAppointments = (
  raw: RawAgentEasyAppointments | null | undefined,
): AgentIntegrations['easyAppointments'] => {
  const baseUrl = toStringOrNull(raw?.base_url);
  const apiToken = toStringOrNull(raw?.api_token);
  const webhookSecret = toStringOrNull(raw?.webhook_secret);
  const providerId = toNumberOrNull(raw?.provider_id);
  const serviceId = toNumberOrNull(raw?.service_id);

  return {
    connected: Boolean(baseUrl && apiToken && providerId),
    baseUrl,
    apiPath: toStringOrNull(raw?.api_path),
    apiTokenMasked: maskSecret(apiToken),
    providerId,
    serviceId,
    webhookSecretMasked: maskSecret(webhookSecret),
  };
};

const normalizeStripe = (raw: RawAgentStripe | null | undefined): AgentIntegrations['stripe'] => {
  const accountId = toStringOrNull(raw?.connect_account_id);
  return {
    connected: Boolean(accountId),
    accountId,
  };
};

const normalizeIntegrations = (raw: RawAgentSettings): AgentIntegrations => {
  return {
    meta: normalizeMeta(raw.meta),
    chatwoot: normalizeChatwoot(raw.chatwoot),
    easyAppointments: normalizeEasyAppointments(raw.easy_appointments),
    stripe: normalizeStripe(raw.stripe),
  };
};

const normalizePlanTier = (tier: AgentPlanTier | string | null | undefined): AgentPlanTier | null => {
  if (!tier) {
    return null;
  }
  const text = String(tier).trim().toLowerCase();
  if (text === 'basic' || text === 'premium') {
    return text;
  }
  return null;
};

const normalizeLanguages = (languages: string[] | null | undefined): string[] => {
  if (!Array.isArray(languages)) {
    return [];
  }
  const unique = new Set<string>();
  languages.forEach(lang => {
    if (typeof lang === 'string') {
      const trimmed = lang.trim();
      if (trimmed.length > 0) {
        unique.add(trimmed);
      }
    }
  });
  return Array.from(unique);
};

const normalizeAgentSettings = (raw: RawAgentSettings): AgentSettings => {
  const normalizedServices = normalizeServices(raw.services ?? raw.easy_appointments?.services);

  return {
    id: toStringOrNull(raw.id),
    name: toStringOrNull(raw.name),
    planTier: normalizePlanTier(raw.plan_tier),
    publicWhatsappPhone: toStringOrNull(raw.public_whatsapp_phone),
    managerWhatsappPhone: toStringOrNull(raw.manager_whatsapp_phone),
    paymentRequired: toBooleanOrNull(raw.payment_required),
    doctorConfirmationRequired: toBooleanOrNull(raw.doctor_confirmation_required),
    languages: normalizeLanguages(raw.languages),
    notes: toStringOrNull(raw.notes),
    instructions: toStringOrNull(raw.instructions),
    services: normalizedServices,
    integrations: normalizeIntegrations(raw),
  };
};

const buildUpdatePayload = (input: AgentSettingsUpdateInput): AgentSettingsUpdatePayload => {
  const payload: AgentSettingsUpdatePayload = {};

  if (input.name !== undefined) {
    payload.name = toStringOrNull(input.name);
  }
  if (input.paymentRequired !== undefined && input.paymentRequired !== null) {
    payload.payment_required = Boolean(input.paymentRequired);
  }
  if (input.doctorConfirmationRequired !== undefined && input.doctorConfirmationRequired !== null) {
    payload.doctor_confirmation_required = Boolean(input.doctorConfirmationRequired);
  }
  if (input.planTier !== undefined && input.planTier !== null) {
    payload.plan_tier = normalizePlanTier(input.planTier) ?? null;
  }
  if (input.instructions !== undefined) {
    payload.instructions = input.instructions ?? null;
  }

  return payload;
};

export class AgentSettingsService {
  static async fetchAgentSettings(agentId: string): Promise<AgentSettings> {
    const safeAgentId = encodeURIComponent(agentId);
    const response = await saraApiService.get<RawAgentSettingsResponse>(`/agents/${safeAgentId}`);
    const payload = response.data;

    if (!payload?.data) {
      const reason = payload?.error || payload?.message || 'Agent settings not available.';
      throw new Error(reason);
    }

    return normalizeAgentSettings(payload.data);
  }

  static async updateAgentSettings(
    agentId: string,
    input: AgentSettingsUpdateInput,
  ): Promise<AgentSettings> {
    const payload = buildUpdatePayload(input);
    const hasPayload = Object.values(payload).some(value => value !== undefined);

    if (!hasPayload) {
      throw new Error('No fields provided for update.');
    }

    const safeAgentId = encodeURIComponent(agentId);
    const response = await saraApiService.patch<RawAgentSettingsResponse>(
      `/agents/${safeAgentId}`,
      payload,
    );
    const body = response.data;

    if (!body?.data) {
      const reason = body?.error || body?.message || 'Agent settings update failed.';
      throw new Error(reason);
    }

    return normalizeAgentSettings(body.data);
  }
}
