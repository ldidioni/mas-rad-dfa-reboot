import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hyphenToSpace'
})
export class HyphenToSpacePipe implements PipeTransform {

  transform(value: string): string {

    return value.replace(/-/g, ' ');
  }

}