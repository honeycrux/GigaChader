import { Request, Response, NextFunction } from "express";

/* App-level middleware */
export function createLog(req: Request, res: Response, next: NextFunction) {
    console.log("[middleware] createLog");
    res.on("finish", function () {
        console.log(req.method, decodeURI(req.url), res.statusCode, res.statusMessage);
    });
    next();
}
