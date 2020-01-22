import { mount } from './dnodes/dnodes';
import { todoApp } from './examples/todoApp';
import { todoApp2 } from './examples/todoApp2';


//mount(todoApp(), document.getElementById('todoApp')!);

mount(todoApp2(), document.getElementById('todoApp2')!);
