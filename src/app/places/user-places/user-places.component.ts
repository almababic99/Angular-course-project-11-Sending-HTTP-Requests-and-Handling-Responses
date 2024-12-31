import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  // places = signal<Place[] | undefined>(undefined); // A signal to hold an array of Place objects, initially undefined but later it will hold an array of Place objects (coming from the backend).
  
  isFetching = signal(false); // A signal that holds a boolean value (false initially).
  // isFetching is used to represent whether data is being fetched from the backend.
  // It will be set to true when the data is being loaded, and false when the request completes.

  error = signal(''); // error is a signal used to store potential error

  private placesService = inject(PlacesService); // this allows the PlacesService to be injected and available for use inside the component

  private destroyRef = inject(DestroyRef); // DestroyRef is injected to handle cleanup logic when the component is destroyed

  places = this.placesService.loadedUserPlaces;
  // this.placesService: This refers to an instance of the PlacesService that has been injected into the current component or service. 
  // PlacesService is responsible for managing places data and providing methods to load, add, and remove places.
  // loadedUserPlaces: This is a readonly signal defined in the PlacesService
  // places is being set to the readonly signal of the user places from the PlacesService.
  // It makes the places variable in the current component reactive, so it will automatically update whenever loadedUserPlaces in the service changes.

  ngOnInit() {
    // ngOnInit() is a lifecycle hook that's called once the component is initialized.
    this.isFetching.set(true);
    // The isFetching signal is set to true at the beginning to indicate that data is being fetched from the server.
    // We are using this in available-places.component.html to show a loading fallback or not

    // We want to send GET request to the backend domain "/places" in app.js in backend folder to fetch data
    const subscription = this.placesService.loadUserPlaces().subscribe({  // using a placesService service to get the data
      // The subscribe() method subscribes to the observable returned by the httpClient.get().
      // Once you've set up your observable and applied any necessary transformations using pipe(), you need to
      // subscribe to the observable to start receiving values.
      // next: (places) => {
      //   //  The next function is called each time the observable emits a new value.
      //   // After the data is fetched and transformed by map(), the next function is called with the places array.
      //   // The next function updates the places signal with the fetched data, which causes the component's UI to automatically update.
      //   this.places.set(places);
      // },
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

  onRemovePlace(place: Place) {
    const subscription = this.placesService.removeUserPlace(place).subscribe();
    // calling a funciton from places.service.ts to remove a place

    this.destroyRef.onDestroy(() => {
      // onDestroy() is a lifecycle hook that cleans up resources (like HTTP requests) when the component is destroyed to avoid memory leaks.
      subscription.unsubscribe();
      // This ensures that when the component is destroyed, the HTTP subscription is properly cleaned up (unsubscribed) to avoid memory leaks.
    });
  }
}
