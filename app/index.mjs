const handleButton = function (element, event) {
  if(element.getAttribute('empty') !== null){
    element.setAttribute('value', '');
    element.removeAttribute('empty');
  }
  const initialValue = element.getAttribute('value') ?? '';
  element.setAttribute('value', initialValue + event.target.dataset.value);
}
const CalculatorKit = class extends HTMLElement {
  constructor() {
    super();
    // create shadow
    this.shadow = this.attachShadow({ mode: 'open' });
    // create style
    const style = document.createElement('style');
    style.innerHTML = '* { box-sizing: border-box; }';
    this.shadow.appendChild(style);
    // create input
    this.input = this.shadow.appendChild(document.createElement('input'));
    this.input.part = 'input';
    this.input.readOnly = true;
    // create button box
    this.buttonBox = this.shadow.appendChild(document.createElement('span'));
    this.buttonBox.part = 'button-box';
    // add slot to button box
    this.slotChange = this.slotChange.bind(this);
    this.buttonBox
      .appendChild(document.createElement('slot'))
      .addEventListener('slotchange', this.slotChange);
  }
  slotChange(event) {
    const assignButton = (child) => {
      if(child.nodeName === "BUTTON") {
        child.onclick = 
          child.onclick
            ? child.onclick.bind(this) 
            : this.defaultClick
              ? this.defaultClick.bind(this)
              : handleButton.bind(this, this); 
      }
      if(child.childNodes.length){
        for (const grandChild of child.childNodes){
          assignButton(grandChild);
        }
      }
    }
    for(const child of event.target.assignedElements()) {
      assignButton(child);
    }
  }
  connectedCallback() {
    if(this.onclick) {
      this.defaultClick = this.onclick;
      this.onclick = null;
    }
  }
  disconnectedCallback() {}
  static get observedAttributes() {
    return ['value', 'empty', 'stored', 'opp'];
  }
  attributeChangedCallback(name, old, detail) {
    if(name === 'empty' && old !== detail && detail !== null){
      return this.dispatchEvent(new Event('onempty'));
    }
    if(old !== detail) {
      switch(name){
        case 'value':
          this.input.value = detail ?? '';
          return this.dispatchEvent(new CustomEvent('onvaluechanged', { detail }));
        case 'stored':
          return this.dispatchEvent(new CustomEvent('onstored', { detail }));
        case 'opp':
          return this.dispatchEvent(new CustomEvent('onoppchanged', { detail }));
      }
    }
  }
  reset() {
    this.removeAttribute('opp');
    this.removeAttribute('stored');
    this.removeAttribute('value');
  }
}
export default CalculatorKit;