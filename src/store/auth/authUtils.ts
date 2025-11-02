import { AxiosError } from 'axios';
import { showToast } from '@/utils/toastUtils';
import I18n from '@/i18n';
import type { ApiErrorResponse } from './authTypes';

export const handleApiError = (error: unknown, customErrorMsg?: string): ApiErrorResponse => {
  const axiosError = error as AxiosError<ApiErrorResponse & { message?: string; error?: string }>;
  const response = axiosError.response;

  if (response?.data) {
    const data = response.data;
    const collectedErrors: string[] = [];

    if (Array.isArray(data.errors) && data.errors.length) {
      collectedErrors.push(...data.errors.filter(Boolean) as string[]);
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      collectedErrors.push(data.message.trim());
    }

    const legacyError = (data as unknown as { error?: string }).error;
    if (legacyError && legacyError.trim()) {
      collectedErrors.push(legacyError.trim());
    }

    if (collectedErrors.length) {
      showToast({ message: collectedErrors[0] });
      return { success: false, errors: collectedErrors, message: collectedErrors[0] };
    }
  }

  const fallback = customErrorMsg ?? (
    error instanceof Error && error.message ? error.message : I18n.t('ERRORS.COMMON_ERROR')
  );
  showToast({ message: fallback });
  return { success: false, errors: [fallback], message: fallback };
};
