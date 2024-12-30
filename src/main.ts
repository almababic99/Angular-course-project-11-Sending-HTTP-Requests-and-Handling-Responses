import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';


bootstrapApplication(AppComponent, {
    providers: [provideHttpClient()]  
    // provideHttpClient() is an Angular provider that makes the HttpClient service available for dependency injection throughout the app.
    // This approach allows Angular to automatically handle HTTP requests in components without the need for setting up HttpClient 
    // in individual modules.
    // By using provideHttpClient(), you're telling Angular to set up the necessary infrastructure for making HTTP requests 
    // throughout your application.
}).catch((err) => console.error(err));
