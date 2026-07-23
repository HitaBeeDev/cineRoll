type PasswordFields = {
  newPassword: string;
  confirmPassword: string;
};

export function validatePasswordForm({
  newPassword,
  confirmPassword,
}: PasswordFields): string | null {
  if (newPassword !== confirmPassword) {
    return "New passwords don’t match.";
  }
  return null;
}
