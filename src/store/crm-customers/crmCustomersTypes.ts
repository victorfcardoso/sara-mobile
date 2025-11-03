import { EntityState } from '@reduxjs/toolkit';

export interface RawCrmCustomer {
  id: string;
  whatsapp_phone: string;
  full_name?: string | null;
  email?: string | null;
  awaiting_name?: boolean;
  name_source?: string | null;
  first_seen?: string | null;
  latest_seen?: string | null;
  whatsapp_updated_at?: string | null;
  calcom_updated_at?: string | null;
  user_id?: string | null;
  bot_whatsapp_phone?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zip_code?: string | null;
  address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  thread_id?: string | null;
}

export interface CrmCustomer {
  id: string;
  whatsappPhone: string;
  fullName: string | null;
  email: string | null;
  awaitingName: boolean;
  nameSource: string | null;
  firstSeen: string | null;
  latestSeen: string | null;
  whatsappUpdatedAt: string | null;
  calcomUpdatedAt: string | null;
  userId: string | null;
  botWhatsappPhone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  address: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  threadId: string | null;
}

export interface CrmCustomersPagination {
  start: number;
  end: number;
  total: number;
  hasMore: boolean;
  pageSize: number;
}

export interface CrmCustomersUIFlags {
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
}

export interface CrmCustomersState extends EntityState<CrmCustomer> {
  uiFlags: CrmCustomersUIFlags;
  pagination: CrmCustomersPagination;
  error: string | null;
  lastFetchedAt: string | null;
  searchQuery: string;
}

export interface FetchCrmCustomersArgs {
  refresh?: boolean;
  append?: boolean;
  search?: string;
  limit?: number;
}

export interface FetchCrmCustomersResult {
  customers: CrmCustomer[];
  pagination: CrmCustomersPagination;
  search?: string;
  append?: boolean;
}
