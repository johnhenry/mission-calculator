const htmlToElements = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.childNodes;
};

const attachDOM = function(object, ...objects){
  object.append(...objects);
  return object;
};

const domString = 
`<style>
* {
  box-sizing: border-box;
}
</style>
<input id='input' part='input' readonly>
<span part='button-box' />
<slot id='slot'/>`;

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
  constructor () {
    super();
    // create shadow dom
    this.shadow = attachDOM(
      this.attachShadow({ mode: 'open' }),
      ...htmlToElements(domString),
    )
    // attach slot listeners
    this.shadow.getElementById('slot')
      .addEventListener(
        'slotchange',
        this.slotChange.bind(this));
  }
  slotChange ({ target } ) {
    for(const child of target.assignedElements()) {
      assignButton.call(this, child, handleButton);
    }
  }
  connectedCallback () {
    if(this.onclick) {
      this.defaultClick = this.onclick;
      this.onclick = null;
    }
    const startingValue = this.getAttribute('value');
    if(startingValue !== null){
      this.value = startingValue;
    }
  }
  reset () {
    this.value = "";
    this.empty = false;
    this.removeAttribute('opp');
    this.removeAttribute('stored');
  }
  set stored (detail) {
    this.setAttribute('stored', detail);
    this.dispatchEvent(new CustomEvent('onstoredchanged', { detail }));
  }
  get stored () {
    return this.getAttribute('stored');
  }
  set value (detail) {
    this.shadow.getElementById('input').value = detail;
    this.setAttribute('value', detail);
    this.dispatchEvent(new CustomEvent('onvaluechanged', { detail }))
  }
  get value () {
    return this.getAttribute('value');
  }
  set opp (detail) {
    this.setAttribute('opp', detail);
    this.dispatchEvent(new CustomEvent('onoppchanged', { detail }));
  }
  get opp () {
    return this.getAttribute('opp');
  }
  get empty () {
    return this.getAttribute('empty') !== null;
  }
  set empty(bool) {
    if(bool){
      this.setAttribute('empty', '');
    } else {
      this.removeAttribute('empty');
    }
    this.dispatchEvent(new CustomEvent('onemptychanged', { detail: !!bool}))
  }
};
export default CalculatorKit;