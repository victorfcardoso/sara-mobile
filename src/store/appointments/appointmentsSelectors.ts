import type { RootState } from '@/store';

export const selectAppointmentsState = (state: RootState) => state.appointments;

export const selectAppointmentsList = (state: RootState) => selectAppointmentsState(state).items;

export const selectAppointmentsPagination = (state: RootState) =>
  selectAppointmentsState(state).pagination;

export const selectAppointmentsAgentId = (state: RootState) =>
  selectAppointmentsState(state).agentId;

export const selectAppointmentsLastUpdated = (state: RootState) =>
  selectAppointmentsState(state).lastUpdated;

export const selectAppointmentsUiFlags = (state: RootState) =>
  selectAppointmentsState(state).uiFlags;

export const selectAppointmentsError = (state: RootState) => selectAppointmentsState(state).error;
