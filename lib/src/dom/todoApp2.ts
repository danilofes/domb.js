import { root, $if, $repeat, el, text, onSubmit, checked, attr, model, DombElement } from ".";
import { state, map } from "../state";

function todoApp() {
  const todoDescription = state("");
  const todos = state([""]);
  const count = map(todos, (l) => l.length);

  function addTodo() {}

  function toggleAll() {}

  let inputDescription: DombElement;

  root(document.getElementById("todoApp")).children(
    el.form(
      onSubmit(addTodo),
      inputDescription = el.inputText(attr("placeholder", "What needs to be done?"), model(todoDescription)),

      $if(count, () => 
        el.inputCheckbox(checked(map(count, isZero), toggleAll))
      ),
      el.ul($repeat(todos, (item) => 
        el.li(text`node`))
      ),
      el.div(text(todoDescription))
    )
  );
}

function isZero(value: number) {
  return value === 0;
}
