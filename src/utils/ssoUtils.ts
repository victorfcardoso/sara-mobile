import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AppDispatch } from '@/store';
import { showToast } from './toastUtils';
import i18n from '@/i18n';
import { appConfig } from '@/config/appConfig';

WebBrowser.maybeCompleteAuthSession();

export interface SsoLoginParams {
  email?: string;
  sso_auth_token?: string;
  error?: string;
}

export class SsoUtils {
  /**
   * Initiates SSO login flow using Expo AuthSession
   * @param installationUrl - The Chatwoot installation URL
   * @returns Promise with SSO login result
   */
  static async loginWithSSO(
    installationUrl: string,
  ): Promise<WebBrowser.WebBrowserAuthSessionResult> {
    try {
      // Create redirect URI with custom scheme
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: appConfig.scheme,
        path: 'sso/callback',
      });

      // Construct SSO auth URL with mobile redirect URI parameter
      const authUrl = `${installationUrl}app/login/sso?target=mobile`;

      // Start auth session
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      return result;
    } catch (error) {
      console.error('SSO login error:', error);
      throw error;
    }
  }

  /**
   * Handles SSO callback parameters and completes authentication
   * @param params - Parameters from SSO callback
   * @param dispatch - Redux dispatch function
   * @returns Promise<boolean> - Success status
   */
  static async handleSsoCallback(
    _params: SsoLoginParams,
    _dispatch: AppDispatch,
  ): Promise<boolean> {
    showToast({
      message: i18n.t('LOGIN.SSO_AUTH_FAILED'),
    });
    return false;
  }

  /**
   * Parses URL parameters from SSO callback
   * @param url - The callback URL
   * @returns Parsed parameters
   */
  static parseCallbackUrl(url: string): SsoLoginParams {
    try {
      //  The URL will be in the format <scheme>://auth/saml?email=<email>&sso_auth_token=<auth_token>&error=<error>
      const urlObj = new URL(url);
      const params: SsoLoginParams = {};

      // Extract parameters from URL and decode email properly
      const rawEmail = urlObj.searchParams.get('email');
      params.email = rawEmail ? decodeURIComponent(rawEmail) : undefined;
      params.sso_auth_token = urlObj.searchParams.get('sso_auth_token') || undefined;
      params.error = urlObj.searchParams.get('error') || undefined;

      return params;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return {};
    }
  }
}
