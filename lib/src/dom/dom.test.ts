import { root, $if, $repeat, el, on, text, properties, model } from ".";
import { state } from "../state";

let rootEl: HTMLDivElement;

beforeEach(() => {
  rootEl = document.createElement("div");
});

test("static text node", () => {
  root(rootEl).children(
    text("static text")
  );

  const actualNode = rootEl.childNodes[0];
  expect(actualNode).not.toBeNull();
  expect(actualNode.nodeType).toBe(Node.TEXT_NODE);
  expect(actualNode.textContent).toBe("static text");
});

test("dynamic text node", () => {
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
  root(rootEl).children(
    el.ul(
      el.li()
    ),
    el.span()
  );

  expect(rootEl.innerHTML).toBe("<ul><li></li></ul><span></span>");
});

test("$if directive", () => {
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
  const items = state(["apple", "orange"]);
  root(rootEl).children(
    $repeat(items, (item, i) =>
      el.span(text(item))
    )
  );

  expect(rootEl.children.length).toBe(2);
  expect(rootEl.children[0].outerHTML).toBe("<span>apple</span>");
  expect(rootEl.children[1].outerHTML).toBe("<span>orange</span>");
});