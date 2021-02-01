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