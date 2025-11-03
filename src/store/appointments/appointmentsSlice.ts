import { createSlice } from '@reduxjs/toolkit';

import type { Appointment, AppointmentsState } from './appointmentsTypes';
import { fetchAppointments } from './appointmentsActions';

const initialState: AppointmentsState = {
  items: [],
  pagination: null,
  agentId: null,
  lastUpdated: null,
  uiFlags: {
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
  },
  error: null,
};

const toEpoch = (appointment: Appointment): number => {
  if (appointment.startAtEpoch !== null && appointment.startAtEpoch !== undefined) {
    return appointment.startAtEpoch;
  }
  if (appointment.startAt) {
    const ms = Date.parse(appointment.startAt);
    if (!Number.isNaN(ms)) {
      return ms / 1000;
    }
  }
  return Number.MAX_SAFE_INTEGER;
};

const dedupeAppointments = (appointments: Appointment[]): Appointment[] => {
  const deduped = new Map<string, Appointment>();
  appointments.forEach(item => {
    deduped.set(item.id, item);
  });
  return Array.from(deduped.values()).sort((a, b) => toEpoch(a) - toEpoch(b));
};

export const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointments: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAppointments.pending, (state, action) => {
        const { append, refresh } = action.meta.arg ?? {};
        if (append) {
          state.uiFlags.isLoadingMore = true;
        } else if (refresh) {
          state.uiFlags.isRefreshing = true;
        } else {
          state.uiFlags.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        const { append } = action.meta.arg ?? {};
        const { items, pagination, generatedAt, agentId } = action.payload;

        const merged = append ? [...state.items, ...items] : items;
        state.items = dedupeAppointments(merged);
        state.pagination = pagination;
        state.agentId = agentId;
        state.lastUpdated = generatedAt;
        state.uiFlags.isLoading = false;
        state.uiFlags.isRefreshing = false;
        state.uiFlags.isLoadingMore = false;
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        const { append, refresh } = action.meta.arg ?? {};
        if (append) {
          state.uiFlags.isLoadingMore = false;
        } else if (refresh) {
          state.uiFlags.isRefreshing = false;
        } else {
          state.uiFlags.isLoading = false;
        }
        state.error =
          (action.payload as string) ??
          action.error.message ??
          'Unable to load appointments. Please try again.';
      });
  },
});

export const { clearAppointments } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
