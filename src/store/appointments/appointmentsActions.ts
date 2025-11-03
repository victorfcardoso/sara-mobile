import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { fetchAppointmentsFromApi } from './appointmentsService';
import type {
  Appointment,
  FetchAppointmentsArgs,
  FetchAppointmentsResult,
  RawMobileAppointment,
} from './appointmentsTypes';

const mapAppointment = (raw: RawMobileAppointment): Appointment => ({
  id: raw.id,
  agentId: raw.agent_id,
  startAt: raw.start_at,
  endAt: raw.end_at ?? null,
  startAtEpoch: raw.start_at_epoch ?? null,
  status: raw.status,
  serviceName: raw.service_name ?? null,
  customerName: raw.customer_name ?? null,
  customerPhone: raw.customer_phone ?? null,
  metadata: raw.metadata ?? {},
  paymentRequired: Boolean(raw.payment_required),
  paymentStatus: raw.payment_status ?? null,
  paymentTokenUsed: raw.payment_token_used ?? null,
  uid: raw.uid ?? null,
  source: raw.source ?? null,
  location: raw.location ?? null,
  notes: raw.notes ?? null,
});

export const fetchAppointments = createAsyncThunk<
  FetchAppointmentsResult,
  FetchAppointmentsArgs | undefined,
  { state: RootState; rejectValue: string }
>('appointments/fetchAppointments', async (args = {}, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const sessionAgentId = args.agentId ?? state.auth.chatwootSession?.agentId ?? null;

    if (!sessionAgentId) {
      return rejectWithValue('Agent not configured for this user.');
    }

    const response = await fetchAppointmentsFromApi({
      ...args,
      agentId: sessionAgentId,
    });

    const items = response.appointments.map(mapAppointment);

    return {
      items,
      pagination: {
        limit: response.pagination.limit,
        count: response.pagination.count,
        total: response.pagination.total,
        hasMore: response.pagination.has_more,
        nextCursor: response.pagination.next_cursor,
      },
      agentId: response.agent_id,
      generatedAt: response.generated_at,
      append: Boolean(args.append),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load appointments. Please try again.';
    return rejectWithValue(message);
  }
});

export const appointmentsActions = {
  fetchAppointments,
};
