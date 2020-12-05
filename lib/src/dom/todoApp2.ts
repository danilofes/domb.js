import { root, $if, $repeat, el, text, onSubmit, checked, attr, model } from ".";
import { state } from "../state";

interface ITask {
  done: boolean,
  description: string
};

function todoApp() {
  const taskDescription = state("");
  const tasks = state<ITask[]>([]);
  const count = tasks.$.length;

  function addTask() {
    tasks.update(prev => [...prev, {
      done: false,
      description: taskDescription.getValue()
    }]);
  }

  function toggleAll() {

  }

  root(document.getElementById("todoApp")).children(
    el.form(
      onSubmit(addTask),
      el.inputText(attr("placeholder", "What needs to be done?"), model(taskDescription)),

      el.ul(
        $repeat(tasks, (task) =>
          el.li(
            el.inputCheckbox(model(task.$.done)),
            text(task.$.description)
          )
        )
      ),
      $if(count, () => 
        el.div(text`You have ${count} tasks in your todo list.`)
      )
    )
  );
}
