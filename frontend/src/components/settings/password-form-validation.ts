import { passwordIssue } from "@/lib/password/password-issue";

type PasswordFields = {
  newPassword: string;
  confirmPassword: string;
};

export function validatePasswordForm({
  newPassword,
  confirmPassword,
}: PasswordFields): string | null {
  const issue = passwordIssue(newPassword);
  if (issue) return issue;
  if (newPassword !== confirmPassword) {
    return "New passwords don’t match.";
  }
  return null;
}
