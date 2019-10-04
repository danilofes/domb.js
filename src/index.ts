import { DNode, div, text, mount, button } from './dreact';
import { Var } from './var';


function app(): DNode {
  const varCounter = Var(1);

  return div([
    text(varCounter.map(String)),
    button('Increment', () => varCounter.setValue(varCounter.value + 1))
  ]);
}


const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

mount(app(), rootElement);
