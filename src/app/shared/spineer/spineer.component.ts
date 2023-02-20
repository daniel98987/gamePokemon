import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
@Component({
  selector: 'app-spineer',
  template: `
  <div class="overlay" *ngIf="isLoading | async">
        <div class="loadingio-spinner-rolling-zvsd6sfg6e"><div class="ldio-ije64jmhzm">
        <div></div>
        </div></div>
  </div>
  `,
  styleUrls: ['./spineer.component.css'],
})
export class SpineerComponent   {
  public isLoading=this.loadingService.isLoading;
  constructor(private loadingService:LoadingService) { }
  ngOnInit(): void {
  }
}
