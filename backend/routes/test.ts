import { apiContract } from "#/shared/contracts";
import { compressAndUploadMedia } from "@/lib/data/mediaHandler";
import { TestUploadFiles, testUploadMiddleware } from "@/middlewares/mediaUpload";
import { initServer } from "@ts-rest/express";

const s = initServer();

const testRouter = s.router(apiContract.test, {
    upload: {
        middleware: [testUploadMiddleware],
        handler: async ({ req }) => {
            console.log("Upload Handler");
            const urls = [];
            const files = req.files as TestUploadFiles;
            if (files) {
                if (files.media) {
                    console.log(`[test/upload] received ${files.media.length} files.`);
                    for (const file of files.media) {
                        console.log(`Uploading file originally named ${file.originalname}`);
                        const response = await compressAndUploadMedia({
                            maxPixelSize: 1920,
                            container: "test",
                            file: file,
                            type: "image",
                        });
                        console.log(`Destination url: ${response.url}`);
                        urls.push(response.url);
                    }
                }
            }
            return {
                status: 200,
                body: { urls },
            };
        },
    },
});

export { testRouter };
