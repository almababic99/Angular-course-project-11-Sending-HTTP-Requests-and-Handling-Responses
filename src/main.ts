import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { HttpEventType, HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { tap } from 'rxjs';

// The loggingInterceptor function is an HTTP interceptor. 
// Interceptors are functions that can modify HTTP requests before they are sent to the server or modify the response when it comes back.
function loggingInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
    // const req = request.clone({
    //     headers: request.headers.set('X-DEBUG', 'TESTING')
    // });

    // Outgoing Request: Before the request is sent, it's logged to the console.
    // When any HTTP request is made using Angular's HttpClient, the interceptor is triggered first.
    // The request details (method, headers, body, etc.) are logged to the console.
    console.log('Outgoing Request');
    console.log(request);
    return next(request).pipe(
        tap({
            next: event => {
                if (event.type === HttpEventType.Response) {
                    // Incoming Response: When the response is received, the status code and body of the response are logged to the console.
                    // After the request has been sent and the response has been received, the next(request) observable emits an event.
                    // The interceptor checks if the event is of type HttpEventType.Response. If it is, it logs the response's status and body 
                    // to the console.
                    console.log('Incoming Response');
                    console.log(event.status);
                    console.log(event.body);
                }
            }
        })
    );
    // The next(request) call sends the request to the next interceptor or the actual HTTP handler. 
    // The pipe(tap(...)) is used to perform side-effects on the observable (like logging) without modifying the HTTP request or response itself.
}

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(
        withInterceptors([loggingInterceptor])  
        // This function registers the logging interceptor to the HttpClient, ensuring that every HTTP request and response is logged 
        // using the loggingInterceptor defined above.
    )]  
    // provideHttpClient() is an Angular provider that makes the HttpClient service available for dependency injection throughout the app.
    // This approach allows Angular to automatically handle HTTP requests in components without the need for setting up HttpClient 
    // in individual modules.
    // By using provideHttpClient(), you're telling Angular to set up the necessary infrastructure for making HTTP requests 
    // throughout your application.
}).catch((err) => console.error(err));
