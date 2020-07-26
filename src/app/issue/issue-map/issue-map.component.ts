import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { defaultIcon } from './default-marker';
import { latLng, Map, MapOptions, marker, Marker, tileLayer, LeafletMouseEvent } from 'leaflet';
import { Point } from 'src/app/models/issue';

@Component({
  selector: 'app-issue-map',
  templateUrl: './issue-map.component.html',
  styleUrls: ['./issue-map.component.scss']
})
export class IssueMapComponent implements OnInit {
/*
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

    this.mapMarkers = [
      marker([ 46.778186, 6.641524 ], { icon: defaultIcon }),
      marker([ 46.780796, 6.647395 ], { icon: defaultIcon }),
      marker([ 46.784992, 6.652267 ], { icon: defaultIcon })
    ];
   }
*/
  ngOnInit(): void {
   /* this.mapPoints = [];
    */
  }

/*

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
  }

  onMapReady(map: Map) {
    this.map = map;
    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      console.log(`Map moved to ${center.lng}, ${center.lat}`);
    });

    let theMarker = {};

    this.map.on('click',function(e: LeafletMouseEvent){
      let lat = e.latlng.lat;
      let lon = e.latlng.lng;

      console.log("You clicked the map at LAT: "+ lat+" and LONG: "+lon );
          //Clear existing marker,

          if (theMarker != undefined) {
                this.map.removeLayer(theMarker);
          };

      //Add a marker to show where you clicked.
      theMarker = marker([lat,lon]).addTo(this.map);
    });

    this.map.on('click', this.setLocation);
  }

  buildMarker(point: Point): Marker<any> {
    return marker(latLng([point.coordinates[1],point.coordinates[0]]), { icon: defaultIcon });
  }

  setLocation(e): void{
    // Add marker to map at click location; add popup window
    var newMarker = marker(e.latLng).addTo(this.map);
    //this.mapMarkers.push(newMarker);
    //this.location.emit(e.latLng);
  }
*/
}