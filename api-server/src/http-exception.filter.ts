import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const err = exception.getResponse() as
        | { message: any; statusCode: number }
        | { error: string; statusCode: 400; message: string[] }; // class-validator 타이핑

    if (typeof err !== 'string' && err.statusCode === 400) {
      // class-validator 에러
      return response.status(status).json({
        success: false,
        code: status,
        data: err.message,
      });
    }

    if (status >= 500) {
      this.logger.error(`[${request.method}] ${request.headers} ${request.url} ${status} - ${err.message}`);
    }
    response.status(status).json({
      success: false,
      code: status,
      data: err.message,
    });
  }
}