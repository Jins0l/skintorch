import { CallHandler, ExecutionContext, Logger, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

export class RequestInterceptor implements NestInterceptor {
    private readonly logger = new Logger(RequestInterceptor.name);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip;
        const method = request.method;
        const url = request.url;
        const headers = request.headers;
        this.logger.log(`[${ip}] ${method} ${url} ${JSON.stringify(headers)} ${JSON.stringify(request.body)}\n`);
        return next.handle();
    }
}