import { root, $if, $repeat, el, text, state, locationHashState, compute, append, removeAt } from "..";

interface ITask {
  done: boolean,
  description: string
};

export function mountTodoApp(rootEl: HTMLElement) {
  const
    taskDescription = state(""),
    tasks = state<ITask[]>([]),
    hash = locationHashState(),
    pendingCount = compute(tasks, tasks => tasks.filter(task => !task.done).length);

  function addTask() {
    const newTask = { done: false, description: taskDescription.getValue() };
    tasks.update(append(newTask));
    taskDescription.setValue("");
  }

  function deleteTask(i: number) {
    return () => tasks.update(removeAt(i));
  }

  root(rootEl).children(
    el.form({ onSubmit: evt => { evt.preventDefault(); addTask() } },
      el.inputText({ placeholder: "What needs to be done?", model: taskDescription }),
      el.button({ disabled: compute(taskDescription, taskDescription => !taskDescription) }, "Add task"),
    ),

    el.ul(
      $repeat(tasks, (task, i) => {
        const isVisible = compute([task.$.done, hash], (done, hash) => !(done && hash === '#/active' || !done && hash === '#/completed'));
        return $if(isVisible, () =>
          el.li(
            el.inputCheckbox({ model: task.$.done }),
            text(task.$.description),
            el.button({ type: "button", onClick: deleteTask(i) }, "Delete task")
          )
        )
      })
    ),

    el.div(
      el.a({ href: "#/" }, "All"),
      el.a({ href: "#/active" }, "Active"),
      el.a({ href: "#/completed" }, "Completed")
    ),

    $if(pendingCount,
      () => el.div(text`There are ${pendingCount} items in your todo list.`),
      () => el.div("There is nothing in your todo list")
    )
  );
}
