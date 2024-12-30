import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,  // This indicates that the component is standalone, meaning it doesn’t need to be part of an Angular module (NgModule).
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],  // These components are imported and used within this component.
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined); // A signal to hold an array of Place objects, initially undefined but later it will hold an array of Place objects (coming from the backend).

  isFetching = signal(false); // A signal that holds a boolean value (false initially).
  // isFetching is used to represent whether data is being fetched from the backend. 
  // It will be set to true when the data is being loaded, and false when the request completes.

  private httpClient = inject(HttpClient);
  // HttpClient is used to make HTTP requests (GET, POST, etc.).
  // The inject function is being used to inject the HttpClient service directly into the httpClient property of the AvailablePlacesComponent.
  // This means that httpClient is now an instance of HttpClient that you can use throughout the component.
  // To use HttpClient in this component we need to make sure HttpClient is provided in `main.ts` using `provideHttpClient()`.

  private destroyRef = inject(DestroyRef);  // DestroyRef is injected to handle cleanup logic when the component is destroyed

  ngOnInit() {  // ngOnInit() is a lifecycle hook that's called once the component is initialized.
    this.isFetching.set(true); 
    // The isFetching signal is set to true at the beginning to indicate that data is being fetched from the server.
    // We are using this in available-places.component.html to show a loading fallback or not

    // We want to send GET request to the backend domain "/places" in app.js in backend folder to fetch data
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')  
      // The component makes an HTTP request using HttpClient to fetch data from http://localhost:3000/places.
      // The request returns an object with a places property, which is an array of Place objects.
      .pipe(  // The pipe() function is used to chain multiple RxJS operators together to manipulate the data that an observable emits.
        map((resData) => resData.places)
        // map() operator is an RxJS operator that transforms the data from the response. It extracts the places array from the response (resData.places).
      )
      .subscribe({  // The subscribe() method subscribes to the observable returned by the httpClient.get().
        // Once you've set up your observable and applied any necessary transformations using pipe(), you need to 
        // subscribe to the observable to start receiving values.
        next: (places) => {  
          //  The next function is called each time the observable emits a new value.
          // After the data is fetched and transformed by map(), the next function is called with the places array. 
          // The next function updates the places signal with the fetched data, which causes the component's UI to automatically update.
          this.places.set(places);
        },
        complete: () => {
          this.isFetching.set(false);
          // Once the request is complete (either success or failure), it sets isFetching to false, indicating that the loading process is over.
        }
      });
    this.destroyRef.onDestroy(() => {  
      // onDestroy() is a lifecycle hook that cleans up resources (like HTTP requests) when the component is destroyed to avoid memory leaks.
      subscription.unsubscribe();
      // This ensures that when the component is destroyed, the HTTP subscription is properly cleaned up (unsubscribed) to avoid memory leaks.
    });
  }
}
