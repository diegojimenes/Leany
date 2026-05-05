import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpException } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse = { status: mockStatus };
    const mockRequest = { method: 'GET', url: '/test' };

    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;

    const exception = new HttpException('Forbidden', 403);
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Forbidden',
      }),
    );
  });

  it('should handle ZodValidationException', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({ status: mockStatus }),
        getRequest: jest.fn().mockReturnValue({ method: 'POST', url: '/test' }),
      }),
    } as any;

    const zodError = new ZodError([{
      code: 'custom',
      path: ['name'],
      message: 'Required'
    }]);
    const exception = new ZodValidationException(zodError);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 400,
    }));
  });

  it('should handle QueryFailedError (TypeORM conflict)', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({ status: mockStatus }),
        getRequest: jest.fn().mockReturnValue({ method: 'POST', url: '/test' }),
      }),
    } as any;

    const exception = { code: '23505', name: 'QueryFailedError', message: 'duplicate key' } as any;

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 409,
    }));
  });
});
