/* Implements (server-agnostic) storage */

import { BlobServiceClient } from "@azure/storage-blob";
import { Readable } from "stream";

// initialize blob service client

let blobServiceClient: BlobServiceClient;

try {
    blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
} catch (e) {
    console.log("[storage.ts] Error initializing blobServiceClient");
    console.log(e);
    console.warn("App running without blobServiceClient, image storage/retrieval will fail");
}

// define blob storage functions

function storagePathResolver(path: string): [string, string] {
    const [containerName, ...rest] = path.split("/");
    const blobName = rest.join("/");
    return [containerName, blobName];
}

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
