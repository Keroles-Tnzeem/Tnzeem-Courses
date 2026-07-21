import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl, body, query } = req;
        const start = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - start;
            const color = statusCode >= 500
                ? '\x1b[31m'   // red
                : statusCode >= 400
                    ? '\x1b[33m' // yellow
                    : '\x1b[32m'; // green
            const reset = '\x1b[0m';

            this.logger.log(
                `${color}[${method}]${reset} ${originalUrl} → ${color}${statusCode}${reset} (${duration}ms)`,
            );

            if (Object.keys(body ?? {}).length) {
                // Mask sensitive fields
                const safeBody = { ...body };
                if (safeBody.password) safeBody.password = '***';
                this.logger.debug(`Body: ${JSON.stringify(safeBody)}`);
            }

            if (Object.keys(query ?? {}).length) {
                this.logger.debug(`Query: ${JSON.stringify(query)}`);
            }
        });

        next();
    }
}
