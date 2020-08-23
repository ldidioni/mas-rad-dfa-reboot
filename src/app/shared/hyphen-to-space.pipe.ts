import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe which converts hyphenated strings into their equivalent using whitespaces
 * e.g. dangerous-road => dangerous road
 */
@Pipe({
  name: 'hyphenToSpace'
})
export class HyphenToSpacePipe implements PipeTransform {

  transform(value: string): string {

    return value.replace(/-/g, ' ');
  }

}