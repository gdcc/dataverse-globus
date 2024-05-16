import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';

import {GlobusService} from '../globus.service';
import {flatMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-select-directory',
    standalone: true,
    imports: [
        TranslateModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatSelectModule,
        NgIf,
        ReactiveFormsModule,
        NgForOf,
        MatGridListModule,
        MatIconModule,
        MatListModule,
        MatDialogModule
    ],
  templateUrl: './select-directory.component.html',
  styleUrls: ['./select-directory.component.css']
})
export class SelectDirectoryComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public passingData: any,
              private globusService: GlobusService) { }
  dirs: Array<object>;
  @Output() updateSelectedDirectoryEvent = new EventEmitter<string>();

  ngOnInit(): void {
    console.log(this.passingData);
    this.dirs = new Array<object>();
    this.findDirectories()
        .subscribe(
            data => this.processDirectories(data),
            error => {
              console.log(error);
              // this.load = true;
            },
            () => {
              // console.log(this.checkFlag);
              // this.accessEndpointFlag = true;
              // this.load = true;
            }
        );
  }

  findDirectories() {
    console.log(this.passingData.selectedDirectory);
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.passingData.selectedEndPoint.id + '/ls?path=' +
        this.passingData.selectedDirectory;
    return this.globusService
        .getGlobus(url, 'Bearer ' + this.passingData.dataTransfer.userAccessTokenData);
  }

  processDirectories(data) {
    console.log(data);
    this.passingData.selectedDirectory = data.path;
    this.dirs = new Array<object>();
    for (const obj of data.DATA) {
      if (obj.type === 'dir') {
        this.dirs.push(obj);
      }
    }
  }

  openDirectory( item) {
    const selectedDirectory = this.passingData.selectedDirectory + item.name + '/';
    this.globusService.getDirectory(selectedDirectory,
        this.passingData.selectedEndPoint.id,
        this.passingData.dataTransfer.userAccessTokenData)
        .subscribe(
            data => {
              console.log(data);
              this.processDirectories(data);
            },
            error => {
              console.log(error);
            },
            () => {
              // check.checked = false;
            }
        );
  }

  UpOneFolder() {

    this.globusService.getDirectory(this.passingData.selectedDirectory,
        this.passingData.selectedEndPoint.id,
        this.passingData.dataTransfer.userAccessTokenData)
        .pipe(flatMap(data => this.upFolderProcess(data)))
        .subscribe(
            data => {
              if (data !== null) {
                this.processDirectories(data);
              }
            },
            error => {
              console.log(error);
            },
            () => {
              // this.checkFlag = false;
            }
        );
  }

  upFolderProcess(data) {
      let absolutePath = data.absolute_path;
      if (data.absolute_path == null || data.absolute_path === 'null') {
          absolutePath = data.path;
      }

      if (absolutePath !== null && absolutePath.localeCompare('/') !== 0) {
      const temp = absolutePath.substr(0, absolutePath.lastIndexOf('/') - 1);
      const path = temp.substr(0, temp.lastIndexOf('/')) + '/';
      return this.globusService.getDirectory(path,
          this.passingData.selectedEndPoint.id,
          this.passingData.dataTransfer.userAccessTokenData);
    } else {
      return of(null);
    }
  }

  submit(directory) {
    console.log(directory);
    if (directory !== null) {
        const selectedDirectory = this.passingData.selectedDirectory + directory + '/';
        this.updateSelectedDirectoryEvent.emit(selectedDirectory);
    }
  }

}
