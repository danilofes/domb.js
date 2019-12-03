import { DNode, Div, Text, mount, Button, If, TextInput, Repeat } from './dreact';
import { Var, Val, ObservableArray } from './var';


function app(): DNode {
  const counter = Var(1);

  const search = Var("");

  const todos = new ObservableArray<string>(['a', 'b']);

  return Div([
    Div([
      TextInput(search),
      Text(search)
    ]),
    Button('Increment', () => {
      counter.setValue(counter.value + 1);
      todos.addAt(todos.items.length, `item ${counter.value}`);
    }),
    If(counter.map(c => c % 2 === 0), Text(counter.map(c => `${c} par`))),
    If(counter.map(c => c % 2 === 1), Text(counter.map(c => `${c} ímpar`))),
    Div([
      Repeat(todos, (todo, index) => Div([
        Text(index.map(String)),
        Text(Val(todo)),
        Button('Delete', () => {
          todos.removeAt(index.value);
        })
      ]))
    ])
  ]);
}


const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

mount(app(), rootElement);
