import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  private hasApi: boolean;

  constructor()
  {
    this.hasApi = "geolocation" in navigator;
  }

  getCurrentPosition(options: PositionOptions = {}): Promise<Position>
  {
    return new Promise((resolve, reject) => {
      if (!this.hasApi)
      {
        reject('The Geolocation API is not available on this browser');
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }
}
