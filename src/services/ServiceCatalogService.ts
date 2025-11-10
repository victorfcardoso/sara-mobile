import axios from 'axios';

import { saraApiService } from './SaraAPIService';

export type ServiceCatalogPayload = {
  label: string;
  description?: string | null;
  durationMin: number;
  price: number;
  currency: string;
  requiresDeposit: boolean;
  depositAmount?: number | null;
  eaServiceId?: number | null;
  eaProviderId?: number | null;
};

const buildHeaders = (agentId?: string | null) => {
  if (agentId) {
    return { 'X-Agent-Id': agentId };
  }
  return undefined;
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { detail?: string; message?: string; error?: string }
      | undefined;
    const detail = responseData?.detail || responseData?.message || responseData?.error;
    if (detail && typeof detail === 'string') {
      return detail;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const formatDecimal = (value: number): string => {
  return value.toFixed(2);
};

const buildPayload = (
  agentId: string,
  input: ServiceCatalogPayload,
  options?: { includeAgentId?: boolean },
) => {
  const normalizedCurrency = (input.currency || 'BRL').trim().toUpperCase();
  const requiresDeposit = Boolean(input.requiresDeposit);
  const appliedDepositAmount =
    requiresDeposit && input.depositAmount != null ? input.depositAmount : input.price;

  const payload: Record<string, unknown> = {
    label: input.label.trim(),
    description: input.description?.trim() || null,
    duration_min: input.durationMin,
    price: formatDecimal(input.price),
    currency: normalizedCurrency || 'BRL',
    requires_deposit: requiresDeposit,
    deposit_amount: requiresDeposit ? formatDecimal(appliedDepositAmount) : null,
    ea_service_id: input.eaServiceId ?? null,
    ea_provider_id: input.eaProviderId ?? null,
  };

  if (options?.includeAgentId !== false) {
    payload.agent_id = agentId;
  }

  return payload;
};

const buildServiceKey = (agentId: string, serviceId: string) => {
  const composite = `${agentId}::${serviceId}`;
  return encodeURIComponent(composite);
};

export class ServiceCatalogService {
  static async create(params: {
    agentId: string;
    payload: ServiceCatalogPayload;
  }): Promise<void> {
    const { agentId, payload } = params;
    try {
      await saraApiService.post(
        '/crm/services',
        buildPayload(agentId, payload, { includeAgentId: true }),
        { headers: buildHeaders(agentId) },
      );
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create service.'));
    }
  }

  static async update(params: {
    agentId: string;
    serviceId: string;
    payload: ServiceCatalogPayload;
  }): Promise<void> {
    const { agentId, serviceId, payload } = params;
    const serviceKey = buildServiceKey(agentId, serviceId);

    try {
      await saraApiService.patch(
        `/crm/services/${serviceKey}`,
        buildPayload(agentId, payload, { includeAgentId: false }),
        { headers: buildHeaders(agentId) },
      );
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update service.'));
    }
  }

  static async remove(params: { agentId: string; serviceId: string }): Promise<void> {
    const { agentId, serviceId } = params;
    const serviceKey = buildServiceKey(agentId, serviceId);

    try {
      await saraApiService.delete(`/crm/services/${serviceKey}`, {
        headers: buildHeaders(agentId),
      });
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete service.'));
    }
  }
}
