import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : (exceptionResponse as any).message || exception.message;
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Log the error
        console.error(`[${new Date().toISOString()}] Error ${status}: ${message}`);
        if (!(exception instanceof HttpException)) {
            console.error(exception);
        }

        // If it's an API request, return JSON
        const isApiRequest =
            request.headers.accept?.includes('application/json') ||
            request.headers['content-type']?.includes('application/json') ||
            request.headers['x-requested-with'] === 'XMLHttpRequest' ||
            request.headers['user-agent']?.includes('PostmanRuntime');

        if (isApiRequest) {
            return response.status(status).json({
                statusCode: status,
                message: message,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
        }

        // For validation errors, redirect back with flash message
        if (status === HttpStatus.BAD_REQUEST && Array.isArray(message)) {
            const session = request.session as any;
            if (session) {
                session.flash = session.flash || {};
                session.flash.error = message.join(', ');
            }
            const referer = request.headers.referer || '/';
            return response.redirect(referer);
        }

        // Render error page for browser requests
        const errorTemplate = status === 404 ? 'errors/404' : 'errors/500';
        try {
            return response.status(status).render(errorTemplate, {
                layout: 'layouts/main',
                title: status === 404 ? 'Page Not Found' : 'Server Error',
                statusCode: status,
                message: message,
                path: request.url,
                user: (request.session as any)?.user,
            });
        } catch {
            // Fallback if template rendering fails
            return response.status(status).json({
                statusCode: status,
                message: message,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
        }
    }
}
