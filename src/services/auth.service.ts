import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function checkUserLoggedIn(req: Request, res: Response, next: NextFunction) {
    logger.debug(`Current user is ${req.user}`);
    const isUserLoggedIn = req.isAuthenticated() && req.user;
    if (!isUserLoggedIn) {
        return res.status(401).send({
            error: 'You are not logged in..!!'
        });
    }
    next();
}
