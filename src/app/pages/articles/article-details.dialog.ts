import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import type { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-article-details-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatChipsModule, NgIf, NgFor, DatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      <div class="meta">
        <div>Author: <strong>{{ data.author }}</strong></div>
        <div>Category: <strong>{{ data.category }}</strong></div>
        <div>Published: <strong>{{ data.publishedDate | date:'medium' }}</strong></div>
        <div>Read time: <strong>{{ data.readTimeMinutes }} min</strong></div>
        <div>Likes: <strong>{{ data.likesCount }}</strong> • Comments: <strong>{{ data.commentsCount }}</strong></div>
      </div>

      <img *ngIf="data.imageUrl" [src]="data.imageUrl" alt="image" class="thumb" />

      <p class="summary" *ngIf="data.summary">{{ data.summary }}</p>

      <div *ngIf="data.tags?.length" class="chips">
        <mat-chip-set>
          <mat-chip *ngFor="let t of data.tags">{{ t }}</mat-chip>
        </mat-chip-set>
      </div>

      <p class="content" *ngIf="data.content">{{ data.content }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
  styles: [`
    .meta { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.5rem 1rem; margin-bottom: .75rem; }
    .thumb { width:100%; max-height:220px; object-fit:cover; border-radius:8px; margin:.5rem 0; }
    .summary { font-weight:600; margin:.5rem 0; }
    .chips { margin:.25rem 0 .75rem; }
    .content { white-space: pre-wrap; }
  `]
})
export class ArticleDetailsDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Article,
    public ref: MatDialogRef<ArticleDetailsDialog>
  ) {}
}
