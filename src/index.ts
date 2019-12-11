import { DNode, Text, mount, Button, If, TextInput, Repeat, El } from './dreact';
import { Var, Val, ObservableArray, template } from './var';


function app(): DNode {
  const counter = Var(1);
  const search = Var("");
  const todos = new ObservableArray<string>(['a', 'b']);

  return El('div').children(
    Button('Increment', () => {
      counter.setValue(counter.value + 1);
    }),
    If(counter.map(c => c % 2 === 0), Text(template`${counter.map(String)} par`)),
    If(counter.map(c => c % 2 === 1), Text(template`${counter.map(String)} ímpar`)),
    El('div').children(
      TextInput(search),
    ),
    Button('Add item', () => {
      todos.append(search.value);
    }),
    El('div').children(
      Repeat(todos, (todo, index) => El('div').children(
        Text(index.map(String)),
        Text(Val(todo)),
        Button('Delete', () => {
          todos.removeAt(index.value);
        })
      ))
    )
  );
}

mount(app(), document.getElementById('exampleApp')!);
