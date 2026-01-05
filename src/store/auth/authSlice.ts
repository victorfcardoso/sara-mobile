import { createSlice } from '@reduxjs/toolkit';
import { authActions } from './authActions';
import { User } from '@/types/User';
import type { ChatwootSession, SaraTokens } from './authTypes';
export interface AuthState {
  user: User | null;
  saraTokens: SaraTokens | null;
  chatwootSession: ChatwootSession | null;
  uiFlags: {
    isLoggingIn: boolean;
    isResettingPassword: boolean;
    isSwitchingAgent: boolean;
  };
  error: string | null;
}
const initialState: AuthState = {
  user: null,
  saraTokens: null,
  chatwootSession: null,
  uiFlags: {
    isLoggingIn: false,
    isResettingPassword: false,
    isSwitchingAgent: false,
  },
  error: null,
};
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      // in rootReducer, there is an action to CLEAR the complete Redux Store's state
    },
    resetAuth: state => {
      state.user = null;
      state.saraTokens = null;
      state.chatwootSession = null;
      state.error = null;
      state.uiFlags = {
        isLoggingIn: false,
        isResettingPassword: false,
        isSwitchingAgent: false,
      };
    },
    clearAuthError: state => {
      state.error = null;
    },
    setCurrentUserAvailability(state, action) {
      const { users } = action.payload;
      const userId = state.user?.id;

      // Only proceed if we have a valid user and matching availability data
      if (!userId || !users[userId] || !state.user?.accounts) {
        return;
      }

      const newAvailability = users[userId];
      let needsUpdate = false;

      // Update the accounts array with the new availability
      const updatedAccounts = state.user.accounts.map(account => {
        if (account.id === state.user?.account_id) {
          // Since this event triggers frequently, we should verify if a state update is necessary to prevent unnecessary component re-renders.
          const shouldUpdateAccount =
            !account.availability || // availability doesn't exist
            account.availability !== newAvailability || // availability doesn't match
            account.availability_status !== newAvailability; // availability_status doesn't match
          if (shouldUpdateAccount) {
            needsUpdate = true;
            return {
              ...account,
              availability: newAvailability,
              availability_status: newAvailability,
            };
          }
        }
        return account;
      });
      if (needsUpdate) {
        state.user = {
          ...state.user,
          accounts: updatedAccounts,
        };
      }
    },
    setAccount: (state, action) => {
      if (state.user) {
        state.user.account_id = action.payload;
      }
    },
    updateSaraTokens: (state, action) => {
      state.saraTokens = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(authActions.login.pending, state => {
        state.uiFlags.isLoggingIn = true;
        state.error = null;
      })
      .addCase(authActions.login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.saraTokens = action.payload.saraTokens;
        state.chatwootSession = action.payload.chatwootSession;
        state.uiFlags.isLoggingIn = false;
        state.error = null;
      })
      .addCase(authActions.getProfile.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          ...action.payload,
        } as User;
      })
      .addCase(authActions.login.rejected, (state, action) => {
        state.uiFlags.isLoggingIn = false;
        state.error = action.payload?.errors[0] ?? null;
      })
      .addCase(authActions.resetPassword.pending, state => {
        state.uiFlags.isResettingPassword = true;
        state.error = null;
      })
      .addCase(authActions.resetPassword.fulfilled, (state, action) => {
        state.uiFlags.isResettingPassword = false;
        state.error = null;
      })
      .addCase(authActions.resetPassword.rejected, (state, action) => {
        state.uiFlags.isResettingPassword = false;
      })
      .addCase(authActions.updateAvailability.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          ...action.payload.user,
        };
      })
      .addCase(authActions.switchAgent.pending, state => {
        state.uiFlags.isSwitchingAgent = true;
        state.error = null;
      })
      .addCase(authActions.switchAgent.fulfilled, (state, action) => {
        state.uiFlags.isSwitchingAgent = false;
        state.error = null;
        state.user = action.payload.user;
        state.chatwootSession = action.payload.chatwootSession;
      })
      .addCase(authActions.switchAgent.rejected, (state, action) => {
        state.uiFlags.isSwitchingAgent = false;
        state.error =
          action.payload?.message ??
          (Array.isArray(action.payload?.errors) ? (action.payload?.errors[0] ?? null) : null);
      });
  },
});
export const { logout, setAccount, resetAuth, setCurrentUserAvailability, clearAuthError, updateSaraTokens } =
  authSlice.actions;
export default authSlice.reducer;
