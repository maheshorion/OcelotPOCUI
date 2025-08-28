import { Component, OnInit, ViewChild, inject, effect } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { WriterService } from '../../core/services/writer.service';
import type { Writer } from '../../core/models/writer.model';
import { WriterDetailsDialog } from './writer-details.dialog'; // <-- make sure path/case matches your file

@Component({
  selector: 'app-Writers-page',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatCardModule,
    MatIconModule, MatChipsModule, MatTooltipModule, MatProgressBarModule,
    MatDialogModule // <-- REQUIRED to use MatDialog in a standalone component
  ],
  templateUrl: './Writers.page.html',
  styleUrls: ['./Writers.page.scss']
})
export class WritersPage implements OnInit {
  public svc = inject(WriterService);
  private dialog = inject(MatDialog); // <-- inject dialog

  cols: string[] = [
    'id','name','bio','email','phone','profilePictureUrl',
    'joinedDate','articlesWritten','followers','isActive'
  ];
  displayed: string[] = this.cols;

  ds = new MatTableDataSource<Writer>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      const rows = this.svc.Writers() ?? [];
      this.ds.data = rows;
      if (this.paginator) this.ds.paginator = this.paginator;
      if (this.sort) this.ds.sort = this.sort;
    });
  }

  ngOnInit(): void {
    this.svc.loadAll();

    this.ds.filterPredicate = (r: Writer, q: string) => {
      const v = (q || '').trim().toLowerCase();
      const f = (s?: string) => (s ?? '').toLowerCase();
      return f(r.name).includes(v) || f(r.bio).includes(v) || f(r.email).includes(v);
    };
  }

  applyFilter(ev: Event) {
    const v = (ev.target as HTMLInputElement).value ?? '';
    this.ds.filter = v.trim().toLowerCase();
    this.ds.paginator?.firstPage();
  }

  openDetails(writer: Writer) {
    this.dialog.open(WriterDetailsDialog, {
      data: writer,
      width: '520px',
      autoFocus: false
    });
  }

  trackById = (_: number, r: Writer) => r.id;
}
