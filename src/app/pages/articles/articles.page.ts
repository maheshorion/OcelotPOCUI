import { Component, OnInit, ViewChild, inject, effect } from '@angular/core';
import { NgIf, NgFor, DatePipe, JsonPipe } from '@angular/common';
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
import { MatButtonModule } from '@angular/material/button'; // <-- added

import { ArticleService } from '../../core/services/article.service';
import type { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-articles-page',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, JsonPipe, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatCardModule,
    MatIconModule, MatChipsModule, MatTooltipModule, MatProgressBarModule,
    MatButtonModule // <-- added
  ],
  templateUrl: './articles.page.html',
  styleUrls: ['./articles.page.scss']
})
export class ArticlesPage implements OnInit {
  public svc = inject(ArticleService);
  cols: (keyof Article)[] = [
    'id','title','content','author','publishedDate','category',
    'isFeatured','readTimeMinutes','imageUrl','likesCount',
    'commentsCount','tags','isPublished','lastModified','summary'
  ];
  ds = new MatTableDataSource<Article>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      const rows = this.svc.articles() ?? [];
      this.ds.data = rows;
      if (this.paginator) this.ds.paginator = this.paginator;
      if (this.sort) this.ds.sort = this.sort;
    });
  }

  ngOnInit(): void {
    this.svc.loadAll();

    this.ds.filterPredicate = (r: Article, q: string) => {
      const v = (q || '').trim().toLowerCase();
      return r.title.toLowerCase().includes(v)
          || r.author.toLowerCase().includes(v)
          || r.category.toLowerCase().includes(v)
          || (r.tags ?? []).some(t => t.toLowerCase().includes(v));
    };
  }

  applyFilter(ev: Event) {
    const v = (ev.target as HTMLInputElement).value ?? '';
    this.ds.filter = v.trim().toLowerCase();
    this.ds.paginator?.firstPage();
  }

  // ---- CSV download (no changes to your grid logic) ----
  private headerMap: Record<string, string> = {
    id:'ID', title:'Title', content:'Content', author:'Author',
    publishedDate:'Published Date', category:'Category', isFeatured:'Featured',
    readTimeMinutes:'Read Time (min)', imageUrl:'Image', likesCount:'Likes',
    commentsCount:'Comments', tags:'Tags', isPublished:'Published',
    lastModified:'Last Modified', summary:'Summary'
  };

  downloadCsv(): void {
    const rows = this.ds.filteredData ?? this.ds.data ?? [];
    const cols = this.cols as string[];

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
        if (c === 'publishedDate' || c === 'lastModified') {
          const d = val ? new Date(val) : null;
          return esc(d ? d.toLocaleString() : '');
        }
        return esc(val);
      }).join(',')
    );
    const csv = [header, ...body].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const ts = new Date();
    const fname = `articles_${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}${String(ts.getDate()).padStart(2,'0')}_${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}${String(ts.getSeconds()).padStart(2,'0')}.csv`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
  }
}
