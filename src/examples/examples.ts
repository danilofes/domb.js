import { mount, If, El, Input } from '../dnodes/dnodes';
import { todoApp } from './todoApp';
import { Var } from '../vars/vars';

function index() {
  const visible = Var(true);

  return El('div').children(
    Input('checkbox').checked(visible),
    If(visible, todoApp())
  );

}

mount(index(), document.getElementById('todoApp')!);
