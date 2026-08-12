// Safari's "passwordrules" attribute tells Keychain what password policy a
// field expects, so its suggested/autofilled password actually satisfies
// our own strength check instead of a generic default. Not in React's
// built-in typings since it's a non-standard (WebKit-only) attribute.
// https://developer.apple.com/documentation/security/customizing-password-autofill-rules
import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- must match InputHTMLAttributes's own generic signature to merge
  interface InputHTMLAttributes<T> {
    passwordrules?: string;
  }
}
