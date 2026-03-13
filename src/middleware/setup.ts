import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

/**
 * Applies the first block of app-wide middleware: body parsing, cookie parsing,
 * and static mounts for card/general images. Called from index (composition root).
 * Does not include the later static mounts for /public and /src/resources.
 */
export function setupMiddleware(app: express.Application): void {
  app.use(express.json());

  // Cookie parser middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      req.cookies = {};
      cookieHeader.split(';').forEach((cookie: string) => {
        const [name, value] = cookie.trim().split('=');
        req.cookies[name] = value;
      });
    }
    next();
  });

  // Serve card images from resources directory
  app.use('/src/resources/cards/images', express.static(path.join(process.cwd(), 'src/resources/cards/images')));

  // Serve general images from resources directory
  app.use('/src/resources/images', express.static(path.join(process.cwd(), 'src/resources/images')));
}
