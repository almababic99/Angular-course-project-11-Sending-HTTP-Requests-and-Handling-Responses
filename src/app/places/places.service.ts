import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  // HttpClient is used to make HTTP requests (GET, POST, etc.).
  // The inject function is being used to inject the HttpClient service directly into the httpClient property of the AvailablePlacesComponent.

  private userPlaces = signal<Place[]>([]);
  // a signal used to manage the state of the places that belong to the user. Initially, it's an empty array ([]).

  loadedUserPlaces = this.userPlaces.asReadonly();
  // This is a readonly version of the userPlaces signal. It provides an immutable version of the places, ensuring that other components 
  // or services can only read the data, not modify it.

  loadAvailablePlaces() {  // This method is used to fetch the available places from the server.
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something went wrong fetching the available places. Please try again later.'
      // It calls the fetchPlaces method below and provides the URL (http://localhost:3000/places) to fetch data from and 
      // an error message in case something goes wrong.
    );
  }

  loadUserPlaces() {   // This method is used to fetch favorite places from the server.
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something went wrong fetching your favorite places. Please try again later.'
      // It calls the fetchPlaces method below and provides the URL (http://localhost:3000/user-places) to fetch data from and 
      // an error message in case something goes wrong.
    );
  }

  addPlaceToUserPlaces(placeId: string) {  // This method sends a PUT request to the backend to add a place to the user's favorite places list.
    return this.httpClient
    .put('http://localhost:3000/user-places', {
      placeId,
      // This makes an HTTP PUT request to the server at http://localhost:3000/user-places with the selected place's id.
      // The request body contains the placeId property, which holds the ID of the selected place (placeId).
      // A PUT request is typically used for updating an existing resource on the server.
    })
  }

  removeUserPlace(place: Place) {}

  private fetchPlaces(url: string, errorMessage: string) {
    return (
      this.httpClient
        .get<{ places: Place[] }>(url)
        // The component makes an HTTP request using HttpClient to fetch data from url.
        // The request returns an object with a places property, which is an array of Place objects.
        .pipe(
          // The pipe() function is used to chain multiple RxJS operators together to manipulate the data that an observable emits.
          map((resData) => resData.places),
          // map() operator is an RxJS operator that transforms the data from the response. It extracts the places array from the response (resData.places).
          catchError((error) => {
            // catchError is an RxJS operator that catches any errors that occur within the observable stream and handles them.
            // If an error happens during the HTTP request (like network failure, server issue, or a bad response), the catchError operator is invoked.
            console.log(error); // The error is logged to the console for debugging purposes.
            return throwError(
              // throwError is a method used to propagate a new error message to the subscriber. It returns an observable that emits an error.
              () => new Error(errorMessage)
              // This is the message the component will use for the UI.
              // This is displayed in available-places.component.html or user-places.component.html if the error occurs.
            );
          })
        )
    );
  }
}
