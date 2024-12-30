import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true, // This indicates that the component is standalone, meaning it doesn’t need to be part of an Angular module (NgModule).
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent], // These components are imported and used within this component.
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined); // A signal to hold an array of Place objects, initially undefined but later it will hold an array of Place objects (coming from the backend).

  isFetching = signal(false); // A signal that holds a boolean value (false initially).
  // isFetching is used to represent whether data is being fetched from the backend.
  // It will be set to true when the data is being loaded, and false when the request completes.

  error = signal(''); // error is a signal used to store potential error

  private httpClient = inject(HttpClient);
  // HttpClient is used to make HTTP requests (GET, POST, etc.).
  // The inject function is being used to inject the HttpClient service directly into the httpClient property of the AvailablePlacesComponent.
  // This means that httpClient is now an instance of HttpClient that you can use throughout the component.
  // To use HttpClient in this component we need to make sure HttpClient is provided in `main.ts` using `provideHttpClient()`.

  private destroyRef = inject(DestroyRef); // DestroyRef is injected to handle cleanup logic when the component is destroyed

  ngOnInit() {
    // ngOnInit() is a lifecycle hook that's called once the component is initialized.
    this.isFetching.set(true);
    // The isFetching signal is set to true at the beginning to indicate that data is being fetched from the server.
    // We are using this in available-places.component.html to show a loading fallback or not

    // We want to send GET request to the backend domain "/places" in app.js in backend folder to fetch data
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      // The component makes an HTTP request using HttpClient to fetch data from http://localhost:3000/places.
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
            () =>
              new Error(
                'Something went wrong fetching the available places. Please try again later.'
              )
            // The error message that's thrown is a custom message: 'Something went wrong fetching the available places. Please try again later.'
            // This is the message the component will use for the UI.
            // This is displayed in available-places.component.html if the error occurs.
            // To get the error to display we can change app.js in backend folder (app.get("/places"))
          );
        })
      )
      .subscribe({
        // The subscribe() method subscribes to the observable returned by the httpClient.get().
        // Once you've set up your observable and applied any necessary transformations using pipe(), you need to
        // subscribe to the observable to start receiving values.
        next: (places) => {
          //  The next function is called each time the observable emits a new value.
          // After the data is fetched and transformed by map(), the next function is called with the places array.
          // The next function updates the places signal with the fetched data, which causes the component's UI to automatically update.
          this.places.set(places);
        },
        error: (error: Error) => {
          // This is the error callback. If the observable emits an error (which can be thrown either by catchError or directly from the HTTP
          // request), this part of the subscribe block will be triggered.
          this.error.set(error.message);
          // The message property of the error is extracted and stored in the error signal. This signal can be used later in the component's
          // template to display the error message to the user (e.g., "Something went wrong fetching the available places. Please try again later.").
        },
        complete: () => {
          this.isFetching.set(false);
          // Once the request is complete (either success or failure), it sets isFetching to false, indicating that the loading process is over.
        },
      });
    this.destroyRef.onDestroy(() => {
      // onDestroy() is a lifecycle hook that cleans up resources (like HTTP requests) when the component is destroyed to avoid memory leaks.
      subscription.unsubscribe();
      // This ensures that when the component is destroyed, the HTTP subscription is properly cleaned up (unsubscribed) to avoid memory leaks.
    });
  }

  onSelectPlace(selectedPlace: Place) {  // this method is triggered when a user selects a place. 
    // This method is responsible for sending a PUT request to the backend server when a user selects a place. 
    // When a user selects a place, the component emits the selectPlace event, passing the selected Place object. 
    // The onSelectPlace method is then triggered, which handles the event.
    this.httpClient
      .put('http://localhost:3000/user-places', {  
        placeId: selectedPlace.id,
        // This makes an HTTP PUT request to the server at http://localhost:3000/user-places with the selected place's id.
        // The request body contains the placeId property, which holds the ID of the selected place (selectedPlace.id).
        // A PUT request is typically used for updating an existing resource on the server. 
      })
      .subscribe({ // Since httpClient.put() returns an Observable, you must subscribe to it in order to actually trigger the request and receive the response.
        next: (resData) => console.log(resData),
      });
  }
}
