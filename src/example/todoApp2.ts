import { root, $if, $repeat, el, text, state } from "..";

interface ITask {
  done: boolean,
  description: string
};

export function mountTodoApp2(rootEl: HTMLElement) {
  const taskDescription = state("");
  const tasks = state<ITask[]>([]);
  const count = tasks.$.length;

  function addTask(event: Event) {
    event.preventDefault();
    tasks.updater.append({
      done: false,
      description: taskDescription.getValue()
    });
    taskDescription.setValue("");
  }

  function deleteTask(i: number) {
    return () => tasks.updater.removeAt(i);
  }

  root(rootEl).children(
    el.form({ onSubmit: addTask },

      el.inputText({ placeholder: "What needs to be done?", model: taskDescription }),

      el.button("Add task"),

      el.ul(
        $repeat(tasks, (task, i) =>
          el.li(
            el.inputCheckbox({ model: task.$.done }),
            text(task.$.description),
            el.button({ type: "button", onClick: deleteTask(i) }, "Delete task")
          )
        )
      ),

      $if(count, () =>
        el.div(text`You have ${count} tasks in your todo list.`)
      )
    )
  );
}
