export type AgentPlanTier = 'basic' | 'premium';

export interface AgentService {
  serviceId: string | null;
  label: string | null;
  description: string | null;
  durationMin: number | null;
  price: number | null;
  currency: string | null;
  requiresDeposit: boolean;
  depositAmount: number | null;
  eaServiceId: number | null;
  eaProviderId: number | null;
}

export interface AgentMetaIntegration {
  connected: boolean;
  wabaId: string | null;
  phoneNumberId: string | null;
  businessAppId: string | null;
  approvedTemplates: string[];
}

export interface AgentChatwootIntegration {
  connected: boolean;
  apiBase: string | null;
  accountId: number | null;
  inboxId: number | null;
  agentbotEnabled: boolean;
  agentbotWebhookSecret: string | null;
}

export interface AgentEasyAppointmentsIntegration {
  connected: boolean;
  baseUrl: string | null;
  apiPath: string | null;
  apiTokenMasked: string | null;
  providerId: number | null;
  serviceId: number | null;
  webhookSecretMasked: string | null;
}

export interface AgentStripeIntegration {
  connected: boolean;
  accountId: string | null;
}

export interface AgentIntegrations {
  meta: AgentMetaIntegration;
  chatwoot: AgentChatwootIntegration;
  easyAppointments: AgentEasyAppointmentsIntegration;
  stripe: AgentStripeIntegration;
}

export interface AgentSettings {
  id: string | null;
  name: string | null;
  planTier: AgentPlanTier | null;
  publicWhatsappPhone: string | null;
  managerWhatsappPhone: string | null;
  paymentRequired: boolean | null;
  doctorConfirmationRequired: boolean | null;
  languages: string[];
  notes: string | null;
  instructions: string | null;
  services: AgentService[];
  integrations: AgentIntegrations;
}

export interface AgentSettingsState {
  data: AgentSettings | null;
  uiFlags: {
    isFetching: boolean;
    isUpdating: boolean;
  };
  error: string | null;
  lastFetchedAt: string | null;
}

export interface RawAgentService {
  id?: string | null;
  service_id?: string | null;
  label?: string | null;
  description?: string | null;
  duration_min?: number | string | null;
  duration?: number | string | null;
  price?: number | string | null;
  currency?: string | null;
  requires_deposit?: boolean | string | number | null;
  deposit_amount?: number | string | null;
  ea_service_id?: number | string | null;
  ea_provider_id?: number | string | null;
}

export interface RawAgentMeta {
  waba_id?: string | null;
  phone_number_id?: string | null;
  verify_token?: string | null;
  business_app_id?: string | null;
  approved_templates?: string[] | null;
}

export interface RawAgentChatwoot {
  api_base?: string | null;
  account_id?: number | string | null;
  inbox_id?: number | string | null;
  agentbot_enabled?: boolean | string | number | null;
  agentbot_webhook_secret?: string | null;
}

export interface RawAgentEasyAppointments {
  base_url?: string | null;
  api_path?: string | null;
  api_token?: string | null;
  provider_id?: number | string | null;
  service_id?: number | string | null;
  webhook_secret?: string | null;
  services?: RawAgentService[] | null;
}

export interface RawAgentStripe {
  connect_account_id?: string | null;
}

export interface RawAgentSettings {
  id?: string | null;
  name?: string | null;
  plan_tier?: AgentPlanTier | string | null;
  public_whatsapp_phone?: string | null;
  manager_whatsapp_phone?: string | null;
  payment_required?: boolean | string | number | null;
  doctor_confirmation_required?: boolean | string | number | null;
  languages?: string[] | null;
  notes?: string | null;
  instructions?: string | null;
  services?: RawAgentService[] | null;
  meta?: RawAgentMeta | null;
  chatwoot?: RawAgentChatwoot | null;
  easy_appointments?: RawAgentEasyAppointments | null;
  stripe?: RawAgentStripe | null;
}

export interface RawAgentSettingsResponse {
  status?: string | null;
  message?: string | null;
  data?: RawAgentSettings | null;
  error?: string | null;
}

export interface AgentSettingsUpdateInput {
  name?: string | null;
  paymentRequired?: boolean | null;
  doctorConfirmationRequired?: boolean | null;
  planTier?: AgentPlanTier | null;
  instructions?: string | null;
}

export interface AgentSettingsUpdatePayload {
  name?: string | null;
  payment_required?: boolean | null;
  doctor_confirmation_required?: boolean | null;
  plan_tier?: AgentPlanTier | null;
  instructions?: string | null;
}
