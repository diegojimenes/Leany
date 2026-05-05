import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

interface ErrorResponse {
  statusCode: number;
  method: string;
  path: string;
  message: string | object;
  timestamp: string;
}

interface QueryError extends Error {
  code: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.handleException(exception);

    const errorResponse: ErrorResponse = {
      statusCode,
      method: request.method,
      path: request.url,
      message,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'production' && statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    response.status(statusCode).json(errorResponse);
  }

  private handleException(exception: unknown): { statusCode: number; message: string | object } {
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: zodError.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      };
    }

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      return {
        statusCode: exception.getStatus(),
        message: typeof res === 'string' ? res : (res as any).message || res,
      };
    }

    if (this.isQueryError(exception)) {
      const dbErrors: Record<string, { status: number; msg: string }> = {
        '23505': { status: HttpStatus.CONFLICT, msg: 'Este registro já existe.' },
        '23503': { status: HttpStatus.BAD_REQUEST, msg: 'Violação de dependência de dados.' },
      };

      const error = dbErrors[exception.code];
      if (error) {
        return { statusCode: error.status, message: error.msg };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception instanceof Error ? exception.message : 'Internal server error',
    };
  }

  private isQueryError(error: unknown): error is QueryError {
    return typeof error === 'object' && error !== null && 'code' in error;
  }
}
