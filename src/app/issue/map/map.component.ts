import { Component, AfterViewInit, Input, Output, EventEmitter, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { Point } from 'src/app/models/issue';
import { GeolocationService } from 'src/app/shared/services/geolocation.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy {

  @Input() mapPoints: Point[];
  @Input() center: Point;
  @Input() clickable: Boolean = true;
  @Output() location = new EventEmitter<[number, number]>();

  map: L.Map;
  position: Position;
  markers: any[];
  ready: boolean;

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

    console.log(this.mapPoints);

    this.markers = [];
    this.ready = false;

    if(!this.center) {
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
    else {
      //this.position.coords = this.center.coordinates;
    }

  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  onMapReady(map: L.Map) {
    this.geolocation
    .getCurrentPosition()
    .then((position) => {
      this.position = position;
      this.createMap(map, this.position);
      console.log(this.map);
      console.log(this.mapPoints);
      this.ready = true;
    })
  }

  ngOnChanges(changes: SimpleChanges) {

    if(this.ready)
    {
      if(changes.mapPoints.previousValue)
      {
        for(let i = 0; i < this.markers.length; i++)
        {
          this.map.removeLayer(this.markers[i]);
        }
      }

      this.markers = [];

      this.mapPoints = changes.mapPoints.currentValue;
      console.log(changes.mapPoints.currentValue);
      //this.mapPoints.forEach((point) => this.buildMarker(point).addTo(this.map));
      let i = 1;
      this.mapPoints.forEach((point) => {
        console.log(i++);
        let marker = this.buildMarker(point)
        marker.addTo(this.map);
        this.markers.push(marker);
        console.log(this.markers);
      });
    }
  }

  buildMarker(point: Point): L.Marker<any> {
    return L.marker(L.latLng([point.coordinates[1],point.coordinates[0]]), { icon: this.smallIcon });
  }

  createMap(map: L.Map, position: Position) {

    this.map = map;

    const center = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    const zoomLevel = 13;

    this.map.setView([center.lat, center.lng], zoomLevel);//.locate({setView: true, maxZoom: 16});

    const mainLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 1,
      maxZoom: 18
    });

    mainLayer.addTo(this.map);

    //const description = 'bla';
    //this.addMarker(center, description);

    if(this.clickable) {
      this.map.on("click", (e: L.LeafletMouseEvent) => {

        for(let i = 0; i < this.markers.length; i++)
        {
          this.map.removeLayer(this.markers[i]);
        }

        this.markers = [];

        const marker = L.marker([e.latlng.lat, e.latlng.lng],
          { icon: this.smallIcon });
        marker.addTo(this.map).bindPopup('blabla');
        this.markers.push(marker);
        this.location.emit([e.latlng.lng, e.latlng.lat]);
      });
    }
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