import { DNode, If, Input, El, Repeat2 as Repeat } from '../dnodes/dnodes';
import { Var, template } from '../vars/vars';
import { isEmpty, arrayReplaceAt, arrayRemoveAt } from '../vars/util';

interface TodoItem {
  done: boolean,
  description: string
}

export function todoApp2(): DNode {
  const
    todoInput = Var(''),
    todoList = Var<TodoItem[]>([]);

  function addTodo() {
    todoList.setValue([...todoList.value, { done: false, description: todoInput.value }]);
    todoInput.setValue('');
  }

  function toggleTodo(index: number, checked: boolean) {
    todoList.setValue(arrayReplaceAt(todoList.value, index, { ...todoList.value[index], done: checked }));
  }

  function deleteTodo(index: number) {
    todoList.setValue(arrayRemoveAt(todoList.value, index));
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
      Repeat(todoList, (todo, index) =>
        El('li').children(
          Input('checkbox').checked(todo.$.done, checked => toggleTodo(index, checked)),
          El('span').text(todo.$.description),
          El('button').text('x')
            .on('click', () => deleteTodo(index))
        ))
    ),
    If(todoList.map(isEmpty),
      El('em').text('There is nothing in your todo list'),
      El('div').text(template`There are ${todoList.$.length.map(String)} items in your todo list`)),
  );
}
