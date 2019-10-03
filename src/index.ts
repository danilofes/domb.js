import { DreactNode, div, varText, render, button } from './dreact';
import { Var } from './var';


function app(): DreactNode {
  const varCounter = Var(1);

  return div([
    varText(varCounter.map(String)),
    button({ text: 'Increment', onClick: () => varCounter.setValue(varCounter.value + 1) })
  ]);
}


const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

render(app(), rootElement);
