import { DNode, If, Input, El, Repeat } from '../dnodes/dnodes';
import { Var, template, filterVals, IVal } from '../vars/vars';
import { isEmpty, arrayReplaceAt, arrayRemoveAt, isEqualTo } from '../vars/util';

interface TodoItem {
  done: boolean,
  description: string
}

type TodoPredicate = (todo: TodoItem) => boolean;

export function todoApp2(): DNode {
  const
    showAll: TodoPredicate = () => true,
    showActive: TodoPredicate = todo => !todo.done,
    showCompleted: TodoPredicate = todo => todo.done;

  const
    todoInput = Var(''),
    todoList = Var<TodoItem[]>([]),
    currentFilter = Var(showAll),
    filteredTodoList = filterVals(todoList, currentFilter, (todo, predicate) => predicate(todo));

  function addTodo() {
    todoList.setValue([...todoList.value, { done: false, description: todoInput.value }]);
    todoInput.setValue('');
  }

  function toggleTodo(todo: IVal<TodoItem>) {
    return (checked: boolean) => {
      const index = todoList.value.indexOf(todo.value);
      todoList.setValue(arrayReplaceAt(todoList.value, index, { ...todoList.value[index], done: checked }));
    }
  }

  function deleteTodo(todo: IVal<TodoItem>) {
    return () => {
      const index = todoList.value.indexOf(todo.value);
      todoList.setValue(arrayRemoveAt(todoList.value, index));
    }
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
      Repeat(filteredTodoList, (todo, index) =>
        El('li').children(
          Input('checkbox').checked(todo.$.done, toggleTodo(todo)),
          El('span').text(todo.$.description),
          El('button').text('x')
            .on('click', deleteTodo(todo))
        ))
    ),
    El('div').children(
      TotalCount(),
      FilterButton('All', showAll),
      FilterButton('Active', showActive),
      FilterButton('Completed', showCompleted)
    )
  );

  function TotalCount() {
    return If(todoList.map(isEmpty),
      El('em').text('There is nothing in your todo list'),
      El('span').text(template`There are ${todoList.$.length.map(String)} items in your todo list`))
  }

  function FilterButton(text: string, predicate: TodoPredicate) {
    return El('button').text(text)
      .conditionalClass('active', currentFilter.map(isEqualTo(predicate)))
      .on('click', () => currentFilter.setValue(predicate))
  }
}
