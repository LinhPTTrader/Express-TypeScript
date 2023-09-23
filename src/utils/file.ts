import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/schemas/Errors'


export const initFolder = () => {
    const uploadFolderPathImages = path.resolve('uploads/images')
    const uploadFolderPathTemps = path.resolve('uploads/temps')
    const uploadFolderPathVideos = path.resolve('uploads/videos')
    if (!fs.existsSync(uploadFolderPathImages)) {
        fs.mkdirSync(uploadFolderPathImages,
            { recursive: true } // Tạo folder nested
        )
    }
    if (!fs.existsSync(uploadFolderPathTemps)) {
        fs.mkdirSync(uploadFolderPathTemps,
            { recursive: true } // Tạo folder nested
        )
    }
    if (!fs.existsSync(uploadFolderPathVideos)) {
        fs.mkdirSync(uploadFolderPathVideos,
            { recursive: true } // Tạo folder nested
        )
    }
}

export const handleUploadImage = (req: Request) => {
    const form = formidable({
        uploadDir: path.resolve('uploads/images'),
        maxFiles: 4,
        keepExtensions: true,
        maxFileSize: 1000 * 1024, //1MB
        filter: ({ name, originalFilename, mimetype }) => {

            const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
            if (!valid) {
                form.emit('error' as any, new ErrorWithStatus({ message: 'File type is not valid', status: HTTP_STATUS.UNPROCESSABLE_ENTITY }) as any);
                return false
            }
            return true
        }
    });
    return new Promise<File[]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err)
            }
            if (files.image === undefined) {
                reject(new ErrorWithStatus({ message: "File is not empty", status: HTTP_STATUS.NOT_FOUND }))
            }
            // eslint-disable-next-line no-extra-boolean-cast
            resolve(files.image as File[])
        });
    })
}

export const getNameFromFullname = (fullname: string) => {
    const namearr = fullname.split('.')
    namearr.pop()
    return namearr.join('')
}


export const handleUploadVideo = async (req: Request) => {
    const nanoId = (await import('nanoid')).nanoid
    const idName = nanoId()
    const folderPath = path.resolve(UPLOAD_VIDEO_DIR)
    const form = formidable({
        uploadDir: path.resolve(folderPath),
        maxFiles: 1,
        keepExtensions: true,
        maxFileSize: 500 * 1024 * 1024, //5MB
        filter: ({ name, originalFilename, mimetype }) => {
            const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
            if (!valid) {
                form.emit('error' as any, new ErrorWithStatus({ message: 'File type is not valid', status: HTTP_STATUS.UNPROCESSABLE_ENTITY }) as any)
                return false
            }
            return true
        }
    });
    return new Promise<File[]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err)
            }
            if (files.video === undefined) {
                reject(new ErrorWithStatus({ message: "File is not empty", status: HTTP_STATUS.NOT_FOUND }))
            }
            // eslint-disable-next-line no-extra-boolean-cast
            resolve(files.video as File[])
        });
    })
}