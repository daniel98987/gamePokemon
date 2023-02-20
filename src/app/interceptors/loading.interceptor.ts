import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, ApplicationRef } from '@angular/core';
import { Observable, timer } from "rxjs";
import { finalize } from "rxjs/operators";

import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

    constructor(private loadingService: LoadingService, private appRef: ApplicationRef) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        this.loadingService.show();

        return next.handle(req).pipe(
            finalize(() => {
   
                timer(500).subscribe(() => { // Esperar 5 segundos antes de ocultar el spinner
                    this.loadingService.hide();
                    this.appRef.tick(); // forzar actualización de la vista
                });
            })
        );

    }
}
