import { saraApiService } from '@/services/SaraAPIService';

import type { ManageableAgent } from './manageableAgentTypes';

type RawManageableAgent = Record<string, unknown>;

const coerceString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return null;
};

const coerceBoolean = (value: unknown): boolean | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }
  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }
  return null;
};

const mapManageableAgent = (raw: RawManageableAgent): ManageableAgent | null => {
  const id = coerceString(raw.id);
  if (!id) {
    return null;
  }

  return {
    id,
    name: coerceString(raw.name) ?? id,
    paymentRequired: coerceBoolean(raw.payment_required),
    doctorConfirmationRequired: coerceBoolean(raw.doctor_confirmation_required),
    publicWhatsappPhone: coerceString(raw.public_whatsapp_phone),
    managerWhatsappPhone: coerceString(raw.manager_whatsapp_phone),
    twilioWhatsappPhone: coerceString(raw.twilio_whatsapp_phone),
    userWhatsappPhone: coerceString(raw.user_whatsapp_phone),
    instructions: coerceString(raw.instructions),
  };
};

export class ManageableAgentService {
  static async fetchAgents(): Promise<ManageableAgent[]> {
    const response = await saraApiService.get<RawManageableAgent[]>('/agents/manageable');
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload
      .map(mapManageableAgent)
      .filter((agent): agent is ManageableAgent => Boolean(agent));
  }
}
