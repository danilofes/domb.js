import { root, $if, $repeat, el, text } from ".";
import { state, removeAt, append } from "../state";

test("static text node", () => {
  const rootEl = createEl("div");
  root(rootEl).children(text("static text"));

  const actualNode = rootEl.childNodes[0];
  expect(actualNode).not.toBeNull();
  expect(actualNode.nodeType).toBe(Node.TEXT_NODE);
  expect(actualNode.textContent).toBe("static text");
});

test("dynamic text node", () => {
  const rootEl = createEl("div");
  const myString = state("dynamic text");
  root(rootEl).children(text(myString));

  const actualNode = rootEl.childNodes[0];
  expect(actualNode.textContent).toBe("dynamic text");

  myString.value = "new value";
  expect(actualNode.textContent).toBe("new value");
});

test("element nodes with children", () => {
  const rootEl = createEl("div");
  root(rootEl).children(el.ul(el.li()), el.span());

  expect(rootEl.innerHTML).toBe("<ul><li></li></ul><span></span>");
});

test("element with property", () => {
  const rootEl = createEl("div");
  root(rootEl).children(el.div({ className: "x" }));

  const actualNode = rootEl.children[0];
  expect(actualNode.className).toBe("x");
});

test("element with event handler", () => {
  const callback = jest.fn();
  const rootEl = createEl("div");
  root(rootEl).children(el.button({ onClick: callback }, "click me"));

  const actualNode = rootEl.querySelector("button")!;
  expect(actualNode.textContent).toBe("click me");

  actualNode.click();
  expect(callback.mock.calls.length).toBe(1);
});

test("$if directive", () => {
  const rootEl = createEl("div");
  const condition = state(false);
  root(rootEl).children($if(condition, () => el.span()));

  expect(rootEl.innerHTML).toBe("<!--if node-->");

  condition.value = true;
  expect(rootEl.innerHTML).toBe("<span></span><!--if node-->");

  condition.value = false;
  expect(rootEl.innerHTML).toBe("<!--if node-->");
});

test("$repeat directive", () => {
  const rootEl = createEl("div");
  const fruits = state([{ name: "apple" }, { name: "orange" }]);
  root(rootEl).children(
    $repeat(fruits, (fruit, i) =>
      el.div(text`${i}: ${fruit.$.name}`, el.button({ onClick: () => fruits.update(removeAt(i)) }, text("X")))
    )
  );

  expect(rootEl.children.length).toBe(2);
  expect(rootEl.children[0].outerHTML).toBe("<div>0: apple<button>X</button></div>");
  expect(rootEl.children[1].outerHTML).toBe("<div>1: orange<button>X</button></div>");

  fruits.update(append({ name: "banana" }));
  expect(rootEl.children.length).toBe(3);
  expect(rootEl.children[2].outerHTML).toBe("<div>2: banana<button>X</button></div>");

  rootEl.children[1].querySelector("button")!.click();

  expect(rootEl.children.length).toBe(2);
  expect(rootEl.children[0].outerHTML).toBe("<div>0: apple<button>X</button></div>");
  expect(rootEl.children[1].outerHTML).toBe("<div>1: banana<button>X</button></div>");

  fruits.update(removeAt(1));

  fruits.value = [];
  expect(rootEl.children.length).toBe(0);
});

test("text template tag", () => {
  const rootEl = createEl("div");
  const counter = state(1);

  root(rootEl).children(text`the counter is ${counter}`);
  expect(rootEl.textContent).toBe("the counter is 1");

  counter.value = 2;
  expect(rootEl.textContent).toBe("the counter is 2");
});

function createEl(tag: string): HTMLElement {
  return document.createElement(tag);
}
