import { mount } from '..';
import { todoApp } from './todoApp';
import { mountTodoApp2 } from './todoApp2';


mount(todoApp(), document.getElementById("todoApp")!);

mountTodoApp2(document.getElementById("todoApp2")!);
