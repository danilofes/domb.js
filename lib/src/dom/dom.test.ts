import { root, $if, $repeat, el, on, text, properties, model } from ".";
import { state } from "../state";

test("static text node", () => {
  const rootEl = createEl('div');
  root(rootEl).children(
    text("static text")
  );

  const actualNode = rootEl.childNodes[0];
  expect(actualNode).not.toBeNull();
  expect(actualNode.nodeType).toBe(Node.TEXT_NODE);
  expect(actualNode.textContent).toBe("static text");
});

test("dynamic text node", () => {
  const rootEl = createEl('div');
  const myString = state("dynamic text");
  root(rootEl).children(
    text(myString)
  );

  const actualNode = rootEl.childNodes[0];
  expect(actualNode.textContent).toBe("dynamic text");

  myString.setValue("new value");
  expect(actualNode.textContent).toBe("new value");
});


test("element nodes with children", () => {
  const rootEl = createEl('div');
  root(rootEl).children(
    el.ul(
      el.li()
    ),
    el.span()
  );

  expect(rootEl.innerHTML).toBe("<ul><li></li></ul><span></span>");
});

test("$if directive", () => {
  const rootEl = createEl('div');
  const condition = state(false);
  root(rootEl).children(
    $if(condition, () =>
      el.span()
    )
  );

  expect(rootEl.innerHTML).toBe("<!--if node-->");

  condition.setValue(true);
  expect(rootEl.innerHTML).toBe("<span></span><!--if node-->");

  condition.setValue(false);
  expect(rootEl.innerHTML).toBe("<!--if node-->");
});

test("$repeat directive", () => {
  const rootEl = createEl('table');
  const fruits = state([{ name: "apple" }, { name: "orange" }]);
  root(rootEl).children(
    $repeat(fruits, (fruit, i) =>
      el.tr(
        el.td(text(i)),
        el.td(text(fruit.$.name))
      )
    )
  );

  expect(rootEl.children.length).toBe(2);
  expect(rootEl.children[0].outerHTML).toBe("<tr><td>0</td><td>apple</td></tr>");
  expect(rootEl.children[1].outerHTML).toBe("<tr><td>1</td><td>orange</td></tr>");

  fruits.updater.append({ name: "banana" });
  expect(rootEl.children.length).toBe(3);
  expect(rootEl.children[2].outerHTML).toBe("<tr><td>2</td><td>banana</td></tr>");

  fruits.setValue([]);
  expect(rootEl.children.length).toBe(0);
});

function createEl(tag: string): HTMLElement {
  return document.createElement(tag);
}
