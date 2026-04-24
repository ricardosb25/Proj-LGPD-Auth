import {
  Component,
  signal,
  ViewChildren,
  QueryList,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-two-fa",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./two-fa.component.html",
  styleUrls: ["./two-fa.component.scss"],
})
export class TwoFaComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Input() title: string = "Verificação de Segurança";
  @Input() subtitle: string =
    "Enviamos um código de 6 dígitos para o seu e-mail.";

  @Input() isRecoveryMode: boolean = false;

  @Output() codeSubmitted = new EventEmitter<string>();

  @ViewChildren("otpInput") inputs!: QueryList<ElementRef>;

  codeDigits = signal<string[]>(["", "", "", "", "", ""]);
  isLoading = signal(false);
  timeLeft = signal(30);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.startTimer();
  }

  trackByIndex(index: number): number {
    return index;
  }

  onInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;
    this.updateDigit(index, value.slice(-1));
    if (value && index < 5) this.focusInput(index + 1);
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === "Backspace" && !this.codeDigits()[index] && index > 0) {
      this.focusInput(index - 1);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData
      ?.getData("text")
      ?.slice(0, 6)
      .replace(/\D/g, "");
    if (pastedData) {
      const newDigits = [...this.codeDigits()];
      for (let i = 0; i < pastedData.length; i++) newDigits[i] = pastedData[i];
      this.codeDigits.set(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      this.focusInput(nextFocus);
    }
  }

  private updateDigit(index: number, value: string) {
    const current = [...this.codeDigits()];
    current[index] = value;
    this.codeDigits.set(current);
  }

  private focusInput(index: number) {
    const inputElements = this.inputs.toArray();
    if (inputElements[index]) inputElements[index].nativeElement.focus();
  }

  get isCodeComplete(): boolean {
    return this.codeDigits().every((digit) => digit !== "");
  }

  onSubmit() {
    if (!this.isCodeComplete) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const finalCode = this.codeDigits().join("");

    if (this.isRecoveryMode) {
      this.codeSubmitted.emit(finalCode);
      this.isLoading.set(false);
    } else {
      this.authService.verify2Fa(finalCode).subscribe({
        next: (response) => {
          console.log("Autenticado com sucesso!", response);
          this.isLoading.set(false);
          this.router.navigate(["/success"]);
        },
        error: (erro) => {
          console.error("Erro ao verificar código:", erro);
          this.isLoading.set(false);
          this.errorMessage.set(
            "Código inválido ou expirado. Tente novamente.",
          );
          this.codeDigits.set(["", "", "", "", "", ""]);
          this.focusInput(0);
        },
      });
    }
  }

  resendCode() {
    if (this.timeLeft() > 0) return;

    console.log("Solicitando novo código...");

    this.timeLeft.set(30);
    this.startTimer();
  }

  private startTimer() {
    const interval = setInterval(() => {
      if (this.timeLeft() > 0) {
        this.timeLeft.update((time) => time - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }
}
