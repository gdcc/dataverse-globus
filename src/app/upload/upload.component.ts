import { Component, OnInit } from '@angular/core';
import {ConfigService} from '../config.service';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {InterfaceComponent} from '../interface/interface.component';
import {MatTabsModule} from '@angular/material/tabs';
import {SearchEndpointComponent} from '../search-endpoint/search-endpoint.component';
import {PersonalConnectComponent} from '../personal-connect/personal-connect.component';
import {RecentlyViewedComponentComponent} from '../recently-viewed-component/recently-viewed-component.component';
import {ReferencedComponent} from '../referenced/referenced.component';

export interface TransferData {
  load: boolean;
  userAccessTokenData: any;
  basicClientToken: string;
  datasetDirectory: string;
  globusEndpoint: string;
  datasetPid: string;
  datasetVersion: string;
  datasetId: string;
  key: string;
  siteUrl: string;
  files: any;
  fileMetadataId: string;
  storePrefix: string;
  signedUrls: any;
  managed: boolean;
  referenceEndpointsWithPaths: Array<string>;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    TranslateModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    InterfaceComponent,
    MatTabsModule,
    SearchEndpointComponent,
    PersonalConnectComponent,
    RecentlyViewedComponentComponent,
    ReferencedComponent
  ],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  constructor(private config: ConfigService) { }
  redirectURL: string;
  dataTransfer: TransferData;
  action: boolean; // true for upload


  ngOnInit(): void {
    this.redirectURL = this.config.redirectUploadURL;
    this.dataTransfer = {} as TransferData;
    this.dataTransfer.load = false;
    this.action = true;
  }

  ifLoaded(dataTransfer: TransferData) {
    this.dataTransfer = dataTransfer;
    console.log(this.dataTransfer);
    console.log('Loaded!!!');
  }

}
