import { Component, OnInit, inject } from '@angular/core';
import {ConfigService} from '../config.service';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';

import {ReactiveFormsModule} from '@angular/forms';
import {InterfaceComponent} from '../interface/interface.component';
import {MatTabsModule} from '@angular/material/tabs';
import {SearchEndpointComponent} from '../search-endpoint/search-endpoint.component';
import {PersonalConnectComponent} from '../personal-connect/personal-connect.component';
import {RecentlyViewedComponentComponent} from '../recently-viewed-component/recently-viewed-component.component';
import {ReferencedComponent} from '../referenced/referenced.component';

import {TransferData} from '../models/transfer-data';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    TranslateModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
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
  private config = inject(ConfigService);

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
  }

}
