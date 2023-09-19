import { NextFunction, Request, Response } from "express"
import formidable from "formidable";
import path from "path";
import { ErrorWithStatus } from "~/models/schemas/Errors";

export const UploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({
        uploadDir: path.resolve('uploads'),
        maxFiles: 1,
        keepExtensions: true,
        maxFileSize: 300 * 1024 //300KB
    });
    form.parse(req, (err, fields, files) => {
        if (err) {
            throw err
        }
        res.json({ fields, files });
    });
}