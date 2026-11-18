import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ErrorBody {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  details?: unknown;
}

/**
 * One error shape for the whole API. Unknown errors never leak internals: the client gets a generic
 * 500 message and the real error goes to the log.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Http');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const r = response as Record<string, unknown>;
        message = Array.isArray(r.message) ? 'Validation failed' : String(r.message ?? exception.message);
        if (Array.isArray(r.message)) details = r.message;
        else if ('status' in r) details = r; // health check payload
      }
    } else {
      this.logger.error(exception instanceof Error ? (exception.stack ?? exception.message) : String(exception));
    }

    const body: ErrorBody = {
      statusCode,
      error: HttpStatus[statusCode]?.toString().replace(/_/g, ' ') ?? 'Error',
      message,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      ...(details === undefined ? {} : { details }),
    };
    res.status(statusCode).json(body);
  }
}
