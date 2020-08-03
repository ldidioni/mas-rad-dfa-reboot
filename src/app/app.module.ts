import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ApiTokenInterceptorService } from "./api/api-token-interceptor.service";
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { SecurityModule } from './security/security.module';
import { DummyPageComponent } from './dummy-page/dummy-page.component';
import { MenuComponent } from './menu/menu.component';
import { IssueMapComponent } from './issue/issue-map/issue-map.component';
import { MapComponent } from './issue/map/map.component';
import { IssueNewComponent } from './issue/issue-new/issue-new.component';
import { IssueListComponent } from './issue/issue-list/issue-list.component';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDialogModule} from '@angular/material/dialog';
import { IssueDetailComponent } from './issue/issue-detail/issue-detail.component';
import { IssueEditComponent } from './issue/issue-edit/issue-edit.component';
import { ImageModalComponent } from './issue/image-modal/image-modal.component';



@NgModule({
  declarations: [
    AppComponent,
    DummyPageComponent,
    MenuComponent,
    MapComponent,
    IssueMapComponent,
    IssueNewComponent,
    IssueListComponent,
    IssueDetailComponent,
    IssueEditComponent,
    ImageModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SecurityModule,
    LeafletModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
    MatChipsModule,
    MatIconModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiTokenInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  entryComponents: [ImageModalComponent]
})
export class AppModule { }
