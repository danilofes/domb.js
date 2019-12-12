import { DNode, mount, If, Input, Repeat, El } from './dnodes/dnodes';
import { Var, VarArray } from './vars/vars';
import { isEmpty } from './vars/util';


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
        Input(todoInput).attributes({ 'placeholder': 'What needs to be done?' }),
        El('button').text('Add todo').attributes({ 'disabled': todoInput.map(isEmpty) })
      ),
    El('ul').children(
      Repeat(todoList, (todo, index) =>
        El('li').children(
          El('span').text(todo),
          El('button').text('Delete')
            .on('click', () => todoList.removeAt(index.value))
        ))
    ),
    If(todoList.map(isEmpty),
      El('em').text('There is nothing in your todo list')),
  );
}

mount(myApp(), document.getElementById('exampleApp')!);
