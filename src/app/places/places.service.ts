import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService);
  // injecting ErrorService in PlacesService so we can use it here and catch errors

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
    ).pipe(tap({
      next: (userPlaces) => this.userPlaces.set(userPlaces)
      // The pipe operator is a function from RxJS that is used to chain multiple operators together in an observable stream. 
      // It allows you to transform, handle errors, and perform other operations on the data emitted by an observable.
      // The tap operator is another RxJS operator used to perform side effects when the observable emits a value. 
      // It doesn't modify the emitted value—it just allows you to do something with it, such as logging, updating the UI, 
      // or in this case, updating the state.
    }));
  }

  addPlaceToUserPlaces(place: Place) {  // This method sends a PUT request to the backend to add a place to the user's favorite places list.
    // optimistic updating:
    const prevPlaces = this.userPlaces();
    // prevPlaces is the current list of places from the userPlaces signal (before adding a new place)

    // Checking whether the place to be added already exists in the list. This avoids duplicates:
    if (!prevPlaces.some((p) => p.id === place.id)) {
      // If the place isn’t already in the list, you optimistically update the UI by appending the new place to the userPlaces signal. 
      // This change will immediately reflect in the UI without waiting for the backend response.
      this.userPlaces.set([...prevPlaces, place]);
    }
    
    // This sends a PUT request to the backend with the placeId of the place to be added to the user's favorites. This updates the server-side data:
    return this.httpClient
    .put('http://localhost:3000/user-places', {
      placeId: place.id,
      // This makes an HTTP PUT request to the server at http://localhost:3000/user-places with the selected place's id.
      // The request body contains the placeId property, which holds the ID of the selected place (placeId).
      // A PUT request is typically used for updating an existing resource on the server.
    }).pipe(
      catchError(error => {  // The catchError operator is used to handle errors that might occur during the HTTP request.
        // If the request fails (e.g., network error, server error), the optimistic update made to the userPlaces signal is rolled back 
        // by resetting the userPlaces signal back to prevPlaces (the state before the optimistic update):
        this.userPlaces.set(prevPlaces);

        this.errorService.showError('Failed to store selected place.'); 
        // This is used to display an error message to the user when something goes wrong with the operation 
        // (in this case, when the PUT request to add the place fails).
        
        // The error is propagated with a custom error message:
        return throwError(() => new Error('Failed to store selected place.'))
      })
    );
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
