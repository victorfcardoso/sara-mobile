import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import { fetchAppointmentsFromApi } from './appointmentsService';
import type {
  Appointment,
  FetchAppointmentsArgs,
  FetchAppointmentsResult,
  RawMobileAppointment,
} from './appointmentsTypes';

type MetadataRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is MetadataRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const sanitizeMetadata = (raw: RawMobileAppointment['metadata']): MetadataRecord => {
  if (isRecord(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (isRecord(parsed)) {
        return parsed;
      }
    } catch {
      // noop – fall through to empty object when parsing fails
    }
  }
  return {};
};

const coerceServiceCandidate = (candidate: unknown): string | null => {
  if (typeof candidate === 'string') {
    const trimmed = candidate.trim();
    return trimmed.length ? trimmed : null;
  }
  if (isRecord(candidate)) {
    return (
      coerceServiceCandidate(candidate.name) ||
      coerceServiceCandidate(candidate.title) ||
      coerceServiceCandidate(candidate.label)
    );
  }
  return null;
};

const extractServiceName = (raw: RawMobileAppointment, metadata: MetadataRecord): string | null => {
  const nestedServiceDetails = (metadata.service_details ??
    metadata.serviceDetails ??
    metadata.appointment_service) as unknown;

  const candidates: unknown[] = [
    raw.service_name,
    metadata.service_name,
    metadata.service,
    metadata.serviceName,
    metadata.service_title,
    metadata.serviceTitle,
    metadata.ea_service_name,
    metadata.meeting_title,
    nestedServiceDetails,
  ];

  for (const candidate of candidates) {
    const value = coerceServiceCandidate(candidate);
    if (value) {
      return value;
    }
  }

  return null;
};

const mapAppointment = (raw: RawMobileAppointment): Appointment => {
  const metadata = sanitizeMetadata(raw.metadata);

  return {
    id: raw.id,
    agentId: raw.agent_id,
    startAt: raw.start_at,
    endAt: raw.end_at ?? null,
    startAtEpoch: raw.start_at_epoch ?? null,
    status: raw.status,
    serviceName: extractServiceName(raw, metadata),
    customerName: raw.customer_name ?? null,
    customerPhone: raw.customer_phone ?? null,
    metadata,
    paymentRequired: Boolean(raw.payment_required),
    paymentStatus: raw.payment_status ?? null,
    paymentTokenUsed: raw.payment_token_used ?? null,
    uid: raw.uid ?? null,
    source: raw.source ?? null,
    location: raw.location ?? null,
    notes: raw.notes ?? null,
  };
};

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
