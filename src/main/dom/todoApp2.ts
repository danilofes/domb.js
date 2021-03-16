import { root, $if, $repeat, el, on, text, properties, model } from ".";
import { state } from "../state";

interface ITask {
  done: boolean,
  description: string
};

function todoApp() {
  const taskDescription = state("");
  const tasks = state<ITask[]>([]);
  const count = tasks.$.length;

  function addTask(event: Event) {
    tasks.updater.append({
      done: false,
      description: taskDescription.getValue()
    });
    taskDescription.setValue("");
    event.preventDefault();
  }

  function deleteTask(i: number) {
    return () => tasks.updater.removeAt(i);
  }

  root(document.getElementById("todoApp")).children(
    el.form(
      on.submit(addTask),

      el.inputText(
        properties({ placeholder: "What needs to be done?" }),
        model(taskDescription)
      ),

      el.inputSubmit(text("Add task")),

      el.ul(
        $repeat(tasks, (task, i) =>
          el.li(
            el.inputCheckbox(model(task.$.done)),
            text(task.$.description),
            el.button(text("Delete task"), on.click(deleteTask(i)))
          )
        )
      ),

      $if(count, () =>
        el.div(text`You have ${count} tasks in your todo list.`)
      )

      //$switch(count)
      //  .$case(0, () => el.div())
      //  .$case(1, () => el.div())
      //  .$otherwise(() => el.div())
    )
  );
}
