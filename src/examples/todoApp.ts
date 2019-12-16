import { DNode, If, Input, Repeat, El } from '../dnodes/dnodes';
import { Var, VarArray, template, field } from '../vars/vars';
import { isEmpty } from '../vars/util';

interface TodoItem {
  done: boolean,
  description: string
}

export function todoApp(): DNode {
  const
    todoInput = Var(''),
    checkedInput = Var(false),
    todoList = VarArray<TodoItem>([]);

  return El('div').children(
    El('form')
      .on('submit', event => {
        event.preventDefault();
        todoList.append({ done: false, description: todoInput.value });
        todoInput.setValue('');
      })
      .children(
        Input('text').attributes({ 'placeholder': 'What needs to be done?' }).bindValue(todoInput),
        El('button').text('Add todo').attributes({ 'disabled': todoInput.map(isEmpty) })
      ),
    El('ul').children(
      Repeat(todoList, (todo, index) =>
        El('li').children(
          Input('checkbox').attributes({ 'type': 'checkbox' }).bindChecked(field(todo, 'done')),
          El('span').text(field(todo, 'description')),
          El('button').text('x')
            .on('click', () => todoList.removeAt(index.value))
        ))
    ),
    If(todoList.map(isEmpty),
      El('em').text('There is nothing in your todo list'),
      El('div').text(template`There are ${todoList.length.map(String)} items in your todo list`)),
  );
}
