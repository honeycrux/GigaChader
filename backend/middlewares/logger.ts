/**
 * Name: Logger Middlewares
 * Description: Provide middlewares to log stuff happening to the server
 */

import { Request, Response, NextFunction } from "express";

/* App-level middleware to log API activity of the server */
export function createLog(req: Request, res: Response, next: NextFunction) {
    console.log("[middleware] createLog");
    res.on("finish", function () {
        console.log(req.method, decodeURI(req.url), res.statusCode, res.statusMessage);
    });
    next();
}
