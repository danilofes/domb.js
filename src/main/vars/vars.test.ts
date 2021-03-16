import { Var } from './vars';


test('var should hold a value', () => {

  const myVar = Var(1);

  expect(myVar.value).toBe(1);
});

test('test dom', () => {
  document.body.innerHTML = '<div id="root"></div>';

  const el = document.getElementById('root');
  expect(el?.tagName).toBe('DIV');
  
});
