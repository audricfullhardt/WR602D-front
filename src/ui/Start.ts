import { UIComponent } from "./UIComponent";

export class Start extends UIComponent {
  constructor(onStart: () => void) {
    super("div");
    this.root.id = "ui-start";
    this.root.innerHTML = `
      <h1>Mini Golf</h1>
      <button>Jouer</button>
    `;
    this.root.querySelector("button")!.addEventListener("click", onStart);
  }
}
