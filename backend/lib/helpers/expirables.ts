// Handles information expiry

import { prismaClient } from "../data/db";
import { deleteMedia } from "../data/mediaHandler";

export async function createExpirableNotification(props: { content: string; link?: string; receiverId: string }) {
    return await prismaClient.notification.create({
        data: {
            content: props.content,
            link: props.link,
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days after creation
            receiver: {
                connect: {
                    id: props.receiverId,
                },
            },
        },
    });
}

export async function expireOldNotifications() {
    // Find all notifications that has expired
    const data = await prismaClient.notification.findMany({
        select: {
            id: true,
        },
        where: {
            expiry: {
                lt: new Date(),
            },
        },
    });
    if (!data) {
        return null;
    }
    // Delete expired notifications
    if (data.length > 0) {
        const idsToDelete = data.map((d) => d.id);
        const res = await prismaClient.notification.deleteMany({
            where: {
                id: {
                    in: idsToDelete,
                },
            },
        });
        if (res) {
            return res.count;
        }
    } else {
        return 0;
    }
    return null;
}

export async function createExpirableMediaStash(props: { urls: string[] }) {
    return await prismaClient.mediaStash.createMany({
        data: props.urls.map((url) => {
            return {
                url: url,
                expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days after creation
            };
        }),
    });
}

export async function expireOldMediaStashes() {
    // Find all media stashes that has expired
    const data = await prismaClient.mediaStash.findMany({
        select: {
            id: true,
            url: true,
        },
        where: {
            expiry: {
                lt: new Date(),
            },
        },
    });
    if (!data) {
        return null;
    }
    if (data.length > 0) {
        // Delete expired media from storage
        for (const d of data) {
            try {
                await deleteMedia({ url: d.url });
            } catch (e) {
                // Assume already deleted for now
            }
        }
        // Delete stash information
        const idsToDelete = data.map((d) => d.id);
        const res = await prismaClient.mediaStash.deleteMany({
            where: {
                id: {
                    in: idsToDelete,
                },
            },
        });
        if (res) {
            return res.count;
        }
    } else {
        return 0;
    }
    return null;
}
