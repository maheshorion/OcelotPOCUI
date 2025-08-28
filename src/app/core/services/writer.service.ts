import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Writer } from '../models/writer.model';

@Injectable({ providedIn: 'root' })
export class WriterService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl; 

  
  readonly Writers  = signal<Writer[] | null>(null);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  
  readonly lastUrl    = signal<string | null>(null);
  readonly lastStatus = signal<number | null>(null);

  loadAll(): void {
    const url = `${this.base}/writer-api`;
    this.loading.set(true);
    this.error.set(null);
    this.lastUrl.set(url);
    console.debug('[WriterService] GET', url);

    this.http.get<unknown>(url, { observe: 'response' }).subscribe({
      next: (resp: HttpResponse<unknown>) => {
        this.lastStatus.set(resp.status);

        const arr = this.pickFirstArray(resp.body);

       
        const list = arr.map(this.mapToWriter) as Writer[];

        
        const toTicks = (d?: string) => {
          if (!d) return 0;
          const t = Date.parse(d);
          return Number.isNaN(t) ? 0 : t;
        };

        
        (list as Array<{ joinedDate?: string }>).sort(
          (a, b) => toTicks(b.joinedDate) - toTicks(a.joinedDate)
        );

        this.Writers.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[WriterService] error', err);
        this.lastStatus.set(err?.status ?? null);
        this.error.set('Failed to load Writers.');
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

  private mapToWriter = (x: any): Writer => {
    const str  = (v: any, fb = '') => (v ?? fb).toString();
    const num  = (v: any, fb = 0) => Number(v ?? fb) || 0;
    const bool = (v: any, fb = false) => Boolean(v ?? fb);

    return {
      id:               str(x.id ?? x.Id ?? x.ID),
      name:             str(x.name ?? x.Name ?? x.title ?? x.Title),
      bio:              str(x.bio ?? x.description ?? x.Description ?? x.content ?? x.Content),
      email:            str(x.email ?? x.author ?? x.Author ?? x.createdBy ?? x.CreatedBy),
      phone:            str(x.phone),
      profilePictureUrl:str(x.profilePictureUrl ?? x.avatarUrl ?? x.AvatarUrl),
      
      joinedDate:       str(x.joinedDate ?? x.JoinedDate ?? x.createdOn ?? x.CreatedOn ?? x.publishedDate ?? x.PublishedDate),
      articlesWritten:  num(x.articlesWritten ?? x.readTimeMinutes ?? x.ReadTimeMinutes),
      followers:        num(x.followers ?? x.likes ?? x.Likes ?? x.likesCount ?? x.LikesCount),
      isActive:         bool(x.isActive ?? x.isPublished ?? x.IsPublished),
    };
  };
}
