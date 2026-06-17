# Authentication Gap Analysis

## Web implementation (kickoff-web)
- Routes: `/auth` (sign‑in), `/auth/signup` (sign‑up), `/auth/forgot-password` (reset)
- Uses `useAuth` hook, `AuthContext` provider, and server‑side validation via Zod schemas.
- API endpoints: `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/forgot-password`.
- Role handling: upon login, user role is stored in JWT and accessed via `useAuth().role`.

## Mobile implementation (kickoff-mobile)
- Existing screens: `AuthScreen`, `SignIn`, `SignUp`, `ForgotPassword` (placeholders present).
- Auth hook (`useAuth`) exists but only implements sign‑in; sign‑up and password reset logic are missing.
- API calls for login are present (`authService.login`). No services for signup or password reset.
- Role information is stored in Redux `auth` slice after login.

## Gap Summary
| Aspect | Status | Notes |
|--------|--------|-------|
| Sign‑in flow | Complete | Works, but needs thorough testing. |
| Sign‑up flow | Missing | No UI or service implementation. |
| Password reset | Missing | No screen or endpoint call. |
| Role handling | Complete | Role stored after login, but need to verify restriction enforcement on other screens. |
| Validation (Zod/Yup) | Partial | Web uses Zod schemas; mobile currently uses simple client‑side checks. |

## Recommendations
- Implement `SignUp` screen mirroring web UI, reusing the same Zod schema via a shared `types/` folder.
- Add `ForgotPassword` screen and corresponding `authService.resetPassword` call.
- Pull validation schemas from `kickoff-web` into a shared `shared-schemas` directory within mobile.
- Write unit tests for the new auth flows.
