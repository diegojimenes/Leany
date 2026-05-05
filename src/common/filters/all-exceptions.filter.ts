import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof ZodValidationException) {
      statusCode = HttpStatus.BAD_REQUEST;
      const zodError = exception.getZodError() as any;
      message = zodError.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : res.message || res;
    } else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception
    ) {
      if ((exception as any).code === '23505') {
        statusCode = HttpStatus.CONFLICT;
        message = 'Conflito: Este registro já existe.';
      } else if ((exception as any).code === '23503') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Violação de chave estrangeira.';
      } else {
        message = (exception as any).message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: any = {
      statusCode,
      method: request.method,
      path: request.url,
      message,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      let anchor = '';
      const url = request.url;
      const method = request.method;

      if (url.includes('/teams')) {
        if (method === 'POST' && url.includes('/pokemon')) anchor = '#/Teams/TeamController_addPokemon';
        else if (method === 'POST') anchor = '#/Teams/TeamController_create';
        else if (method === 'GET' && url.split('/').length > 2) anchor = '#/Teams/TeamController_findOne';
        else if (method === 'GET') anchor = '#/Teams/TeamController_findAll';
        else if (method === 'DELETE' && url.includes('/pokemon')) anchor = '#/Teams/TeamController_removePokemon';
        else if (method === 'DELETE') anchor = '#/Teams/TeamController_remove';
      } else if (url.includes('/trainers')) {
        if (method === 'POST' && url.includes('/address')) anchor = '#/Trainers/TrainerController_addAddress';
        else if (method === 'POST') anchor = '#/Trainers/TrainerController_create';
        else if (method === 'GET' && url.split('/').length > 2) anchor = '#/Trainers/TrainerController_findOne';
        else if (method === 'GET') anchor = '#/Trainers/TrainerController_findAll';
        else if (method === 'DELETE') anchor = '#/Trainers/TrainerController_remove';
      }

      errorResponse.docLink = `http://localhost:3000/api/docs${anchor}`;
    }

    response.status(statusCode).json(errorResponse);
  }
}
