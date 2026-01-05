import axios from 'axios';

import { saraApiService } from './SaraAPIService';

export interface BreakWindow {
  start: string;
  end: string;
}

export interface WorkingPlanBlock {
  start: string;
  end: string;
  breaks?: BreakWindow[] | null;
}

export interface WeeklySnapshot {
  providerId: string;
  workingPlan: Record<string, WorkingPlanBlock | null>;
  workingPlanExceptions: Record<string, WorkingPlanBlock | null>;
  timezone: string | null;
  service: {
    id: string | null;
    name: string | null;
    duration: number | null;
  } | null;
}

export interface WeeklyUpdatePayload {
  providerId: string;
  workingPlan: Record<string, WorkingPlanBlock | null>;
  workingPlanExceptions?: Record<string, WorkingPlanBlock | null>;
}

export interface UnavailabilityPayload {
  providerId: string;
  start: string;
  end: string;
  notes?: string | null;
}

const buildHeaders = (agentId?: string | null) => {
  if (agentId) {
    return { 'X-Agent-Id': agentId };
  }
  return undefined;
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string; message?: string } | undefined)
      ?.detail;
    const message =
      detail ||
      (error.response?.data as { message?: string; error?: string } | undefined)?.message ||
      (error.response?.data as { error?: string } | undefined)?.error;
    if (message && typeof message === 'string') {
      return message;
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

export class OfficeHoursService {
  static async fetchWeekly(params: {
    providerId: string;
    agentId?: string | null;
  }): Promise<WeeklySnapshot> {
    const { providerId, agentId } = params;
    try {
      const response = await saraApiService.get(`/office-hours/weekly`, {
        params: { provider_id: providerId },
        headers: buildHeaders(agentId),
      });
      const data = response.data as any;
      if (!data) {
        throw new Error('Office hours not available.');
      }
      const workingPlan = (data.working_plan ?? {}) as Record<string, WorkingPlanBlock | null>;
      const workingPlanExceptions = (data.working_plan_exceptions ?? {}) as Record<
        string,
        WorkingPlanBlock | null
      >;
      const serviceRaw = data.service ?? null;
      return {
        providerId: String(data.provider_id ?? providerId),
        workingPlan,
        workingPlanExceptions,
        timezone: data.timezone ?? null,
        service: serviceRaw
          ? {
              id: serviceRaw.id != null ? String(serviceRaw.id) : null,
              name: serviceRaw.name ?? null,
              duration:
                typeof serviceRaw.duration === 'number'
                  ? serviceRaw.duration
                  : Number.isFinite(Number(serviceRaw?.duration))
                    ? Number(serviceRaw.duration)
                    : null,
            }
          : null,
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to load office hours.'));
    }
  }

  static async updateWeekly(params: {
    payload: WeeklyUpdatePayload;
    agentId?: string | null;
  }): Promise<void> {
    const { payload, agentId } = params;
    try {
      await saraApiService.put(
        `/office-hours/weekly`,
        {
          provider_id: payload.providerId,
          working_plan: payload.workingPlan,
          working_plan_exceptions: payload.workingPlanExceptions ?? {},
        },
        {
          headers: buildHeaders(agentId),
        },
      );
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update office hours.'));
    }
  }

  static async createUnavailability(params: {
    payload: UnavailabilityPayload;
    agentId?: string | null;
  }): Promise<void> {
    const { payload, agentId } = params;
    try {
      await saraApiService.post(
        `/office-hours/block`,
        {
          provider_id: payload.providerId,
          start: payload.start,
          end: payload.end,
          notes: payload.notes ?? undefined,
        },
        {
          headers: buildHeaders(agentId),
        },
      );
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create unavailability.'));
    }
  }

  static async probe(params: {
    providerId: string;
    serviceId: string;
    date: string;
    agentId?: string | null;
  }): Promise<string[]> {
    const { providerId, serviceId, date, agentId } = params;
    try {
      const response = await saraApiService.get(`/office-hours/probe`, {
        params: {
          provider_id: providerId,
          service_id: serviceId,
          date,
        },
        headers: buildHeaders(agentId),
      });
      const data = response.data as any;
      if (Array.isArray(data)) {
        return data
          .map(item => (typeof item === 'string' ? item : String(item.time ?? item.slot ?? '')))
          .filter(Boolean);
      }
      if (Array.isArray(data?.availabilities)) {
        return data.availabilities
          .map((item: any) => (typeof item === 'string' ? item : (item?.time ?? item?.slot ?? '')))
          .filter((item: string) => item && item.length > 0);
      }
      if (Array.isArray(data?.data)) {
        return data.data
          .map((item: any) => (typeof item === 'string' ? item : (item?.time ?? item?.slot ?? '')))
          .filter((item: string) => item && item.length > 0);
      }
      return [];
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to load availability.'));
    }
  }
}
