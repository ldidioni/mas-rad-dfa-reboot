import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe which truncates strings to the defined maximum length (default = 200 characters)
 * e.g. it is a rainy day => it is a...
 */
@Pipe({
  name: 'textShorten'
})
export class TextShortenPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    let maxLength = args.length > 0 ? parseInt(<string>args[0], 10) : 200;
    let trail = args.length > 1 ? args[1] : '...';

    return value.length > maxLength ? value.substring(0, maxLength) + trail : value;
  }

}
