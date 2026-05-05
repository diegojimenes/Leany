import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response', (done) => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ method: 'GET', url: '/test' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ message: 'success' })),
    } as CallHandler;

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toHaveProperty('statusCode', 200);
        expect(result).toHaveProperty('method', 'GET');
        expect(result).toHaveProperty('path', '/test');
        expect(result).toHaveProperty('data', { message: 'success' });
        expect(result).toHaveProperty('timestamp');
        done();
      });
  });
});
