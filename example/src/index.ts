import { mount, If, El, Input, Var } from 'domb';
import { todoApp } from './todoApp';

function index() {
  const visible = Var(true);

  return El('div').children(
    Input('checkbox').checked(visible),
    If(visible, todoApp())
  );

}

mount(index(), document.getElementById('todoApp')!);
