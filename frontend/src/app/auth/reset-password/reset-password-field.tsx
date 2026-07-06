import { PasswordInput } from "@/components/auth/password-input";

type ResetPasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export function ResetPasswordField({ id, label, value, placeholder, onChange }: ResetPasswordFieldProps) {
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
