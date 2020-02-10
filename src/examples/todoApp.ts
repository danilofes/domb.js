import { DNode, If, Input, El, Repeat } from '../dnodes/dnodes';
import { Var, template, filterVals, IVal, HashVar } from '../vars/vars';
import { empty, arrayReplaceAt, arrayRemoveAt, equalTo, greaterThan } from '../vars/util';

interface TodoItem {
  done: boolean,
  description: string
}

type TodoPredicate = (todo: TodoItem) => boolean;

const
  showAll: TodoPredicate = () => true,
  showActive: TodoPredicate = todo => !todo.done,
  showCompleted: TodoPredicate = todo => todo.done;

function routeToFilter(route: string): TodoPredicate {
  switch (route) {
    case '#/active': return showActive;
    case '#/completed': return showCompleted;
    default: return showAll;
  }
}

export function todoApp(): DNode {

  const
    todoInput = Var(''),
    todoList = Var<TodoItem[]>([]),
    route = HashVar().map(r => r || '#/'),
    currentFilter = route.map(routeToFilter),
    undoneCount = todoList.map(todos => todos.filter(showActive).length),
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

  function toggleAll(checked: boolean) {
    todoList.setValue(todoList.value.map(todo => ({ ...todo, done: checked })));
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
        If(todoList.$.length.is(greaterThan(0)),
          Input('checkbox').checked(undoneCount.is(equalTo(0)), toggleAll)),
        Input('text').attributes({ 'placeholder': 'What needs to be done?' }).value(todoInput),
        El('button').text('Add todo').attributes({ 'disabled': todoInput.is(empty) })
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
      FilterLink('All', '#/'),
      FilterLink('Active', '#/active'),
      FilterLink('Completed', '#/completed')
    )
  );

  function TotalCount() {
    return If(undoneCount.is(equalTo(0)),
      El('em').text('There is nothing in your todo list'),
      El('span').text(template`There are ${undoneCount} items in your todo list`))
  }

  function FilterLink(text: string, href: string) {
    return El('a').text(text).attributes({ href })
      .conditionalClass('active', route.is(equalTo(href)));
  }
}
