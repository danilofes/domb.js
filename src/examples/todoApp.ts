import { DNode, If, Input, El, Repeat } from '../dnodes/dnodes';
import { Var, Vars, template, field, map } from '../vars/vars';
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
    field(todoList.itemAt(index), 'done').setValue(checked);
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
        Input('text').attributes({ 'placeholder': 'What needs to be done?' }).bindValue(todoInput),
        El('button').text('Add todo').attributes({ 'disabled': map(todoInput, isEmpty) })
      ),
    El('ul').children(
      Repeat(todoList, (todo, index) =>
        El('li').children(
          Input('checkbox').bindChecked(field(todo, 'done'), checked => toggleTodo(index.value, checked)),
          El('span').text(field(todo, 'description')),
          El('button').text('x')
            .on('click', () => deleteTodo(index.value))
        ))
    ),
    If(map(todoList.length, isZero),
      El('em').text('There is nothing in your todo list'),
      El('div').text(template`There are ${map(todoList.length, String)} items in your todo list`)),
  );
}
