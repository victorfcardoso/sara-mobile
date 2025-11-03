import { saraApiService } from '@/services/SaraAPIService';
import type { FetchAppointmentsArgs, MobileAppointmentsResponse } from './appointmentsTypes';

const sanitizeParams = (params: FetchAppointmentsArgs): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if (params.limit) {
    payload.limit = params.limit;
  }
  if (params.status?.length) {
    payload.status = params.status.join(',');
  }
  if (params.cursor) {
    payload.start_at_gte = params.cursor;
  } else if (params.startAtGte) {
    payload.start_at_gte = params.startAtGte;
  }
  if (params.startAtLte) {
    payload.start_at_lte = params.startAtLte;
  }
  if (params.agentId) {
    payload.agent_id = params.agentId;
  }

  return payload;
};

export const fetchAppointmentsFromApi = async (
  params: FetchAppointmentsArgs,
): Promise<MobileAppointmentsResponse> => {
  const response = await saraApiService.get<MobileAppointmentsResponse>(
    '/chatwoot/mobile/appointments',
    {
      params: sanitizeParams(params),
    },
  );
  return response.data;
};
