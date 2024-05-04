/**
 * Name: Example of Media Upload
 * Description: Provide a code example of how to handle media upload in the route implementation
 */

// import { profileUploadMiddleware, ProfileUploadFiles } from "@/middlewares/mediaUpload";
// import { checkMediaUpload, compressAndUploadMedia } from "@/lib/data/mediaHandler";

// const someRouter = s.router(apiContract.something, {
//     someField: {
//         middleware: [profileUploadMiddleware],
//         handler: async ({ req, res }) => {
//             const files = req.files as ProfileUploadFiles;
//             if (files) {
//                 if (files.avatar) {
//                     const avatarFile = files.avatar[0];
//                     if (avatarFile) {
//                         /* TODO: Delete the old avatar here */

//                         // Upload media
//                         const type = checkMediaUpload({ file: avatarFile, allowedTypes: ["IMAGE", "VIDEO"] });
//                         if (!type) {
//                             return {
//                                 status: 400,
//                                 body: {
//                                     error: `File type ${avatarFile.mimetype} is unsupported`,
//                                 },
//                             };
//                         }
//                         const response = await compressAndUploadMedia({
//                             maxPixelSize: 550,
//                             container: "avatar",
//                             file: avatarFile,
//                             type: type,
//                         });

//                         /* TODO: Place response.url to the database */
//                     }
//                 }
//             }
//         },
//     },
// };
