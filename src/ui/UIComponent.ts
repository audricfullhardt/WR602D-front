export abstract class UIComponent {
  protected root: HTMLElement;

  constructor(tag: keyof HTMLElementTagNameMap = "div") {
    this.root = document.createElement(tag);
    document.body.appendChild(this.root);
    this.root.style.display = "none";
  }

  show(): void { this.root.style.display = ""; }
  hide(): void { this.root.style.display = "none"; }
}
