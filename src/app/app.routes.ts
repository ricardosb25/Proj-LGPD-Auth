import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { RegisterComponent } from "./pages/sign-in/sign-in.component";
import { TwoFaComponent } from "./pages/two-fa/two-fa.component";
import { SuccessComponent } from "./pages/success/success.component";
import { PasswordRecoveryComponent } from "./pages/password-recovery/password-recovery.component";
import { authGuard } from "./guards/auth.guard";
import { guestGuard } from "./guards/guest.guard";
import { TermsOfUseComponent } from "./pages/terms-of-use/terms-of-use.component";

export const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  { path: "sign-in", component: RegisterComponent, canActivate: [guestGuard] },
  { path: "two-fa", component: TwoFaComponent, canActivate: [guestGuard] },
  {
    path: "password-recovery",
    component: PasswordRecoveryComponent,
    canActivate: [guestGuard],
  },
  { path: "success", component: SuccessComponent, canActivate: [authGuard] },
  { path: "**", redirectTo: "/login" },
  { path: "terms-of-use", component: TermsOfUseComponent },
];
