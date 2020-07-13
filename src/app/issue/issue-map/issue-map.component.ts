import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { defaultIcon } from './default-marker';
import { latLng, Map, MapOptions, marker, Marker, tileLayer } from 'leaflet';
import { Point } from 'src/app/models/issue';

@Component({
  selector: 'app-issue-map',
  templateUrl: './issue-map.component.html',
  styleUrls: ['./issue-map.component.scss']
})
export class IssueMapComponent implements OnInit {

  map: Map;
  mapOptions: MapOptions;
  @Input() mapPoints: Point[];
  mapMarkers: Marker[];
  @Output() location = new EventEmitter<[number, number]>();

  constructor() {

    this.mapOptions = {
      layers: [
        tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 18 }
        )
      ],
      zoom: 13,
      center: latLng(46.778186, 6.641524)
    };
   }

  ngOnInit(): void {
    this.mapPoints = [];
  }

  ngOnChanges() {
    this.mapPoints.forEach((point) => this.buildMarker(point).addTo(this.map));
    //this.getAllIssueLocations();
  }

/*   getAllIssueLocations(): void {
    this.issueService.loadAllIssues()
        .subscribe({
            next: (issues: Issue[]) => {
              issues.forEach((issue) => this.mapPoints.push(issue.location));
              console.log('mapPoints: ' + this.mapPoints[0]);
              this.mapPoints.forEach((point) => this.buildMarker(point).addTo(this.map));
            },
            //error: err => this.errorMessage = err
      });
  } */

  onMapReady(map: Map) {
    this.map = map;
    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      console.log(`Map moved to ${center.lng}, ${center.lat}`);
    });
    this.map.on('click', this.setLocation);
  }

  buildMarker(point: Point): Marker<any> {
    return marker(latLng([point.coordinates[1],point.coordinates[0]]), { icon: defaultIcon });
  }

  setLocation(e): void{
    // Add marker to map at click location; add popup window
    var newMarker = new Marker(e.latLng).addTo(this.map);
    this.location.emit(e.latLng);
  }

}
