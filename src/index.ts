import { DNode, mount, If, TextInput, Repeat, El } from './dnodes/dnodes';
import { Var, VarArray, template } from './vars/vars';


function myApp(): DNode {
  const
    todoInput = Var(''),
    todoList = VarArray<string>([]);

  return El('div').children(
    El('form')
      .on('submit', (e) => {
        e.preventDefault();
        todoList.append(todoInput.value);
        todoInput.setValue('');
      })
      .children(
        TextInput(todoInput),
        El('button').text('Add item')
      ),
    El('ul').children(
      Repeat(todoList, (todo, index) =>
        El('li').children(
          El('span').text(template`Item ${index.map(String)}: ${todo}`),
          El('button').text('Delete')
            .on('click', () => todoList.removeAt(index.value))
        ))
    ),
    If(todoList.length.map(n => n === 0), El('em').text('There is nothing in your todo list')),
  );
}

mount(myApp(), document.getElementById('exampleApp')!);
