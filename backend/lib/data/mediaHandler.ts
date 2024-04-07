/* Server-specific media handlers to perform actions on the (server-agnostic) storage */

import { deleteBlob, downloadBlob, uploadBlob } from "./storage";
import crypto from "crypto";
import mime from "mime-types";
import sharp from "sharp";

const generateFileName = (bytes: number = 20) => crypto.randomBytes(bytes).toString("hex");

/* Define existing containers - these should be containers existing on the storage */

export type ExistingContainerName = "avatar" | "media" | "test";

// this should be used when constructing storage programmatically
export const storage: Record<ExistingContainerName, (blobName: string) => string> = {
    avatar: (blobName: string) => `avatar/${blobName}`,
    media: (blobName: string) => `media/${blobName}`,
    test: (blobName: string) => `test/${blobName}`,
};

/* The url is returned as some access path of the server. Below are helper functions to attach or remove this added structure. */

const storagePathToUrl = (name: string) => `/image/${name}`;

const urlToStoragePath = (url: string) => url.replace(/^\/image\//, "");

interface CompressUploadProps {
    container: ExistingContainerName;
    file: Express.Multer.File;
    type: "image" | "video";
    maxPixelSize: number;
}
// Uploads image and returns the new url
export async function compressAndUploadMedia(input: CompressUploadProps) {
    let filebuf = input.file.buffer;
    const newFileName = generateFileName();
    let ext = mime.extension(input.file.mimetype);

    if (input.type === "image") {
        // resizing and compression
        const sharpInstance = sharp(input.file.buffer);
        filebuf = await sharpInstance.jpeg({ mozjpeg: true }).toBuffer();
        // compression disabled
        // .resize({ width: input.maxPixelSize, height: input.maxPixelSize, fit: "contain", withoutEnlargement: true })
        ext = "jpeg";
    } else {
        // video: no action for now
    }

    const blobName = ext !== false ? storage[input.container](`${newFileName}.${ext}`) : storage[input.container](newFileName);
    const response = await uploadBlob(blobName, filebuf);

    const url = storagePathToUrl(blobName);
    return {
        url,
        ...response,
    };
}

interface DownloadProps {
    url: string;
}
// Download media using url
export async function downloadMedia(input: DownloadProps) {
    const blobName = urlToStoragePath(input.url);
    console.log(blobName);
    return await downloadBlob(blobName);
}

interface DeleteProps {
    url: string;
}
// Delete media using url
export async function deleteMedia(input: DeleteProps) {
    const blobName = urlToStoragePath(input.url);
    return await deleteBlob(blobName);
}
