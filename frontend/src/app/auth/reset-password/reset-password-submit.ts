import type { FormEvent } from "react";

export function handleResetPasswordSubmit(event: FormEvent, onSubmit: () => void) {
  event.preventDefault();
  void onSubmit();
}
