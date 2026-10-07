import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecentlyViewedDownloadComponent } from './recently-viewed-download.component';

describe('RecentlyViewedDownloadComponent', () => {
  let component: RecentlyViewedDownloadComponent;
  let fixture: ComponentFixture<RecentlyViewedDownloadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RecentlyViewedDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentlyViewedDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
