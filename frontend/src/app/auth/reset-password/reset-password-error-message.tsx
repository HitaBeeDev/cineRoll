type ResetPasswordErrorMessageProps = {
  error: string | null;
};

export function ResetPasswordErrorMessage({ error }: ResetPasswordErrorMessageProps) {
  if (error === null) return null;

  return <p className="text-xs text-[#ff7068]">{error}</p>;
}
