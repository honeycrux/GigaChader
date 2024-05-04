/**
 * Name: Storage Utilities
 * Description: Implements server-agnostic storage utility functions
 *              It is not recommended to use this file directly
 *              Instead, use Media Handlers which has higher level functions
 */

import { BlobServiceClient } from "@azure/storage-blob";
import { Readable } from "stream";

/* Initialize blob service client */

let blobServiceClient: BlobServiceClient;

try {
    blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
} catch (e) {
    console.log("[storage.ts] Error initializing blobServiceClient");
    console.log(e);
    console.warn("App running without blobServiceClient, image storage/retrieval will fail");
}

/* Blob storage functions */

function storagePathResolver(path: string): [string, string] {
    const [containerName, ...rest] = path.split("/");
    const blobName = rest.join("/");
    return [containerName, blobName];
}

/* Upload media using storage path */

export async function uploadBlob(storagePath: string, filebuf: Buffer) {
    const [containerName, blobName] = storagePathResolver(storagePath);

    // Create a unique name for the blob
    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!(await containerClient.exists())) {
        console.log(`[storage.ts] upload failed: container ${containerName} does not exist.`);
        return;
    }

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Display blob name and url
    console.log(`\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`);

    // Upload data to the blob
    const readableStream = Readable.from(filebuf);
    const uploadBlobResponse = await blockBlobClient.uploadStream(readableStream);
    console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`);
    return uploadBlobResponse;
}

/* Download media using storage path */

export async function downloadBlob(storagePath: string) {
    const [containerName, blobName] = storagePathResolver(storagePath);

    // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!(await containerClient.exists())) {
        console.log(`[storage.ts] download failed: container ${containerName} does not exist.`);
        return;
    }
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    if (!(await blockBlobClient.exists())) {
        console.log(`[storage.ts] download failed: blob ${containerName}/${blobName} does not exist.`);
        return;
    }
    const downloadedBlockBlobResponse = await blockBlobClient.download(0);
    console.log(`Blob was downloaded successfully. requestId: ${downloadedBlockBlobResponse.requestId}`);
    return downloadedBlockBlobResponse;
}

/* Delete media using storage path */

export async function deleteBlob(storagePath: string) {
    const [containerName, blobName] = storagePathResolver(storagePath);

    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!(await containerClient.exists())) {
        console.log(`[storage.ts] delete failed: container ${containerName} does not exist.`);
        return;
    }
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    if (!(await blockBlobClient.exists())) {
        console.log(`[storage.ts] delete failed: blob ${containerName}/${blobName} does not exist.`);
        return;
    }
    const downloadedBlockBlobResponse = await blockBlobClient.deleteIfExists();
    console.log(`Blob was deleted successfully. requestId: ${downloadedBlockBlobResponse.requestId}`);
    return downloadedBlockBlobResponse;
}
