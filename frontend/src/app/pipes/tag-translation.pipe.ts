import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagTranslation'
})
export class TagTranslationPipe implements PipeTransform {

  transform(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value.map(tag => this.translations[tag] || tag).join(', ');
    }
    return this.translations[value] || value;
  }

  private translations: { [key: string]: string } = {
    'curse-word': 'Schimpfwort',
  };

}
