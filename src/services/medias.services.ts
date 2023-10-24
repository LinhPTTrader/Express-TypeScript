import { Request } from "express";
import sharp from "sharp";
import path from "path";
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from "~/utils/file";
import { UploadFileS3 } from "~/utils/s3";
import mime from 'mime'
import { CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import { MediaType } from "~/constants/enum";

class MediaService {
    async UploadImage(req: Request) {
        const files = await handleUploadImage(req);
        console.log(files)
        const arrFile: any = []
        return Promise.all(files.map(async (file) => {
            const newName = getNameFromFullname(file.newFilename);
            const newPath = path.resolve('uploads/temps', `${newName}.jpg`);
            const newFullFileName = `${newName}.jpg`
            // console.log(file.filepath);
            await sharp(file.filepath)
                .resize(800, 800)
                .jpeg()
                .toFile(newPath);
            const s3Result = await UploadFileS3({
                filename: 'images/' + newFullFileName,
                filepath: newPath,
                contentType: mime.getType(newPath) as string
            })
            return {
                url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
                type: MediaType.Image
            }
        }));

    }
    async UploadVideo(req: Request) {
        const file = await handleUploadVideo(req);
        const newName = getNameFromFullname(file[0].newFilename);
        const newPath = path.resolve('uploads/videos', `${newName}.mp4`);
        const newFullFileName = `${newName}.mp4`
        const s3Result = await UploadFileS3({
            filename: 'videos/' + newFullFileName,
            filepath: newPath,
            contentType: mime.getType(newPath) as string
        })
        return {
            url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
            type: MediaType.Video
        }
    }
}

const mediaService = new MediaService();
export default mediaService;