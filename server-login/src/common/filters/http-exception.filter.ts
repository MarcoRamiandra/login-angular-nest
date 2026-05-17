import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const res = exception.getResponse();
    const message =
      typeof res === 'string'
        ? res
        : (res as Record<string, unknown>).message ?? exception.message;

    response.status(status).json({
      code: this.mapCode(exception, status),
      message: Array.isArray(message) ? message[0] : message,
    });
  }

  private mapCode(exception: HttpException, status: number): string {
    if (exception instanceof UnauthorizedException) {
      const msg = (exception.getResponse() as Record<string, unknown>)
        .message as string;
      const text = Array.isArray(msg) ? msg[0] : msg ?? '';
      if (text.includes('incorrect')) return 'invalid_credentials';
      return 'session_expired';
    }

    if (status === 409) return 'unknown';
    return 'unknown';
  }
}
