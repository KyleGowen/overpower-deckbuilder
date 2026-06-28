# PasswordInput

Labelled password field with a show/hide toggle. Used by the login/signup forms and the
profile menu's change-password subform.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `id` | `string` | – | Input id; the `<label>` is associated via `htmlFor`. |
| `label` | `string` | – | Visible field label. |
| `value` | `string` | – | Controlled value. |
| `onChange` | `(value: string) => void` | – | Receives the raw string (not the event). |
| `autoComplete` | `string` | `'new-password'` | Set `'current-password'` for login. |
| `placeholder` | `string` | `'Enter password'` | Input placeholder. |

## Notes
- Internal `visible` state flips the input `type` between `password` and `text`. The eye
  button is `type="button"` (never submits) with an `aria-label` that reflects state
  ("Show password" / "Hide password") and uses `IconEye`/`IconEyeOff` from
  [`../icons`](../icons.tsx).
- Presentational/controlled only — validation (length, match) lives in the parent form.
- Styling in [`PasswordInput.css`](./PasswordInput.css).
