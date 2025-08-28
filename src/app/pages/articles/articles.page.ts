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

import { ArticleService } from '../../core/services/article.service';
import type { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-articles-page',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, JsonPipe, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatCardModule,
    MatIconModule, MatChipsModule, MatTooltipModule, MatProgressBarModule
  ],
  templateUrl: './articles.page.html',
  styleUrls: ['./articles.page.scss']
})
export class ArticlesPage implements OnInit {
  public svc = inject(ArticleService);                 // public: template reads signals
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
}
