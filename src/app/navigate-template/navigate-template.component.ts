import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {catchError, flatMap} from 'rxjs/operators';
import {Observable, forkJoin, of, throwError} from 'rxjs';
import {GlobusService} from '../globus.service';
import {TransferData} from '../upload/upload.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldControl, MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatListModule, MatListOption} from '@angular/material/list';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatInputModule} from '@angular/material/input';
import {CdkFixedSizeVirtualScroll, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import mime from 'mime';
import {CustomSnackbarComponent} from "../custom-snackbar/custom-snackbar.component";

export interface SelFilesType {
  fileNameObject: any;
  directory: string;
}

@Component({
  selector: 'app-navigate-template',
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
    MatCheckboxModule,
    MatListModule,
    FormsModule,
    MatInputModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll
  ],
  templateUrl: './navigate-template.component.html',
  styleUrls: ['./navigate-template.component.css']
})
export class NavigateTemplateComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public snackBar: MatSnackBar) {
  }

  @Input() transferData: TransferData;
  @Input() selectedEndPoint: any;

  checkFlag: boolean;
  personalDirectories: any;
  selectedOptions: any;
  selectedFiles: Array<SelFilesType>;
  selectedDirectory: any;
  listOfAllFiles: Array<string>;
  listOfFileNames: Array<string>;
  listOfAllStorageIdentifiers: Array<string>;
  listOfAllStorageIdentifiersPaths: Array<string>;
  listOfDirectoryLabels: Array<string>;
  taskId: string;
  accessEndpointFlag: boolean;
  load: boolean;
  ruleId: string;
  clientToken: any;
  preventSingleClick = false;
  timer: any;

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.startComponent();
  }

  startComponent() {
    this.load = false;
    this.ruleId = null;
    this.clientToken = null;
    this.accessEndpointFlag = false;
    this.selectedFiles = new Array<SelFilesType>();
    this.checkFlag = false;
    this.listOfAllFiles = new Array<string>();
    this.listOfFileNames = new Array<string>();
    this.listOfDirectoryLabels = new Array<string>();
    this.listOfAllStorageIdentifiers = new Array<string>();
    this.listOfAllStorageIdentifiersPaths = new Array<string>();
    if (typeof this.transferData.userAccessTokenData !== 'undefined' && typeof this.selectedEndPoint !== 'undefined') {
      // this.userOtherAccessToken = this.userAccessTokenData.other_tokens[0].access_token;
      // this.userAccessToken = this.userAccessTokenData.access_token;
      this.findDirectories()
          .subscribe(
              data => this.processDirectories(data),
              error => {
                console.log(error);
                this.load = true;
              },
              () => {
                this.accessEndpointFlag = true;
                this.load = true;
              }
          );
    }
  }

  findDirectories() {
    if (this.selectedEndPoint.default_directory == null) {
      this.selectedDirectory = '~/';
    } else {
      this.selectedDirectory = this.selectedEndPoint.default_directory;
    }
    const url = 'https://transfer.api.globusonline.org/v0.10/operation/endpoint/' + this.selectedEndPoint.id + '/ls';
    return this.globusService
        .getGlobus(url, 'Bearer ' + this.transferData.userAccessTokenData.other_tokens[0].access_token);

  }

  searchDirectory(directory) {
    this.checkFlag = false;
    this.selectedDirectory = directory;
    this.globusService.getDirectory(this.selectedDirectory,
        this.selectedEndPoint.id,
        this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .subscribe(
            data => {
              this.processDirectories(data);
            },
            error => {
              console.log(error);
            },
            () => {
            }
        );
  }

  preparedForTransfer() {
    return this.selectedFiles.length > 0;
  }

  selectAll($event, directory) {
    this.checkFlag = false;
    if ($event.checked) {
      for (const obj of this.personalDirectories) {
        this.selectedOptions.push(obj);

        const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory};
        const indx = this.selectedFiles.findIndex(x =>
            x.fileNameObject['name'] === file.fileNameObject['name'] &&
            x.fileNameObject['type'] === file.fileNameObject['type'] &&
            x.directory === file.directory
        );
        if (indx === -1) {
          this.selectedFiles.push(file);
        }
      }
      this.checkFlag = true;
      directory.writeValue(this.personalDirectories);
    } else {
      this.checkFlag = false;
      for (const obj of this.personalDirectories) {

        const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory};
        const indx = this.selectedFiles.findIndex(x =>
            x.fileNameObject['name'] === file.fileNameObject['name'] &&
            x.fileNameObject['type'] === file.fileNameObject['type'] &&
            x.directory === this.selectedDirectory
        );
        if (indx !== -1) {
          this.selectedFiles.splice(indx, 1);
        }
      }
      this.selectedOptions = new Array<object>();
      directory.writeValue(this.selectedOptions);
    }
  }

  UpOneFolder() {
    if (this.selectedDirectory === '/~/' ) {
      return;
    }
    this.globusService.getDirectory(this.selectedDirectory,
        this.selectedEndPoint.id,
        this.transferData.userAccessTokenData.other_tokens[0].access_token)
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
              this.checkFlag = false;
            }
        );
  }

  upFolderProcess(data) {
    // let absolutePath = data.absolute_path;
    let absolutePath = data['path'];
    if (data.absolute_path == null || data.absolute_path === 'null') {
       absolutePath = data.absolute_path;
    }
    if (absolutePath !== null && absolutePath.localeCompare('/') !== 0) {
      const temp = absolutePath.substr(0, absolutePath.lastIndexOf('/') - 1);
      const path = temp.substr(0, temp.lastIndexOf('/')) + '/';
      return this.globusService.getDirectory(path,
          this.selectedEndPoint.id,
          this.transferData.userAccessTokenData.other_tokens[0].access_token);
    } else {
      return of(null);
    }
  }

  processDirectories(data) {
    this.selectedOptions = new Array<object>();
    this.personalDirectories = new Array<object>();
    this.selectedDirectory = data.path;
    for (const obj of data.DATA) {
      this.personalDirectories.push(obj);
    }
  }

  onSelection($event) {
    this.preventSingleClick = false;
    const delay = 400;
    this.timer = setTimeout(() => {
      if (!this.preventSingleClick) {
        if (this.selectedFiles == null) {
          this.selectedFiles = new Array<SelFilesType>();
        }
        if ($event.options[0].selected) {
          const indx = this.selectedFiles.findIndex(x =>
              x.fileNameObject['type'] === $event.options[0]._value['type'] &&
              x.fileNameObject['name'] === $event.options[0]._value['name'] &&
              x.directory === this.selectedDirectory
          );
          if (indx === -1) {
            this.selectedFiles.push({fileNameObject: $event.options[0]._value, directory: this.selectedDirectory});
            this.selectedOptions.push($event.options[0]._value);
          }
        } else {
          const indx = this.selectedFiles.findIndex(x =>
              x.fileNameObject['type'] === $event.options[0]._value['type'] &&
              x.fileNameObject['name'] === $event.options[0]._value['name'] &&
              x.directory === this.selectedDirectory
          );
          if (indx !== -1) {
            this.selectedFiles.splice(indx, 1);
            this.checkFlag = false;
          }
          const indx2 = this.selectedOptions.findIndex(x =>
              x['type'] === $event.options[0]._value['type'] &&
              x['name'] === $event.options[0]._value['name']
          );
          if (indx2 !== -1) {
            this.selectedOptions.splice(indx, 1);
          }
        }
      }
    }, delay);
  }

  checkBox($event, item) {
    if (!$event.checked) {
      this.checkFlag = false;
    }
  }

  openDirectory($event, item, directory, check) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.selectedOptions = new Array<object>();
    if (item.type === 'dir') {
      this.selectedDirectory = this.selectedDirectory + item.name;

      this.globusService.getDirectory(this.selectedDirectory,
          this.selectedEndPoint.id,
          this.transferData.userAccessTokenData.other_tokens[0].access_token)
          .subscribe(
              data => {
                this.processDirectories(data);
              },
              error => {
                console.log(error);
              },
              () => {
                this.selectedOptions = new Array<object>();
                directory.writeValue(this.selectedOptions);
                check.checked = false;
              }
          );
    }
  }

  isFolder(item) {
    return item.type === 'dir';

  }

  removeAllFromSelected(directory) {
    this.selectedFiles = new Array<SelFilesType>();
    directory.writeValue(null);
    this.selectedOptions = [];
    this.checkFlag = false;
  }

  onRemoving(selectedFile: MatListOption[], selectedList) {
    const files = selectedFile.map(o => o.value);
    files.forEach(file => {
      const indx = this.selectedFiles.indexOf(file);
      if (indx !== -1) {
        this.selectedFiles.splice(indx, 1);
        const indx2 = this.selectedOptions.indexOf(file.fileNameObject);
        if (indx2 !== -1) {
          this.selectedOptions.splice(indx2, 1);

          selectedList.writeValue(this.selectedOptions);
          this.checkFlag = false;
        }
      }
    });
  }

  onSubmitTransfer() {
    if (this.transferData.datasetPid.localeCompare('null') !== 0) {
      this.snackBar.open('Preparing transfer', '', {
        duration: 3000
      });
      const directoriesArray = [];
      const labelsArray = [];

      for (const obj of this.selectedFiles) {
        if (obj.fileNameObject.type === 'dir') {
          directoriesArray.push(obj.directory + obj.fileNameObject.name);
          labelsArray.push(obj.directory);
        } else {
          this.listOfAllFiles.push(obj.directory + obj.fileNameObject.name);
          this.listOfFileNames.push(obj.fileNameObject.name);
          this.listOfDirectoryLabels.push('');
        }
      }
      if (directoriesArray.length > 0) {
        this.findAllSubFiles(directoriesArray, 0, labelsArray);
      } else {
        if (this.listOfAllFiles.length > 0) {
          const user = this.globusService.getUserInfo(this.transferData.userAccessTokenData.access_token);

          // const client = this.globusService.getClientToken(this.transferData.basicClientToken);

          const array = [user]; // forkJoin;
          this.submit(array);
        }
      }
    } else {
      this.snackBar.open('Dataset directory is not provided', '', {
        duration: 3000
      });
    }
  }

  findAllSubFiles(directory, i, labelsArray) {
    this.globusService.getDirectory(directory[i],
        this.selectedEndPoint.id, this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .pipe(flatMap(d => this.globusService.getInnerDirectories(d, this.selectedEndPoint.id,
            this.transferData.userAccessTokenData.other_tokens[0].access_token)))
        .subscribe(
            dir => {
              this.saveDirectories(dir, i, labelsArray);
            },
            error => {
              console.log(error);
            },
            () => {
              i = i + 1;
              if (i < directory.length) {
                this.findAllSubFiles(directory, i, labelsArray);
                // this.submit(array);
              } else {
                const user = this.globusService.getUserInfo(this.transferData.userAccessTokenData.access_token);

                // const client = this.globusService.getClientToken(this.transferData.basicClientToken);

                const array = [user]; // forkJoin;
                this.submit(array);
              }
            }
        );
  }

  saveDirectories(dir, i, labelsArray) {
    const label = dir.path.substr(labelsArray[i].length);
    for (const obj of dir.DATA) {
      if (obj.type === 'file') {
        if (dir.absolute_path == null || dir.absolute_path === 'null') {
          this.listOfAllFiles.push(dir.path + obj.name);
        } else {
          this.listOfAllFiles.push(dir.absolute_path + obj.name);
        }
        this.listOfFileNames.push(obj.name);
        // this.listOfAllStorageIdentifiers.push(this.globusService.generateStorageIdentifier());

        this.listOfDirectoryLabels.push(label);
      }
    }
  }

  submit(array: Observable<Object> | Observable<Object>[]) {
    let urlPath = '';
    let body = null;
    if (this.transferData.managed) {

      for (const urlObject of this.transferData.signedUrls) {
        if (urlObject['name'] === 'requestGlobusTransferPaths') {
          urlPath = urlObject['signedUrl'];
          break;
        }
      }
    } else {
      for (const urlObject of this.transferData.signedUrls) {
        if (urlObject['name'] === 'requestGlobusReferencePaths') {
          urlPath = urlObject['signedUrl'];
          break;
        }
      }
    }
    const data = forkJoin(array)
        .pipe(flatMap(obj => {
          const user = obj[0];
          if (this.transferData.managed) {
            body = '{' +
                '"principal":"' + user['sub'] + '",' +
                '"numberOfFiles":' + this.listOfAllFiles.length +
                '}';
          } else {
            let i = 0;
            let files = '';
            for (const f of this.listOfAllFiles) {
              i = i + 1;
              if (i < this.listOfAllFiles.length) {
                files = files + '"' + this.selectedEndPoint.id + f + '",';
              } else {
                files = files + '"' + this.selectedEndPoint.id  + f + '"';
              }

            }

            body = '{"referencedFiles":[' + files + ']}';
          }
          return this.globusService.postSimpleDataverse(urlPath, body); }),
              catchError(err => {
                console.log(err);
                return throwError(err);
         }));
    if (this.transferData.managed) {
         data.
          pipe(flatMap(data => this.my_func2(data)))
              .pipe(flatMap(data => this.my_func(data)))
              .subscribe(
                  data => {
                    this.taskId = data['task_id'];
                  },
                  error => {
                    console.log(error);
                    this.snackBar.open('There was an error in transfer submission. BIIG ', '', {
                      duration: 3000
                    });
                  },
                  () => {
                    this.writeToDataverse();
                  }
              );
        } else {
          data
              .subscribe(
                  data => {
                    Object.keys(data['data']).forEach(prop => {
                      this.listOfAllStorageIdentifiers.push(prop);
                      this.listOfAllStorageIdentifiersPaths.push(data['data'][prop]);
                    });
                  },
                  error => {
                    console.log(error);
                    this.snackBar.open('There was an error in transfer submission. BIIG ', '', {
                      duration: 3000
                    });
                  },
                  () => {
                    this.writeToDataverse();
                  }
              );
        }
  }

  my_func2(data) {
      Object.keys(data['data']).forEach(prop => {
        this.listOfAllStorageIdentifiers.push(prop);
        this.listOfAllStorageIdentifiersPaths.push(data['data'][prop]);
      });

      data = this.globusService.submitTransfer(this.transferData.userAccessTokenData.other_tokens[0].access_token);

      return data;
  }

  my_func(data) {
        return this.globusService.submitTransferItems(
            this.listOfAllFiles,
            this.listOfAllStorageIdentifiersPaths,
            this.listOfAllStorageIdentifiersPaths,
            data['value'],
            this.selectedEndPoint.id,
            this.transferData.globusEndpoint,
            this.transferData.userAccessTokenData.other_tokens[0].access_token);
}

  writeToDataverse() {
    const formData: any = new FormData();
    let body = '';
    if (this.transferData.managed) {
      body = '{ \"taskIdentifier\": \"' + this.taskId + '\","files":';
    } else {

    }

    body = body + '[';

    let file = '';
    for (let i = 0; i < this.listOfAllStorageIdentifiers.length; i++) {
      if (i > 0) {
        file = ',';
      } else {
        file = '';
      }
      file = file + '{ \"description\": \"\", \"directoryLabel\": \"' +
          this.listOfDirectoryLabels[i] + '\", \"restrict\": \"false\",' +
          '\"storageIdentifier\":\"'; // 's3://dataverse:' + // this.transferData.storePrefix +
      if (this.transferData.managed) {
            file = file + this.listOfAllStorageIdentifiers[i] + '\",' +
            '\"fileName\":' + '\"' + this.listOfFileNames[i] + '\"';
          } else {
            file = file + this.listOfAllStorageIdentifiersPaths[i] + '\",' +
                '\"fileName\":' + '\"' + this.listOfFileNames[i] + '\"';
          }
      if (!this.transferData.managed) {
        let type = mime.getType(this.listOfFileNames[i]);
        if (type == null) {
          type = 'text/plain';
        }
        file = file + ',"mimeType":"' + type + '", "checksum": {"@type": "MD5", "@value": "Not in Dataverse"}';
      }
      file = file +  ' } ';
      body = body + file;
    }

    if (this.transferData.managed) {
      body = body + ']}';
    } else {
      body = body + ']';
    }
    formData.append('jsonData', body);

    let url = '';
    for (const urlObject  of this.transferData.signedUrls) {
      if ((this.transferData.managed && urlObject['name'] === 'addGlobusFiles') ||
          (!this.transferData.managed && urlObject['name'] === 'addFiles')) {
        url = urlObject['signedUrl'];
      }
    }
    this.globusService.postDataverse(url, formData)
        .subscribe(
            data => {
            },
            error => {
              console.log(error);
              // this.removeRule();
              this.snackBar.open('There was an error in transfer submission. ', '', {
                duration: 3000
              });
            },
            () => {
              // http://localhost:8080/dataset.xhtml?persistentId=doi:10.5072/FK2/CBYQG2
              const urlDataset = this.transferData.siteUrl + '/' + 'dataset.xhtml?persistentId=' + this.transferData.datasetPid;
              this.snackBar.openFromComponent(CustomSnackbarComponent, {
                data: ['Transfer was initiated. \n Go to the dataverse dataset to monitor the progress.',
                  urlDataset],
                duration: 5000
              });
            }
        );
  }

  selectedDirectoryExist() {
    if (typeof this.selectedDirectory !== 'undefined' && this.selectedDirectory !== null) {
      return true;
    } else {
      return false;
    }
  }

}
