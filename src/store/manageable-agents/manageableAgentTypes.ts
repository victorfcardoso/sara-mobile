export interface ManageableAgent {
  id: string;
  name: string;
  paymentRequired: boolean | null;
  doctorConfirmationRequired: boolean | null;
  publicWhatsappPhone: string | null;
  managerWhatsappPhone: string | null;
  twilioWhatsappPhone: string | null;
  userWhatsappPhone: string | null;
  instructions: string | null;
}

export interface ManageableAgentsState {
  data: ManageableAgent[];
  uiFlags: {
    isFetching: boolean;
    error: string | null;
  };
  lastFetchedAt: string | null;
}
