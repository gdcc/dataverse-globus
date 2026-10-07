import { Component, inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from "@angular/material/snack-bar";

@Component({
  selector: 'app-custom-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.css'
})
export class CustomSnackbarComponent {
  data = inject(MAT_SNACK_BAR_DATA);

  message: string;
  linkMessage: string;
  constructor() {
    const data = this.data;

    this.message = data[0];
    this.linkMessage = data[1];
  }
  //message = 'Large transfers may take significant time. You can check transfer status at <a  href="https://app.globus.org/activity">https://app.globus.org/activity</a>'
}
