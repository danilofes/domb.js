import { IVal } from "./vars-api";
import { DerivedVal } from "./DerivedVal";

export class TemplateVal extends DerivedVal<string, string> {
  constructor(private strings: TemplateStringsArray, vals: IVal<string>[]) {
    super(vals, values => applyTemplateVals(strings, values));
  }
}

function applyTemplateVals(strings: TemplateStringsArray, values: string[]): string {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i] + (values[i] || '');
  }
  return result;
}