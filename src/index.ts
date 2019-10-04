import { DNode, Div, Text, mount, Button, If } from './dreact';
import { Var, Val } from './var';


function app(): DNode {
  const varCounter = Var(1);

  return Div([
    Text(varCounter.map(String)),
    If(varCounter.map(c => c % 2 === 0), Text(Val(": par"))),
    If(varCounter.map(c => c % 2 === 1), Text(Val(": ímpar"))),
    Button('Increment', () => varCounter.setValue(varCounter.value + 1))
  ]);
}


const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

mount(app(), rootElement);
