import { ResetPasswordErrorMessage } from "./reset-password-error-message";
import { ResetPasswordField } from "./reset-password-field";
import { ResetPasswordSubmitButton } from "./reset-password-submit-button";

type ResetPasswordFieldsProps = {
  password: string;
  confirm: string;
  error: string | null;
  isLoading: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onSubmit: () => void;
};

export function ResetPasswordFields({
  password,
  confirm,
  error,
  isLoading,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
}: ResetPasswordFieldsProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      className="mt-6 flex flex-col gap-3"
    >
      <ResetPasswordField
        id="reset-password"
        label="New password"
        value={password}
        onChange={onPasswordChange}
        placeholder="At least 8 characters"
      />
      <ResetPasswordField
        id="reset-confirm"
        label="Confirm new password"
        value={confirm}
        onChange={onConfirmChange}
        placeholder="Re-enter your password"
      />

      <ResetPasswordErrorMessage error={error} />
      <ResetPasswordSubmitButton isLoading={isLoading} />
    </form>
  );
}
