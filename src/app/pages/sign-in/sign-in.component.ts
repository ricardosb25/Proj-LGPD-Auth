import { Component, signal, computed, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = signal("");
  email = signal("");
  password = signal("");
  confirmPassword = signal("");

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  passwordsMatch = computed(() => {
    const pwd = this.password();
    const confirmPwd = this.confirmPassword();
    return confirmPwd === "" || pwd === confirmPwd;
  });

  isFormValid = computed(() => {
    return (
      this.name() &&
      this.email() &&
      this.password() &&
      this.confirmPassword() &&
      this.passwordsMatch()
    );
  });

  onSubmit() {
    if (!this.isFormValid()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const userDto = {
      name: this.name(),
      email: this.email(),
      password: this.password(),
    };

    this.authService.register(userDto).subscribe({
      next: (response) => {
        console.log("Conta criada com sucesso:", response);
        this.isLoading.set(false);
        this.router.navigate(["/login"]);
      },
      error: (erro) => {
        console.error("Erro ao criar conta:", erro);
        this.isLoading.set(false);

        if (erro.status === 400 || erro.status === 409) {
          this.errorMessage.set(
            "Este e-mail já está em uso ou os dados são inválidos.",
          );
        } else {
          this.errorMessage.set(
            "Erro de conexão com o servidor. Tente novamente mais tarde.",
          );
        }
      },
    });
  }
}
