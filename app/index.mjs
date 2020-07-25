const handleButton = function (element, event) {
  if(element.empty){
    element.value = '';
    element.empty = false;
  }
  element.value = (element.value ?? '') + event.target.dataset.value;
};

const assignButton = function (child, handleButton) {
  if(child instanceof HTMLButtonElement) {
    // Update onclick handler to work with this component
    child.onclick = 
      child.onclick
        ? child.onclick.bind(this) 
        : this.defaultClick
          ? this.defaultClick.bind(this)
          : handleButton.bind(this, this); 
  }
  if(child.childNodes.length){
    // Resursively apply to children
    for (const grandChild of child.childNodes){
      assignButton.call(this, grandChild, handleButton);
    }
  }
};

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
    for(const child of event.target.assignedElements()) {
      assignButton.call(this, child, handleButton);
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
  set stored (detail) {
    this.setAttribute('stored', detail);
  }
  get stored () {
    return this.getAttribute('stored');
  }
  set value (detail) {
    this.setAttribute('value', detail);
  }
  get value () {
    return this.getAttribute('value');
  }
  set opp (detail) {
    this.setAttribute('opp', detail);
  }
  get opp () {
    return this.getAttribute('opp');
  }
  get empty () {
    return this.getAttribute('empty') !== null;
  }
  set empty(bool){
    if(bool){
      this.setAttribute('empty', '');
    } else {
      this.removeAttribute('empty');
    }
  }
};
export default CalculatorKit;