import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

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

  ngAfterViewInit(): void {
    this.createMap();
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

    const description = 'bla';
    this.addMarker(yverdon, description);
  }

  addMarker(coords, text) {
    const marker = L.marker([coords.lat, coords.lng],
      { icon: this.smallIcon });
    marker.addTo(this.map).bindPopup(text);
  }
}
