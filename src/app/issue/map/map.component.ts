import { Component, AfterViewInit, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Point } from 'src/app/models/issue';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy, AfterViewInit {

  @Input() mapPoints: Point[] = [];;
  @Output() location = new EventEmitter<[number, number]>();

  map;

  smallIcon = new L.Icon({
    // This define the displayed icon size, in pixel
    iconSize: [ 25, 41 ],
    // This defines the pixel that should be placed right above the location
    // If not provided, the image center will be used, and that could be awkward
    iconAnchor: [ 13, 41 ],
    // The path to the image to display. In this case, it's a Leaflet asset
    iconUrl: 'leaflet/marker-icon.png',
    // The path to the image's shadow to display. Also a leaflet asset
    shadowUrl: 'leaflet/marker-shadow.png'
  });

  constructor() { }

  ngOnDestroy(): void {
    this.map.remove();
  }

  ngAfterViewInit(): void {
    this.createMap();
  }

  ngOnChanges() {
    this.mapPoints.forEach((point) => this.buildMarker(point).addTo(this.map));
  }

  buildMarker(point: Point): L.Marker<any> {
    return L.marker(L.latLng([point.coordinates[1],point.coordinates[0]]), { icon: this.smallIcon });
  }

  createMap() {
    const yverdon = {
      lat: 46.778186,
      lng: 6.641524
    };

    const zoomLevel = 13;

    this.map = L.map('map', {
      center: [yverdon.lat, yverdon.lng],
      zoom: zoomLevel
    });

    const mainLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 12,
      maxZoom: 17
    });

    mainLayer.addTo(this.map);

    //const description = 'bla';
    //this.addMarker(yverdon, description);

    this.map.on("click", (e: L.LeafletMouseEvent) => {
      const marker = L.marker([e.latlng.lat, e.latlng.lng],
        { icon: this.smallIcon });
      marker.addTo(this.map).bindPopup('blabla');
      this.location.emit([e.latlng.lng, e.latlng.lat]);
    });
  }
}

/*
    var arrayOfLatLngs = [];
    var _this = this;

    // setup a marker group
    var markers = L.markerClusterGroup();

    events.forEach(function (event) {
        // setup the bounds
        arrayOfLatLngs.push(event.location);

        // create the marker
        var marker = L.marker([event.location.lat, event.location.lng]);

        marker.bindPopup(View(event));

        // add marker
        markers.addLayer(marker);
    });

    // add the group to the map
    // for more see https://github.com/Leaflet/Leaflet.markercluster
    this.map.addLayer(markers);

    var bounds = new L.LatLngBounds(arrayOfLatLngs);
    this.map.fitBounds(bounds);
    this.map.invalidateSize();
    */