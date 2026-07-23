import { signOut } from "next-auth/react";

/** Sign out and return to the home page. */
export function signOutToHome() {
  void signOut({ callbackUrl: "/" });
}
