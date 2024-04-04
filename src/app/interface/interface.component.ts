import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { GlobusService } from '../globus.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {TransferData} from '../upload/upload.component';
import {Config} from '../app.component';
import * as ConfigJson from '../../assets/config.json';

import {NgForOf, NgIf} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

export interface Permissions {
    DATA_TYPE: string;
    principal_type: string;
    principal: string;
    path: string;
    permissions: string;
}

@Component({
    selector: 'app-interface',
    standalone: true,
    imports: [
        TranslateModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatSelectModule,
        NgIf,
        ReactiveFormsModule,
        NgForOf
    ],
    templateUrl: './interface.component.html',
    styleUrls: ['./interface.component.css']
})
export class InterfaceComponent implements OnInit {

    translate: TranslateService;
    @Input() redirectURL: string;
    @Output() newItemEvent = new EventEmitter<TransferData>();
    transferData: TransferData;
    languages: FormControl;
    langArray: Array<any> = [];
    signedUrlData: any;

    config: Config = (ConfigJson as any).default;

  constructor(private globusService: GlobusService,
              private translatePar: TranslateService) {

      this.translate = translatePar;
      this.translate.addLangs(['en', 'fr']);
      this.translate.setDefaultLang('en');
      this.langArray.push({value: 'en', viewValue: 'English'});
      this.langArray.push({value: 'fr', viewValue: 'Français'});

      const browserLang = this.translate.getBrowserLang();
      if (browserLang != null) {
          this.translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
      }
      this.languages = new FormControl(this.translate.currentLang);
  }
  title: string;
  dvLocale: string;

  ngOnInit(): void {
        this.transferData = {} as TransferData;
        this.transferData.load = false;
        this.title = 'Globus';
        console.log(this.redirectURL);

        this.transferData.datasetDirectory = null;
        this.transferData.basicClientToken = this.config.basicGlobusToken;
        this.transferData.globusEndpoint = this.config.globusEndpoint;
        const code = this.globusService.getParameterByName('code');
        const callback = this.globusService.getParameterByName('callback');
        console.log(callback);
        console.log(code);
        const dvLocale = this.globusService.getParameterByName('dvLocale');
        if (typeof callback !== 'undefined' && callback != null) {
          const code = this.getCode(callback, dvLocale);
        } else {
            console.log('else');
            this.getUserAccessToken(code);

        }
    }

    setLanguage() {
        if (this.dvLocale != null) {
            if (this.dvLocale === 'en') {
                this.translate.use('en');
            } else if (this.dvLocale === 'fr') {
                this.translate.use('fr');
            } else {
                const browserLang = this.translate.getBrowserLang();
                this.translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
            }
        } else {
            const browserLang = this.translate.getBrowserLang();
            this.translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
        }
    }
    onLanguageChange(language: string) {
        this.translate.use(language);
    }

    getUserAccessToken(code) {
        console.log(code);
        const url = 'https://auth.globus.org/v2/oauth2/token?code=' + code + '&redirect_uri=' + this.redirectURL + '&grant_type=authorization_code';
        console.log(url);
        const key = 'Basic ' + this.config.basicGlobusToken;
        return this.globusService.postGlobus(url,  '', key)
            /*----------------------*/
            .subscribe(
                data => {
                    console.log('Data ');
                    console.log(data);
                    this.transferData.userAccessTokenData = data;
                },
                error => {
                    console.log(error);
                },
                () => {
                    this.getDataverseInformation();
                });
    }

    getDataverseInformation() {
        console.log( this.transferData.userAccessTokenData);
        const state = this.globusService.getParameterByName('state');
        console.log(state);
        if (state !== undefined) {
            const signedUrl = this.decodeCallback(state);
            console.log(signedUrl);
            if (signedUrl != null) {
                console.log('before call');
                this.globusService.getDataverse(signedUrl, this.config.apiToken).subscribe({
                    next: (value: any) => {
                        this.signedUrlData = value,
                            console.log('Got value');
                        console.log(this.signedUrlData);
                    },
                    error: (error: any) => {
                        console.log(error);
                    },
                    complete: () => {
                        console.log(this.signedUrlData);
                        // this.newItemEvent.emit(this.signedUrlData["data"]);
                        this.getParameters(this.signedUrlData["data"]['queryParameters']);
                        this.transferData.signedUrls = this.signedUrlData['data']['signedUrls'];
                        this.transferData.load = true;
                        console.log('It is true');
                        this.newItemEvent.emit(this.transferData);
                    }
                });
            }
        }
    }


    getCode(callback, dvLocale) {
        const decodedCallback = this.decodeCallback(callback);
        let state = decodedCallback + '&dvLocale=' + dvLocale;
        state = btoa(state);
        const scope = encodeURI('openid+email+profile+urn:globus:auth:scope:transfer.api.globus.org:all');
        const clientId = this.config.globusClientId;
        console.log(clientId);
        let newUrl =  'https://auth.globus.org/v2/oauth2/authorize?client_id=' + clientId + '&response_type=code&' +
            'scope=' + scope + '&state=' + state;
        newUrl = newUrl + '&redirect_uri=' + this.redirectURL ;

        const myWindows = window.location.replace(newUrl);
    }
    decodeCallback(callback) {
        const decodedCallback = atob(callback);
        console.log(decodedCallback);
        return decodedCallback;
    }

    getParameters(parameters) {
        console.log(parameters);
        this.transferData.datasetPid = parameters.datasetPid;
        // this.transferData.key = this.globusService.getParameterByName('apiToken');
        this.transferData.siteUrl = parameters.siteUrl;
        console.log(this.transferData.siteUrl);
        this.transferData.datasetId = parameters.datasetId;
        this.transferData.datasetVersion = parameters.datasetVersion;
        // this.transferData.fileId = this.globusService.getParameterByName('fileId');
        // this.transferData.fileMetadataId = this.globusService.getParameterByName('fileMetadataId');
        // this.transferData.storePrefix = this.globusService.getParameterByName('storePrefix');
        console.log(this.transferData);
        this.transferData.datasetDirectory = '/' +
            this.transferData.datasetPid.substring(this.transferData.datasetPid.indexOf(':') + 1) + '/';
        console.log(this.transferData.datasetDirectory);
        // this.transferData.key = this.config.apiToken;
        console.log(parameters.managed);
        console.log(this.transferData.managed);
        if (parameters.managed === 'true') {
            this.transferData.managed = true;
            this.transferData.globusEndpoint = parameters.endpoint;
            console.log(this.transferData.globusEndpoint);
        } else {
            this.transferData.managed = false;
            this.transferData.referenceEndpointsWithPaths = parameters.referenceEndpointsWithPaths;
            console.log(this.transferData.referenceEndpointsWithPaths);
        }
        if (typeof parameters.files !== 'undefined' || parameters.files !== null) {
            console.log("FOUND FILES!!!");
            console.log(parameters.files);
            this.transferData.files = parameters.files;
        }

    }

}
