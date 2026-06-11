import { UIComponent } from "./UIComponent";
import { login, register } from "../api/auth";

interface AuthCallbacks {
  onAuthenticated: () => void;
  onGuest: () => void;
}

export class Auth extends UIComponent {
  private loginForm: HTMLFormElement;
  private registerForm: HTMLFormElement;
  private tabLogin: HTMLButtonElement;
  private tabRegister: HTMLButtonElement;
  private errorEl: HTMLParagraphElement;

  constructor(callbacks: AuthCallbacks) {
    super("div");
    this.root.id = "ui-auth";
    this.root.innerHTML = `
      <div class="ui-auth-card">
        <h1>Mini Golf</h1>
        <div class="ui-auth-tabs">
          <button type="button" id="ui-auth-tab-login" class="active">Connexion</button>
          <button type="button" id="ui-auth-tab-register">Inscription</button>
        </div>
        <form id="ui-auth-login" novalidate>
          <input name="email" type="email" placeholder="Email" required autocomplete="email" />
          <input name="password" type="password" placeholder="Mot de passe" required autocomplete="current-password" />
          <button type="submit">Se connecter</button>
        </form>
        <form id="ui-auth-register" hidden novalidate>
          <input name="email" type="email" placeholder="Email" required autocomplete="email" />
          <input name="username" type="text" placeholder="Nom d'utilisateur" required autocomplete="username" />
          <input name="password" type="password" placeholder="Mot de passe" required autocomplete="new-password" />
          <button type="submit">S'inscrire</button>
        </form>
        <p class="ui-auth-error" hidden></p>
        <button type="button" id="ui-auth-guest" class="ui-auth-guest">Jouer sans compte</button>
      </div>
    `;

    this.loginForm = this.root.querySelector("#ui-auth-login")!;
    this.registerForm = this.root.querySelector("#ui-auth-register")!;
    this.tabLogin = this.root.querySelector("#ui-auth-tab-login")!;
    this.tabRegister = this.root.querySelector("#ui-auth-tab-register")!;
    this.errorEl = this.root.querySelector(".ui-auth-error")!;

    this.tabLogin.addEventListener("click", () => this.selectTab("login"));
    this.tabRegister.addEventListener("click", () => this.selectTab("register"));

    this.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(this.loginForm);
      this.run(() =>
        login(String(data.get("email")), String(data.get("password")))
      , callbacks.onAuthenticated);
    });

    this.registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(this.registerForm);
      this.run(() =>
        register(
          String(data.get("email")),
          String(data.get("username")),
          String(data.get("password"))
        )
      , callbacks.onAuthenticated);
    });

    this.root
      .querySelector("#ui-auth-guest")!
      .addEventListener("click", () => callbacks.onGuest());
  }

  private selectTab(tab: "login" | "register"): void {
    const isLogin = tab === "login";
    this.tabLogin.classList.toggle("active", isLogin);
    this.tabRegister.classList.toggle("active", !isLogin);
    this.loginForm.hidden = !isLogin;
    this.registerForm.hidden = isLogin;
    this.clearError();
  }

  private async run(
    action: () => Promise<unknown>,
    onSuccess: () => void
  ): Promise<void> {
    this.clearError();
    this.setDisabled(true);
    try {
      await action();
      onSuccess();
    } catch (err) {
      this.showError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      this.setDisabled(false);
    }
  }

  private setDisabled(disabled: boolean): void {
    this.root
      .querySelectorAll("button, input")
      .forEach((el) => ((el as HTMLButtonElement | HTMLInputElement).disabled = disabled));
  }

  private showError(message: string): void {
    this.errorEl.textContent = message;
    this.errorEl.hidden = false;
  }

  private clearError(): void {
    this.errorEl.textContent = "";
    this.errorEl.hidden = true;
  }
}
