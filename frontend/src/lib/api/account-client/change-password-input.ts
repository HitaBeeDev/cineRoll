export type ChangePasswordInput = {
  /** Omitted for OAuth-only accounts that have no existing hash to verify. */
  currentPassword?: string;
  newPassword: string;
};
