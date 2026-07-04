type ResetPasswordFields = {
  password: string;
  confirm: string;
};

export function validateResetPasswordFields({ password, confirm }: ResetPasswordFields): string | null {
  if (password !== confirm) {
    return "Passwords don't match.";
  }

  return null;
}
