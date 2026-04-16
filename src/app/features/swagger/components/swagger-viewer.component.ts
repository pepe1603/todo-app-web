import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-swagger-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="swagger-container">
      <div class="swagger-header">
        <h2>📚 Documentación API - Swagger</h2>
        <button class="btn-refresh" (click)="refresh()">🔄 Refresh</button>
      </div>
      <iframe [src]="swaggerUrl" class="swagger-iframe" frameborder="0" allowfullscreen> </iframe>
    </div>
  `,
  styles: [
    `
      .swagger-container {
        height: calc(100vh - 100px);
        display: flex;
        flex-direction: column;
        padding: 20px;
        background: #f5f5f5;
      }
      .swagger-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      .swagger-header h2 {
        margin: 0;
        color: #333;
      }
      .btn-refresh {
        padding: 8px 16px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-refresh:hover {
        background: #764ba2;
      }
      .swagger-iframe {
        flex: 1;
        width: 100%;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class SwaggerViewerComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);

  swaggerUrl!: SafeResourceUrl;

  private getApiUrl(): string {
    return environment.apiUrl;
  }

  ngOnInit() {
    this.loadSwagger();
  }

  loadSwagger() {
    const apiUrl = this.getApiUrl();
    const swaggerUrl = `${apiUrl}/swagger-ui/index.html`;
    this.swaggerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(swaggerUrl);
  }

  refresh() {
    this.loadSwagger();
  }
}
