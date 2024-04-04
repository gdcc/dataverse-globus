import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {GlobusService} from '../globus.service';
import {TransferData} from '../upload/upload.component';
import {catchError, flatMap} from 'rxjs/operators';
import {forkJoin, of, throwError} from 'rxjs';
import {Stack} from '../stack';
import {SelectDirectoryComponent} from '../select-directory/select-directory.component';
import {ConfigService} from '../config.service';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatListModule} from '@angular/material/list';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatInput} from '@angular/material/input';
import {CdkFixedSizeVirtualScroll, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {SelFilesType} from '../navigate-template/navigate-template.component';

export interface PassingDataSelectType {
  dataTransfer: TransferData;
  selectedEndPoint: any;
  selectedDirectory: string;
}

@Component({
  selector: 'app-navigate-template-download',
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
        MatInput,
        CdkFixedSizeVirtualScroll,
        CdkVirtualScrollViewport
    ],
  templateUrl: './navigate-template-download.component.html',
  styleUrls: ['./navigate-template-download.component.css']
})
export class NavigateTemplateDownloadComponent implements OnInit, OnChanges {

  constructor(private globusService: GlobusService,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              private configService: ConfigService) {
  }

  @Input() transferData: TransferData;
  @Input() selectedEndPoint: any;
  @Input() type: number;

  public dialogRef: MatDialogRef<SelectDirectoryComponent>;
  selectedDirectory: string;
  files: Array<string>;
  paths: Array<object>;
  levels: Stack<object>;
  allDataFiles: Array<any>;

  loaded: boolean;
  tree: any;

  checkFlag: boolean;
  personalDirectories: any;
  selectedOptions: any;
  selectedFiles: Array<object>;
  isSingleClick: boolean;
  storageIdentifiers: Array<string>;
  listOfAllFiles: Array<object>;
  listOfAllPaths: Array<string>;
  taskId: string;
  ruleId: string;
  clientToken: any;
  accessEndpointFlag: boolean;




  ngOnInit(): void {
    if (this.selectedEndPoint.default_directory == null) {
      this.selectedDirectory = '~/';
    } else {
      this.selectedDirectory = this.selectedEndPoint.default_directory;
      console.log(this.selectedEndPoint);
    }
    // Not needed - ngOnChanges is called prior to ngOnInit
    // this.startComponent();
  }

  ngOnChanges() {
    this.startComponent();
  }

  startComponent() {
    console.log(this.type);
    console.log(this.transferData);
    this.ruleId = null;
    this.clientToken = null;
    this.selectedFiles = new Array<object>();
    this.loaded = false;
    this.accessEndpointFlag = false;
    if (this.selectedEndPoint.default_directory == null) {
      this.selectedDirectory = '~/';
    } else {
      this.selectedDirectory = this.selectedEndPoint.default_directory;
      console.log(this.selectedEndPoint);
    }
    if (typeof this.transferData.userAccessTokenData !== 'undefined' && typeof this.transferData.globusEndpoint !== 'undefined') {

      this.findDirectories()
          .subscribe(
              data => this.processDirectories(data),
              error => {
                console.log(error);
                this.loaded = true;
              },
              () => {
                this.loaded = true;
                this.accessEndpointFlag = true;
                console.log('complete');
              }
          );
    }
  }

  findDirectories() {
    console.log(this.transferData.siteUrl);
    let urlPath = '';
    if (this.type !== 2) {
      for (const urlObject of this.transferData.signedUrls) {
        // console.log(urlObject);
        if (urlObject['name'] === 'getFileListing') {
          urlPath = urlObject['signedUrl'];
          break;
        }
      }
      console.log(urlPath);
      return this.globusService.getDataverse(urlPath, null);
    } else {
      return of();
    }
  }
  processDirectories(data) {
    console.log(data);
    if (this.type !== 2) {
      console.log(data.data);
      this.files = new Array<string>();
      this.paths = new Array<object>();
      this.storageIdentifiers = new Array<string>();
      this.allDataFiles = new Array<any>();
      for (const obj of data.data) {
        console.log("PROCESS DIRECTORIES!!!");
        console.log(obj)
        console.log(this.transferData.files);
        console.log(this.transferData['files']);
        for (const f in this.transferData.files) {
          if (obj.dataFile.id == f) {
            if (typeof obj.directoryLabel !== 'undefined') {
              const fullFile = obj.directoryLabel + '/' + obj.label;
              this.files.push(fullFile);
              this.paths.push(fullFile.split('/'));
            } else {
              this.files.push(obj.label);
              this.paths.push(obj.label.split('/'));
            }
            console.log(obj.dataFile.storageIdentifier);
            console.log(obj.dataFile.storageIdentifier.split(':')[2]);
            this.storageIdentifiers.push(obj.dataFile.storageIdentifier.split(':')[2]);
            this.allDataFiles.push(obj.dataFile);
          }
        }
      }
      console.log(this.files);
      console.log(this.paths);
      this.personalDirectories = this.arrangeIntoTree(this.paths);
      this.tree = this.personalDirectories;
      console.log(JSON.stringify(this.personalDirectories, null, 4));
      this.levels = new Stack<object>();
      this.selectedOptions = new Array<object>();
    }
  }

  arrangeIntoTree(paths) {
    const tree = [];

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let currentLevel = tree;
      const storageId = this.storageIdentifiers[i];
      console.log(this.allDataFiles[i]);
      const fileId = this.allDataFiles[i].id;
      for (let j = 0; j < path.length; j++) {
        const part = path[j];

        const existingPath = this.findWhere(currentLevel, 'name', part);

        if (existingPath) {
          currentLevel = existingPath.children;
        } else {
          const newPart = {
            name: part,
            storageIdentifier: storageId,
            fId: fileId,
            children: [],
          };

          currentLevel.push(newPart);
          currentLevel = newPart.children;
        }
      }
    }
    return tree;
  }

  findWhere(array, key, value) {
    let t = 0; // t is used as a counter
    while (t < array.length && array[t][key] !== value) {
      t++;
    }
    if (t < array.length) {
      return array[t];
    } else {
      return false;
    }
  }



  selectAll($event, directory) {
    this.checkFlag = false;
    console.log($event);
    console.log(directory);
    if ($event.checked) {
      for (const obj of this.personalDirectories) {
        this.selectedOptions.push(obj);

       // const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory };
        console.log(obj);
        console.log(this.selectedFiles);
        const indx = this.selectedFiles.findIndex(x =>
            x['name'] === obj.name        );
        console.log(indx);
        if ( indx === -1) {
          this.selectedFiles.push(obj);
        }
      }
      this.checkFlag = true;
      directory.writeValue(this.personalDirectories);
    } else {
      console.log("Deselecting");
      this.checkFlag = false;
      for (const obj of this.personalDirectories) {

        const file: SelFilesType = {fileNameObject: obj, directory: this.selectedDirectory};
        console.log(this.selectedFiles);
        console.log(file.fileNameObject);
        const indx = this.selectedFiles.findIndex(x =>
            x['name'] === file.fileNameObject['name']
        );
        console.log('Remove');
        console.log(indx);
        if (indx !== -1) {
          this.selectedFiles.splice(indx, 1);
        }
      }
     /* for (const obj of this.personalDirectories) {
        const indx = this.selectedFiles.indexOf(obj);
        if (indx !== -1) {
          this.selectedFiles.splice(indx, 1);
        }
      }*/
      this.selectedOptions = new Array<object>();
      directory.writeValue(this.selectedOptions);
    }
  }

  onSelection($event) {
    console.log($event);
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick ){

        // const file: SelFilesType = {fileNameObject: $event.option._value, directory: this.selectedDirectory };
        if ($event.options[0]._selected) {
          console.log(this.selectedFiles);
          const indx = this.selectedFiles.findIndex(x =>
              x['name'] === $event.options[0]._value.name
          );
          console.log(indx);
          if ( indx === -1) {
            this.selectedFiles.push($event.options[0]._value);
          }
        } else {
          /*const indx = this.selectedFiles.indexOf($event.option._value);
          if ( indx !== -1) {
            this.selectedFiles.splice(indx, 1);
          }*/
          this.checkFlag = false;
        }
      }
    }, 250);
  }

  checkBox($event, item) {
    if (!$event.checked) {
      this.checkFlag = false;
    }
  }

  removeAllFromSelected(directory) {
    this.selectedFiles = new Array<object>();
    directory.writeValue(null);
    this.selectedOptions = new Array();
    this.checkFlag = false;
  }

  onRemoving($event, selectedList) {
    console.log($event);
    if ($event[0]._selected) {
      const indx = this.selectedFiles.indexOf($event[0]._value);
      if ( indx !== -1) {
        this.selectedFiles.splice(indx, 1);
        const indx2 = this.selectedOptions.indexOf($event[0]._value.name);
        if (indx2 !== -1) {
          this.selectedOptions.splice(indx2, 1);
          selectedList.writeValue(this.selectedOptions);
          this.checkFlag = false;
        }
      }
    }
  }

  isFolder(file) {
    console.log(this.personalDirectories);
    console.log(this.selectedFiles);
    console.log(file);
    if (file.children.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  UpOneFolder() {
    const up = this.levels.pop();
    console.log(up);
    if (typeof up !== 'undefined') {
      this.personalDirectories = up;
      this.checkFlag = false;
    }
  }

  openDirectory($event, item, directory, check) {
    this.isSingleClick = false;
    this.selectedOptions = new Array<object>();
    console.log(directory);
    this.selectedOptions = new Array<object>();
    if (item.children.length > 0) {
      this.levels.push(this.personalDirectories);
      // this.selectedDirectory = this.selectedDirectory + item.name;
      this.selectedOptions = new Array<object>();
      this.personalDirectories = item.children;
      directory.writeValue(this.selectedOptions);
      check.checked = false;
    }
  }
  findChildren(array, path) {
    console.log(array);
    for (const obj of array ) {
      if (obj.children.length === 0) {
        console.log(obj);
        this.listOfAllFiles.push(obj);
        this.listOfAllPaths.push(path);
      } else {
        this.findChildren(obj.children, path + obj.name + '/');
      }
    }
  }
  askRequestDownload(data) {
    console.log(data);
    const user = data[0];
    console.log(user);
    let json_data = '{ ' +
        '"principal":"' + user['sub'] + '",' +
        '"fileIds":[';
    let i = 0;
    for (const f of this.selectedFiles) {
      console.log(f);
      if (i > 0) {
        json_data = json_data + ',';
      }
      json_data = json_data + f['fId'];
      i++;
    }
    json_data = json_data + ']}';
    console.log(json_data);
    // curl -H "X-Dataverse-key:$API_TOKEN" -H "Content-type:application/json" -X POST -d "$JSON_DATA" "$SERVER_URL/api/datasets/:persistentId/requestGlobusDownload?persistentId=$PERSISTENT_IDENTIFIER"
    let urlPath = null;
    for (const urlObject of this.transferData.signedUrls) {
      console.log(urlObject);
      if (this.transferData.managed && urlObject['name'] === 'requestGlobusDownload') {
        urlPath = urlObject['signedUrl'];
        break;
      }
    }
    return this.globusService.postSimpleDataverse(urlPath, json_data);
  }
  onSubmitTransfer() {
    this.listOfAllFiles = new Array<object>();
    this.listOfAllPaths = new Array<string>();
    this.findChildren(this.selectedFiles, '');

    if (this.listOfAllFiles.length > 0) {
      const user = this.globusService.getUserInfo(this.transferData.userAccessTokenData.access_token);

      // const client = this.globusService.getClientToken(this.transferData.basicClientToken);

      const array = [user]; // forkJoin;

      forkJoin(array)
          .pipe(flatMap(data => this.askRequestDownload(data)))
          .pipe(flatMap(data => {
            console.log(data);
            return this.globusService.submitTransfer(this.transferData.userAccessTokenData.other_tokens[0].access_token);
          } ))
          .pipe(flatMap(data => this.globusService.submitTransferToUser(
              this.listOfAllFiles, this.listOfAllPaths, data['value'], this.transferData.datasetDirectory,
              this.selectedDirectory, this.transferData.globusEndpoint, this.selectedEndPoint,
              this.transferData.userAccessTokenData.other_tokens[0].access_token)))
          .subscribe(
              data => {
                console.log(data);
                this.taskId = data['task_id'];
                this.writeToDataverse(this.taskId);
              },
              error => {
                console.log(error);
                // this.removeRule();
                this.snackBar.open('There was an error in transfer submission. BIIG ', '', {
                  duration: 3000
                });
              },
              () => {
                console.log('Transfer submitted');

                // this.removeRule();
                this.snackBar.open('The transfer was submitted', '', {
                  duration: 3000
                });
              }
          );
    }
  }

  writeToDataverse(task_id) {
    console.log(task_id);
    let json_data = '{ ' +
        '"taskIdentifier":"' + task_id + '"';
    json_data = json_data + '}';
    console.log(json_data);
    let urlPath = null;
    for (const urlObject of this.transferData.signedUrls) {
      console.log(urlObject);
      if (this.transferData.managed && urlObject['name'] === 'monitorGlobusDownload') {
        urlPath = urlObject['signedUrl'];
        break;
      }
    }
    this.globusService.postSimpleDataverse(urlPath, json_data)
        .subscribe(
            data => {
              console.log(data);
            },
            error => {
              console.log(error);
              // this.removeRule();
              this.snackBar.open('There was an error in transfer submission. ', '', {
                duration: 3000
              });
            },
            () => {
              console.log('Submitted to dataverse');
              // this.removeRule();
            }
        );
  }

  removeRule() {
    console.log(this.ruleId);
    if (this.ruleId !== null && this.clientToken !== null && typeof this.ruleId !== 'undefined') {
      this.globusService.deleteRule(this.ruleId, this.transferData.globusEndpoint, this.clientToken)
          .subscribe(
              data => {
              },
              error => {
                console.log(error);
              },
              () => {
                console.log('Rule deleted');
              }
          );
    }
  }

  preparedForTransfer() {
    if (this.selectedFiles.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  selectDirectory() {
    const passingData: PassingDataSelectType = {
      dataTransfer: this.transferData,
      selectedEndPoint: this.selectedEndPoint,
      selectedDirectory: this.selectedDirectory
    };

    this.dialogRef = this.dialog.open(SelectDirectoryComponent, {
      data: passingData,
      width: '400px'
    });

    const sub = this.dialogRef.componentInstance.updateSelectedDirectoryEvent.subscribe((x) => {
      this.selectedDirectory = x;
      console.log(x);
    });
  }
  setDirectory(directory) {
    this.selectedDirectory = directory;
  }
  searchDirectory(directory) {
    this.checkFlag = false;
    this.selectedDirectory = directory;
    this.globusService.getDirectory(this.selectedDirectory,
        this.selectedEndPoint.id,
        this.transferData.userAccessTokenData.other_tokens[0].access_token)
        .subscribe(
            data => {
              console.log(data);
              this.processDirectories(data);
            },
            error => {
              console.log(error);
            },
            () => {
            }
        );
  }



}
