const handleButton = function (element, { target : { dataset : { value } } }) {
  if(element.empty) {
    element.value = '';
    element.empty = false;
  }
  element.value = (element.value ?? '') + value;
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
  if(child.childNodes.length) {
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
    const startingValue = this.getAttribute('value');
    if(startingValue !== null){
      this.value = startingValue;
    }
  }
  reset() {
    this.value = "";
    this.empty = false;
    this.removeAttribute('opp');
    this.removeAttribute('stored');
  }
  set stored (detail) {
    this.dispatchEvent(new CustomEvent('onstoredchanged', { detail }));
    this.setAttribute('stored', detail);
  }
  get stored () {
    return this.getAttribute('stored');
  }
  set value (detail) {
    this.input.value = detail;
    this.dispatchEvent(new CustomEvent('onvaluechanged', { detail }))
    this.setAttribute('value', detail);
  }
  get value () {
    return this.getAttribute('value');
  }
  set opp (detail) {
    this.dispatchEvent(new CustomEvent('onoppchanged', { detail }));
    this.setAttribute('opp', detail);
  }
  get opp () {
    return this.getAttribute('opp');
  }
  get empty () {
    return this.getAttribute('empty') !== null;
  }
  set empty(bool) {
    this.dispatchEvent(new CustomEvent('onemptychanged', { detail: !!bool}))
    if(bool){
      this.setAttribute('empty', '');
    } else {
      this.removeAttribute('empty');
    }
  }
};
export default CalculatorKit;