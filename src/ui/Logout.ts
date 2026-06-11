import { UIComponent } from "./UIComponent";

export class Logout extends UIComponent {
  constructor(onLogout: () => void) {
    super("button");
    this.root.id = "ui-logout";
    this.root.textContent = "Se déconnecter";
    this.root.addEventListener("click", onLogout);
  }
}
