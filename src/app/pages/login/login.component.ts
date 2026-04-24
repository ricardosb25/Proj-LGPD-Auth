import { Component, signal, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal("");
  password = signal("");
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.email() || !this.password()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login({ email: this.email(), password: this.password() })
      .subscribe({
        next: (mensagem) => {
          console.log("Sucesso:", mensagem);
          this.isLoading.set(false);
          this.router.navigate(["/two-fa"]);
        },
        error: (erro) => {
          console.error("Falha no login:", erro);
          this.isLoading.set(false);

          if (erro.status === 401 || erro.status === 403) {
            this.errorMessage.set("E-mail ou senha incorretos.");
          } else {
            this.errorMessage.set("Erro ao conectar com o servidor.");
          }
        },
      });
  }
}
