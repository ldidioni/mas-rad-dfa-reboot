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
import { MapComponent } from './issue/map/map.component';
import { IssueNewComponent } from './issue/issue-new/issue-new.component';
import { IssueListComponent } from './issue/issue-list/issue-list.component';

import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IssueDetailComponent } from './issue/issue-detail/issue-detail.component';
import { IssueEditComponent } from './issue/issue-edit/issue-edit.component';
import { ImageModalComponent } from './issue/image-modal/image-modal.component';
import { TextShortenPipe } from './shared/text-shorten.pipe';
import { CamelcaseToHyphenPipe } from './shared/camelcase-to-hyphen.pipe';
import { HyphenToSpacePipe } from './shared/hyphen-to-space.pipe';


@NgModule({
  declarations: [
    AppComponent,
    DummyPageComponent,
    MenuComponent,
    MapComponent,
    IssueNewComponent,
    IssueListComponent,
    IssueDetailComponent,
    IssueEditComponent,
    ImageModalComponent,
    CamelcaseToHyphenPipe,
    HyphenToSpacePipe,
    TextShortenPipe
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
    MatCardModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSnackBarModule,
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
