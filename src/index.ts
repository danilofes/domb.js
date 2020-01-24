import { mount } from './dnodes/dnodes';
import { todoApp } from './examples/todoApp';


mount(todoApp(), document.getElementById('todoApp')!);
