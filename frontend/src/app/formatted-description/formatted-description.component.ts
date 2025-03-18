import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TextBlock {
  id: number;
  text: string;
  isItalic: boolean;
  isBold: boolean;
  sizeClass: string;
}

@Component({
  selector: 'app-formatted-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formatted-description.component.html',
  styleUrl: './formatted-description.component.scss',
})
export class FormattedDescriptionComponent {
  protected textBlocks: TextBlock[] = [];
  private tolerance = 0.1;

  @Input()
  set formattedDescription(
    value: { text: string; font: string; size: number }[] | null,
  ) {
    if (!value) {
      this.textBlocks = [];
      return;
    }

    this.textBlocks = value.map((block, idx) => {
      let sizeClass = '';
      if (Math.abs(block.size - 11.19) < this.tolerance) {
        sizeClass = 'normal';
      } else if (Math.abs(block.size - 9.4) < this.tolerance) {
        sizeClass = 'remark';
      } else if (Math.abs(block.size - 10.3) < this.tolerance) {
        sizeClass = 'special-char';
      } else {
        sizeClass = 'small-char';
      }

      return {
        id: idx,
        text: block.text,
        isItalic: block.font?.includes('Italic') || false,
        isBold: block.font?.includes('Bold') || false,
        sizeClass: sizeClass,
      };
    });
  }
}
