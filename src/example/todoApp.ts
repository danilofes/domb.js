import { root, $if, $repeat, el, text, state, locationHashState, compute2, map, append, removeAt } from "..";

interface ITask {
  done: boolean;
  description: string;
}

export function mountTodoApp(rootEl: HTMLElement) {
  const taskDescription = state(""),
    tasks = state<ITask[]>([]),
    hash = locationHashState(),
    pendingCount = map(tasks, (tasks) => tasks.filter((task) => !task.done).length);

  function addTask() {
    const newTask = { done: false, description: taskDescription.value };
    tasks.update(append(newTask));
    taskDescription.value = "";
  }

  function deleteTask(i: number) {
    return () => tasks.update(removeAt(i));
  }

  root(rootEl).children(
    el.form(
      {
        onSubmit: (evt) => {
          evt.preventDefault();
          addTask();
        },
      },
      el.inputText({ placeholder: "What needs to be done?", model: taskDescription }),
      el.button({ disabled: map(taskDescription, (taskDescription) => !taskDescription) }, "Add task")
    ),

    el.ul(
      $repeat(tasks, (task, i) => {
        const done = task.$.done;
        const isVisible = compute2(
          () => !((done.value && hash.value === "#/active") || (done.value && hash.value === "#/completed"))
        );
        return $if(isVisible, () =>
          el.li(
            el.inputCheckbox({ model: task.$.done }),
            text(task.$.description),
            el.button({ type: "button", onClick: deleteTask(i) }, "Delete task")
          )
        );
      })
    ),

    el.div(
      el.a({ href: "#/" }, "All"),
      el.a({ href: "#/active" }, "Active"),
      el.a({ href: "#/completed" }, "Completed")
    ),

    $if(
      pendingCount,
      () => el.div(text`There are ${pendingCount} items in your todo list.`),
      () => el.div("There is nothing in your todo list")
    )
  );
}
