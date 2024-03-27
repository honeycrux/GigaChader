// import { avatarUploadMiddleware, AvatarUploadFiles } from "@/middlewares/mediaUpload";
// import { compressAndUploadMedia } from "@/lib/mediaHandler";

// const someRouter = s.router(apiContract.something, {
//     someField: {
//         middleware: [avatarUploadMiddleware],
//         handler: async ({ req, res }) => {
//             const files = req.files as AvatarUploadFiles;
//             const avatarFile = files.avatar[0];
//             if (avatarFile) {
//                 /* TODO: Delete the old avatar here */
//
//                 // Upload media
//                 const response = await compressAndUploadMedia({
//                     maxPixelSize: 300,
//                     container: "avatar",
//                     file: avatarFile,
//                     type: "image",
//                 });
//
//                 /* TODO: Place response.url to the database */
//             }
//         },
//     },
// };
