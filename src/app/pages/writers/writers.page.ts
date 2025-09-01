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
import { MatButtonModule } from '@angular/material/button'; // <-- added

import { WriterService } from '../../core/services/writer.service';
import type { Writer } from '../../core/models/writer.model';
import { WriterDetailsDialog } from './writer-details.dialog';

@Component({
  selector: 'app-Writers-page',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatCardModule,
    MatIconModule, MatChipsModule, MatTooltipModule, MatProgressBarModule,
    MatDialogModule,
    MatButtonModule // <-- added
  ],
  templateUrl: './Writers.page.html',
  styleUrls: ['./Writers.page.scss']
})
export class WritersPage implements OnInit {
  public svc = inject(WriterService);
  private dialog = inject(MatDialog);

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

  // ---- CSV download (no changes to your grid logic) ----
  private headerMap: Record<string, string> = {
    id:'ID', name:'Name', bio:'Bio', email:'Email', phone:'Phone',
    profilePictureUrl:'Avatar', joinedDate:'Joined',
    articlesWritten:'Articles', followers:'Followers', isActive:'Active'
  };

  downloadCsv(): void {
    const rows = this.ds.filteredData ?? this.ds.data ?? [];
    const cols = this.displayed;

    const esc = (v: any) => {
      if (v === null || v === undefined) return '""';
      if (Array.isArray(v)) v = v.join('; ');
      if (v instanceof Date) v = v.toISOString();
      const s = String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const header = cols.map(c => esc(this.headerMap[c] ?? c)).join(',');
    const body = rows.map(r =>
      cols.map(c => {
        const val = (r as any)[c];
        if (c === 'joinedDate') {
          const d = val ? new Date(val) : null;
          return esc(d ? d.toLocaleString() : '');
        }
        return esc(val);
      }).join(',')
    );
    const csv = [header, ...body].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const ts = new Date();
    const fname = `writers_${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}${String(ts.getDate()).padStart(2,'0')}_${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}${String(ts.getSeconds()).padStart(2,'0')}.csv`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
  }
}
