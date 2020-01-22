import { DNode, If, Input, El, Repeat, ForEach } from '../dnodes/dnodes';
import { Var, Vars, template } from '../vars/vars';
import { isEmpty, isZero } from '../vars/util';

interface TodoItem {
  done: boolean,
  description: string
}

export function todoApp(): DNode {
  const
    todoInput = Var(''),
    todoList = Vars<TodoItem>();

  function addTodo() {
    todoList.append({ done: false, description: todoInput.value });
    todoInput.setValue('');
  }

  function toggleTodo(index: number, checked: boolean) {
    todoList.itemAt(index).$.done.setValue(checked);
  }

  function deleteTodo(index: number) {
    todoList.deleteAt(index);
  }

  return El('div').children(
    El('form')
      .on('submit', event => {
        event.preventDefault();
        addTodo();
      })
      .children(
        Input('text').attributes({ 'placeholder': 'What needs to be done?' }).value(todoInput),
        El('button').text('Add todo').attributes({ 'disabled': todoInput.map(isEmpty) })
      ),
    El('ul').children(
      ForEach(todoList, (todo, index) =>
        El('li').children(
          Input('checkbox').checked(todo.$.done, checked => toggleTodo(index.value, checked)),
          El('span').text(todo.$.description),
          El('button').text('x')
            .on('click', () => deleteTodo(index.value))
        ))
    ),
    If(todoList.length.map(isZero),
      El('em').text('There is nothing in your todo list'),
      El('div').text(template`There are ${todoList.length.map(String)} items in your todo list`)),
  );
}
