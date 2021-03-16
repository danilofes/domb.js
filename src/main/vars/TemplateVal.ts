import { IVal } from "./vars-api";
import { DerivedVal } from "./DerivedVal";

export class TemplateVal extends DerivedVal<string> {
  constructor(private strings: TemplateStringsArray, vals: IVal<string | number>[]) {
    super(vals, values => applyTemplateVals(strings, values));
  }
}

function applyTemplateVals(strings: TemplateStringsArray, values: (string | number)[]): string {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i] + (values[i] || '');
  }
  return result;
}