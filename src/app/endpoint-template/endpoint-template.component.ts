import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {TransferData} from '../upload/upload.component';
import {GlobusService} from '../globus.service';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {forkJoin, Observable, Subject, throwError} from 'rxjs';
import {catchError, flatMap} from 'rxjs/operators';

@Component({
  selector: 'app-endpoint-template',
  standalone: true,
  imports: [
    TranslateModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    MatGridListModule
  ],
  templateUrl: './endpoint-template.component.html',
  styleUrls: ['./endpoint-template.component.css']
})
export class EndpointTemplateComponent implements OnInit, OnChanges {

  selectedEndPoint: any;

  personalConnectEndpoints: Array<object>;

  @Input() type: number;
  @Input() transferData: TransferData;
  @Input() typeOfTab: number; // 0 - personal 1 - recently viewed
  @Output() newItemEvent = new EventEmitter<any>();
  @Output() loadedEvent = new EventEmitter<any>();

  selectedDirectory: string;
  constructor(private globusService: GlobusService) { }
  load: boolean;

  ngOnInit(): void {
    this.load = false;
  }

  ngOnChanges() {

    this.personalConnectEndpoints = new Array<object>();
    if (typeof this.transferData.userAccessTokenData !== 'undefined') {

      if (this.typeOfTab === 0 || this.typeOfTab === 1) {
        this.getPersonalConnect(this.transferData.userAccessTokenData.other_tokens[0].access_token)
            .subscribe(
                data => this.processPersonalConnect(data),
                error => {
                  console.log(error);
                  this.loadedEvent.emit(this.personalConnectEndpoints);
                },
                () => {
                  this.loadedEvent.emit(this.personalConnectEndpoints);
                  if (this.personalConnectExist()) {
                    this.selectedEndPoint = this.personalConnectEndpoints[0];
                    this.newItemEvent.emit(this.selectedEndPoint);
                  }
                }
            );
      } else {
        //referenced
        const endpoitsObsevables = this.getAllEndpoints();
        forkJoin(endpoitsObsevables)
            .subscribe(obj => {
                  this.processPersonalConnect(obj);
                },
                error => {
                  console.log(error);
                  this.loadedEvent.emit(this.personalConnectEndpoints);
                },
                () => {
                  this.loadedEvent.emit(this.personalConnectEndpoints);
                  if (this.personalConnectExist()) {
                    this.selectedEndPoint = this.personalConnectEndpoints[0];
                    this.newItemEvent.emit(this.selectedEndPoint);
                  }
                });
      }
    }
  }
  getAllEndpoints() {
    const array = new Array();
    for (const endPoint of this.transferData.referenceEndpointsWithPaths) {
      const userOtherAccessToken = this.transferData.userAccessTokenData.other_tokens[0].access_token;
      const url = 'https://transfer.api.globusonline.org/v0.10/endpoint/' + endPoint;
      array.push(this.globusService.getGlobus(url, 'Bearer ' + userOtherAccessToken));
    }
    return array;
  }

  getPersonalConnect(userAccessToken) {
    let url = '';
    if (this.typeOfTab === 0) {
      url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_scope=my-gcp-endpoints';
    } else if (this.typeOfTab === 1) {
      url = 'https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_scope=recently-used';
    }

    return this.globusService
        .getGlobus(url, 'Bearer ' + userAccessToken);
  }

  processPersonalConnect(data) {
    this.personalConnectEndpoints = new Array<object>();
    if (this.typeOfTab === 0) {
      for (const obj of data.DATA) {
        if (obj.gcp_connected) {
          this.personalConnectEndpoints.push(obj);
        }
      }
    } else if (this.typeOfTab === 1) {
      for (const obj of data.DATA) {
        this.personalConnectEndpoints.push(obj);
      }
    } else {
      for (const obj of data) {
        this.personalConnectEndpoints.push(obj);
      }
    }
    if (this.personalConnectEndpoints.length === 0) {
      console.log('Globus Connect Personal is not connected');
    } else {
      this.selectedEndPoint = this.personalConnectEndpoints[0];
    }

  }

  personalConnectExist() {
    return typeof this.personalConnectEndpoints !== 'undefined' && this.personalConnectEndpoints.length > 0;
  }

  setSelectedEndpoint(event) {
    this.selectedEndPoint = event.value;
    this.newItemEvent.emit(this.selectedEndPoint);
  }

}
