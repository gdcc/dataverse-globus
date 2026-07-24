import {Component, Input,  OnChanges, OnInit} from '@angular/core';
import {TransferData} from '../models/transfer-data';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {NavigateTemplateComponent} from '../navigate-template/navigate-template.component';
import {EndpointTemplateComponent} from '../endpoint-template/endpoint-template.component';
import {MatSnackBar} from '@angular/material/snack-bar';


interface SelFilesType {
  fileNameObject: any;
  directory: string;
}


@Component({
  selector: 'app-personal-connect',
  standalone: true,
  imports: [
    TranslateModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    NavigateTemplateComponent,
    EndpointTemplateComponent
  ],
  templateUrl: './personal-connect.component.html',
  styleUrls: ['./personal-connect.component.css']
})
export class PersonalConnectComponent implements OnChanges, OnInit {

  constructor() { }

  @Input() dataTransfer: TransferData;
  @Input() type: number; // 0 - left, 1 - right, 2 - center
  load: boolean;
  selectedEndPoint: any;
  personalConnectEndpoints: any[];

  ngOnInit(): void {
    this.load = false;
  }

  ngOnChanges() {
    this.load = false;
  }

  personalConnectExist() {
    return typeof this.personalConnectEndpoints !== 'undefined' && this.personalConnectEndpoints.length > 0;
  }

  setSelectedEndpoint(event) {
    this.selectedEndPoint = event;
  }

  ifLoaded(event) {
    this.personalConnectEndpoints = event;
    this.load = true;
  }

}
