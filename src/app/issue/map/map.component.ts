import { Component, AfterViewInit, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Point } from 'src/app/models/issue';
import { GeolocationService } from 'src/app/shared/services/geolocation.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy, AfterViewInit {

  @Input() mapPoints: Point[] = [];;
  @Output() location = new EventEmitter<[number, number]>();

  map;
  position: Position;

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

  constructor(private geolocation: GeolocationService) { 
    this.geolocation
      .getCurrentPosition()
      .then((position) => {
        this.position = position;
        console.log(this.position);
      })
      .catch((error) => {
        console.warn('Failed to locate user because', error);
      });
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  ngAfterViewInit(): void {
    this.geolocation
    .getCurrentPosition()
    .then((position) => {
      this.position = position;
      this.createMap(this.position);
      console.log(this.position);
    })
    //this.createMap();
  }

  ngOnChanges() {
    this.mapPoints.forEach((point) => this.buildMarker(point).addTo(this.map));
  }

  buildMarker(point: Point): L.Marker<any> {
    return L.marker(L.latLng([point.coordinates[1],point.coordinates[0]]), { icon: this.smallIcon });
  }

  createMap(position: Position) {
    const center = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    const zoomLevel = 13;

    this.map = L.map('map', {
      center: [center.lat, center.lng],
      zoom: zoomLevel
    });//.locate({setView: true, maxZoom: 16});

    const mainLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 12,
      maxZoom: 17
    });

    mainLayer.addTo(this.map);

    //const description = 'bla';
    //this.addMarker(center, description);

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