import { PasswordInput } from "@/components/auth/password-input";
import { cn } from "@/lib/utils";

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
    <form onSubmit={(event) => handleSubmit(event, onSubmit)} className="mt-6 flex flex-col gap-3">
      <PasswordField
        id="reset-password"
        label="New password"
        value={password}
        onChange={onPasswordChange}
        placeholder="At least 8 characters"
      />
      <PasswordField
        id="reset-confirm"
        label="Confirm new password"
        value={confirm}
        onChange={onConfirmChange}
        placeholder="Re-enter your password"
      />

      {error !== null && <p className="text-xs text-[#ff7068]">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "h-12 w-full rounded-xl bg-[#e8453c]",
          "text-sm font-semibold text-[#F5F5F0]",
          "shadow-[0_10px_28px_rgba(232,69,60,0.16)] transition hover:bg-[#f2554c]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          "disabled:cursor-not-allowed disabled:bg-[#8f302b] disabled:text-[#c9a1a0] disabled:shadow-none",
        )}
      >
        {isLoading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function PasswordField({ id, label, value, placeholder, onChange }: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium text-[#b8b8c6]">
        {label}
      </label>
      <PasswordInput
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
        required
      />
    </div>
  );
}

function handleSubmit(event: React.FormEvent, onSubmit: () => void) {
  event.preventDefault();
  void onSubmit();
}
