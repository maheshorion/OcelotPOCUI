import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import type { Writer } from '../../core/models/writer.model';

@Component({
  selector: 'app-Writer-details-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatChipsModule, NgIf, NgFor, DatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.name }}</h2>
    <div mat-dialog-content>
      <div class="meta">
        <div>Bio: <strong>{{ data.bio }}</strong></div>
        <div>Email: <strong>{{ data.email }}</strong></div>
        <div>Joined: <strong>{{ data.joinedDate | date:'medium' }}</strong></div>
        <div>Followers: <strong>{{ data.followers }}</strong></div>
        <div>Articles: <strong>{{ data.articlesWritten }}</strong></div>
        <div>Status: <strong>{{ data.isActive ? 'Active' : 'Inactive' }}</strong></div>
      </div>
      <img *ngIf="data.profilePictureUrl" [src]="data.profilePictureUrl" class="thumb" alt="avatar" />
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
  styles: [`
    .meta { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.5rem 1rem; margin-bottom:.75rem; }
    .thumb { width:100%; max-height:220px; object-fit:cover; border-radius:8px; margin:.5rem 0; }
  `]
})
export class WriterDetailsDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Writer,
    public ref: MatDialogRef<WriterDetailsDialog>
  ) {}
}
