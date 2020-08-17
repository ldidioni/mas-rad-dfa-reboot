import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelcaseToHyphen'
})
export class CamelcaseToHyphenPipe implements PipeTransform {

  transform(value: string): string {
    const CAPS_REGEXP = /[A-Z]/g;

    return value.replace(CAPS_REGEXP, caps => "-" + caps.toLowerCase());
  }

}