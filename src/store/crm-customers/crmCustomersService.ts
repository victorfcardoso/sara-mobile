import { AxiosResponse } from 'axios';

import { saraApiService } from '@/services/SaraAPIService';

import type { CrmCustomer, RawCrmCustomer } from './crmCustomersTypes';

const DEFAULT_PAGE_SIZE = 100;

const normalizeString = (value?: string | null): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const mapRawCustomer = (raw: RawCrmCustomer): CrmCustomer => {
  return {
    id: raw.id ?? raw.whatsapp_phone,
    whatsappPhone: raw.whatsapp_phone ?? raw.id ?? '',
    fullName: normalizeString(raw.full_name),
    email: normalizeString(raw.email),
    awaitingName: Boolean(raw.awaiting_name),
    nameSource: normalizeString(raw.name_source),
    firstSeen: normalizeString(raw.first_seen),
    latestSeen: normalizeString(raw.latest_seen),
    whatsappUpdatedAt: normalizeString(raw.whatsapp_updated_at),
    calcomUpdatedAt: normalizeString(raw.calcom_updated_at),
    userId: normalizeString(raw.user_id),
    botWhatsappPhone: normalizeString(raw.bot_whatsapp_phone),
    city: normalizeString(raw.city),
    state: normalizeString(raw.state),
    country: normalizeString(raw.country),
    zipCode: normalizeString(raw.zip_code),
    address: normalizeString(raw.address),
    createdAt: normalizeString(raw.created_at),
    updatedAt: normalizeString(raw.updated_at),
    threadId: normalizeString(raw.thread_id),
  };
};

const parseContentRange = (headerValue?: string | null) => {
  if (!headerValue) {
    return null;
  }
  const match = headerValue.match(/\s*(\d+)-(\d+)\/(\d+)\s*$/);
  if (!match) {
    return null;
  }
  const [, startStr, endStr, totalStr] = match;
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);
  const total = parseInt(totalStr, 10);
  if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(total)) {
    return null;
  }
  return { start, end, total };
};

export interface FetchCrmCustomersApiArgs {
  offset: number;
  limit?: number;
  search?: string;
}

export interface FetchCrmCustomersApiResult {
  customers: CrmCustomer[];
  start: number;
  end: number;
  total: number;
}

export class CrmCustomersService {
  static readonly DEFAULT_PAGE_SIZE = DEFAULT_PAGE_SIZE;

  static async fetchCustomers({
    offset,
    limit = DEFAULT_PAGE_SIZE,
    search,
  }: FetchCrmCustomersApiArgs): Promise<FetchCrmCustomersApiResult> {
    const safeLimit = Math.max(1, limit);
    const rangeEnd = offset + safeLimit - 1;
    const params: Record<string, string> = {
      sort: '["latest_seen","DESC"]',
      range: `[${offset}, ${rangeEnd}]`,
      filter: '{}',
    };

    if (search && search.trim().length > 0) {
      params.filter = JSON.stringify({ q: search.trim() });
    }

    const response: AxiosResponse<RawCrmCustomer[]> = await saraApiService.get('/crm/customers', {
      params,
    });

    const range = parseContentRange((response.headers?.['content-range'] ?? null) as string | null);

    const customers = (response.data ?? []).map(mapRawCustomer);

    const start = range?.start ?? offset;
    const end = range?.end ?? (customers.length > 0 ? start + customers.length - 1 : offset - 1);
    const total = range?.total ?? (range ? range.total : customers.length);

    return {
      customers,
      start,
      end,
      total,
    };
  }
}
