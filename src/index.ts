import { DNode, Div, Text, mount, Button, If, TextInput } from './dreact';
import { Var, Val, ObservableArray } from './var';


function app(): DNode {
  const counter = Var(1);

  const search = Var("");

  const todos = new ObservableArray([]);

  return Div([
    Div([
      TextInput(search),
      Text(search)
    ]),
    Button('Increment', () => counter.setValue(counter.value + 1)),
    If(counter.map(c => c % 2 === 0), Text(counter.map(c => `${c} par`))),
    If(counter.map(c => c % 2 === 1), Text(counter.map(c => `${c} ímpar`))),
    Div([
      
    ])
  ]);
}


const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

mount(app(), rootElement);
