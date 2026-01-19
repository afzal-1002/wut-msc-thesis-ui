import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Always attach fixed internal credentials to every outgoing request
    const username = 'internal-user';
    const password = 'internal-pass';

    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    const authReq = req.clone({
      setHeaders: {
        Authorization: authHeader
      }
    });

    console.log('🔥 BasicAuthInterceptor applied:', req.url);
    return next.handle(authReq);
  }
}
