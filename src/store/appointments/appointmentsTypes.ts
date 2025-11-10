export interface RawMobileAppointment {
  id: string;
  agent_id: string;
  start_at: string;
  end_at?: string | null;
  start_at_epoch?: number | null;
  status: string;
  service_name?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  metadata?: Record<string, unknown> | null;
  payment_required?: boolean | null;
  payment_status?: string | null;
  payment_token_used?: boolean | null;
  uid?: string | null;
  source?: string | null;
  location?: string | null;
  notes?: string | null;
  provider_name?: string | null;
  duration_minutes?: number | null;
}

export interface MobileAppointmentsResponse {
  agent_id: string;
  generated_at: string;
  appointments: RawMobileAppointment[];
  pagination: {
    limit: number;
    count: number;
    total: number;
    has_more: boolean;
    next_cursor: string | null;
  };
}

export interface Appointment {
  id: string;
  agentId: string;
  startAt: string;
  endAt?: string | null;
  startAtEpoch?: number | null;
  status: string;
  serviceName?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  metadata: Record<string, unknown>;
  paymentRequired: boolean;
  paymentStatus?: string | null;
  paymentTokenUsed?: boolean | null;
  uid?: string | null;
  source?: string | null;
  location?: string | null;
  notes?: string | null;
  providerName?: string | null;
  durationMinutes?: number | null;
}

export interface AppointmentPagination {
  limit: number;
  count: number;
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface FetchAppointmentsArgs {
  cursor?: string | null;
  limit?: number;
  status?: string[];
  startAtGte?: string;
  startAtLte?: string;
  agentId?: string | null;
  append?: boolean;
  refresh?: boolean;
}

export interface FetchAppointmentsResult {
  items: Appointment[];
  pagination: AppointmentPagination;
  agentId: string;
  generatedAt: string;
  append: boolean;
}

export interface AppointmentsState {
  items: Appointment[];
  pagination: AppointmentPagination | null;
  agentId: string | null;
  lastUpdated: string | null;
  uiFlags: {
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
  };
  error: string | null;
}
