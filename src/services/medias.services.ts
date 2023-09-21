import { Request } from "express";
import sharp from "sharp";
import path from "path";
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from "~/utils/file";
import { isCheck } from "~/constants/config";



class MediaService {
    async uploadImage(req: Request) {
        const files = await handleUploadImage(req);
        const arrFile: any = []
        return Promise.all(files.map(async (file) => {
            const newName = getNameFromFullname(file.newFilename);
            const newPath = path.resolve('uploads/temps', `${newName}.jpg`);
            console.log(file.filepath);

            await sharp(file.filepath)
                .resize(800, 800)
                .jpeg()
                .toFile(newPath);

            return isCheck ? `http://localhost:${process.env.HOST}/static/${newName}.jpg`
                : `http://localhost:${process.env.PORT}/static/${newName}.jpg`;
        }));

    }
    async UploadVideo(req: Request) {
        const file = await handleUploadVideo(req);
        console.log(file)
        return file
    }
}

const mediaService = new MediaService();
export default mediaService;