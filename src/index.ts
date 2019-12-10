import { DNode, Div, Text, mount, Button, If, TextInput, Repeat, TText } from './dreact';
import { Var, Val, ObservableArray } from './var';


function app(): DNode {
  const counter = Var(1);

  const search = Var("");

  const todos = new ObservableArray<string>(['a', 'b']);

  return Div([
    Button('Increment', () => {
      counter.setValue(counter.value + 1);
    }),
    If(counter.map(c => c % 2 === 0), TText`${counter.map(String)} par`),
    If(counter.map(c => c % 2 === 1), TText`${counter.map(String)} ímpar`),
    Div([
      TextInput(search),
    ]),
    Button('Add item', () => {
      todos.addAt(todos.items.length, search.value);
    }),
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
