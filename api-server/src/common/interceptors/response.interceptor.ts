import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const res = ctx.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        code: res.statusCode,
        data,
      })),
    );
  }
}