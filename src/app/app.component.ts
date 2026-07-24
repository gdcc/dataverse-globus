import { Component } from '@angular/core';

// import { MatomoInjector } from 'ngx-matomo';
// import { ConfigService } from './config.service';

export interface Config {
  baseUrl: string,
  id: number,
  redirectUploadURL: string,
  redirectDownloadURL: string,
  redirectDownloadFileURL: string,
  globusClientId: string,
  globusEndpoint: string,
  includeBucketInPath: boolean,
  apiToken: string
}

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
  //  private config: ConfigService
//    private matomoInjector: MatomoInjector
  ) {
//    this.matomoInjector.init(this.config.baseUrl, this.config.id);
  }
  title = 'globus';
}
