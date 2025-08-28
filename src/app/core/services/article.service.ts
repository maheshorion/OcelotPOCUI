import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Article } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;        

  
  readonly articles = signal<Article[] | null>(null);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

 
  readonly lastUrl    = signal<string | null>(null);
  readonly lastStatus = signal<number | null>(null);

  loadAll(): void {
    const url = `${this.base}/article-api`;   
    this.loading.set(true);
    this.error.set(null);
    this.lastUrl.set(url);
    console.debug('[ArticleService] GET', url);

    this.http.get<unknown>(url, { observe: 'response' }).subscribe({
      next: (resp: HttpResponse<unknown>) => {
        this.lastStatus.set(resp.status);
        const arr = this.pickFirstArray(resp.body);
        console.debug('[ArticleService] picked length:', arr.length, resp.body);

        const list = arr.map(this.mapToArticle);
        list.sort((a, b) =>
          (b.publishedDate ? +new Date(b.publishedDate) : 0) -
          (a.publishedDate ? +new Date(a.publishedDate) : 0)
        );

        this.articles.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ArticleService] error', err);
        this.lastStatus.set(err?.status ?? null);
        this.error.set('Failed to load articles.');
        this.loading.set(false);
      }
    });
  }

  
  private pickFirstArray(body: unknown): any[] {
    if (Array.isArray(body)) return body;
    if (!body || typeof body !== 'object') return [];
    const obj = body as Record<string, unknown>;

    const names = ['data','items','result','records','value','payload','response','$values'];
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (Array.isArray(v)) return v;
      if (v && typeof v === 'object') {
        const found = this.pickFirstArray(v);
        if (found.length) return found;
      }
      if (names.includes(k)) {
        const vv = obj[k];
        if (Array.isArray(vv)) return vv;
        if (vv && typeof vv === 'object') {
          const found = this.pickFirstArray(vv);
          if (found.length) return found;
        }
      }
    }
    return [];
  }

  private mapToArticle = (x: any): Article => {
    const get  = (keys: string[], fb: any = '') => keys.find(k => x?.[k] != null) ? x[keys.find(k => x?.[k] != null)!] : fb;
    const num  = (keys: string[], fb=0) => Number(get(keys, fb)) || 0;
    const bool = (keys: string[], fb=false) => !!get(keys, fb);
    const arr  = (keys: string[], fb: any[]=[]) => (get(keys, fb) ?? []) as any[];

    return {
      id: get(['id','Id','ID','articleId','ArticleId'],''),
      title: get(['title','Title','name','Name'],''),
      content: get(['content','Content','body','Body','description','Description'],''),
      author: get(['author','Author','createdBy','CreatedBy'],''),
      publishedDate: get(['publishedDate','PublishedDate','createdOn','CreatedOn','date','Date'],''),
      category: get(['category','Category','type','Type'],''),
      isFeatured: bool(['isFeatured','IsFeatured'], false),
      readTimeMinutes: num(['readTimeMinutes','ReadTimeMinutes','readTime','ReadTime'], 0),
      imageUrl: get(['imageUrl','ImageUrl','image','Image'],''),
      likesCount: num(['likesCount','LikesCount','likes','Likes'], 0),
      commentsCount: num(['commentsCount','CommentsCount','comments','Comments'], 0),
      tags: arr(['tags','Tags'], []),
      isPublished: bool(['isPublished','IsPublished','published','Published'], false),
      lastModified: get(['lastModified','LastModified','updatedOn','UpdatedOn'],''),
      summary: get(['summary','Summary','shortDescription','ShortDescription'],'')
    } as Article;
  };
}
