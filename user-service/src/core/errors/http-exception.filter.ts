import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  InvalidCredentialsException,
  UnexpectedErrorException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from './user.errors.js';

type ErrorConstructor<T extends Error = Error> = new (...args: unknown[]) => T;
type ErrorStatusMap = ReadonlyArray<readonly [ErrorConstructor, number]>;

@Catch()
export class CatchGlobalFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchGlobalFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly errorStatusMap: ErrorStatusMap = [
      [UserAlreadyExistsException as ErrorConstructor, HttpStatus.CONFLICT],
      [UserNotFoundException as ErrorConstructor, HttpStatus.NOT_FOUND],
      [
        InvalidCredentialsException as ErrorConstructor,
        HttpStatus.UNAUTHORIZED,
      ],
      [
        UnexpectedErrorException as ErrorConstructor,
        HttpStatus.INTERNAL_SERVER_ERROR,
      ],
    ],
  ) {}

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof Error) {
      const match = this.errorStatusMap.find(
        ([ErrorType]) => exception instanceof ErrorType,
      );
      if (match) {
        return match[1];
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const method = request?.method ?? 'UNKNOWN_METHOD';
    const path = httpAdapter.getRequestUrl(request);

    const httpStatus = this.resolveStatus(exception);
    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    this.logger.log(`Handling exception for ${method} ${path}`);
    this.logger.debug(
      `Resolved status=${httpStatus}, exceptionType=${exception instanceof Error ? exception.name : typeof exception}`,
    );

    if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    httpAdapter.reply(
      response,
      {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path,
        message,
      },
      httpStatus,
    );
  }
}
