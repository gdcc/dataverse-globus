import {Component, Inject, OnInit} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {NavigateTemplateComponent} from '../navigate-template/navigate-template.component';
import {NavigateTemplateDownloadComponent} from '../navigate-template-download/navigate-template-download.component';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';


@Component({
  selector: 'app-navigate-directories',
  standalone: true,
  imports: [
    TranslateModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
      MatSnackBarModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    MatGridListModule,
    NavigateTemplateComponent,
    NavigateTemplateDownloadComponent
  ],
  templateUrl: './navigate-directories.component.html',
  styleUrls: ['./navigate-directories.component.css']
})



export class NavigateDirectoriesComponent implements OnInit {

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

   selectedEndPoint: any;


  ngOnInit(): void {
    this.selectedEndPoint = this.data.data;
  }




}
