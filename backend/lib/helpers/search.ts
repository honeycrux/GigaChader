/**
 * Name: Search Utilities
 * Description: Provide utility functions for searching
 */

import { prismaClient } from "../data/db";
import { postInfoFindManyOrdered } from "../objects/post";
import { simpleUserInfoFindManyOrdered } from "../objects/user";

/* Search users */

type SearchUserProps = {
    query: string;
    from?: string;
    limit?: number;
    previliged?: boolean;
};
export async function searchUser({ query, from, limit, previliged }: SearchUserProps) {
    const data = await prismaClient.user.findMany({
        take: limit,
        cursor: from ? { id: from } : undefined,
        skip: from ? 1 : undefined,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            username: true,
        },
        where: {
            suspended: previliged ? undefined : false,
            OR: [{ username: { startsWith: query } }],
        },
    });
    if (!data) {
        return null;
    }
    const userlist = data.map((user) => user.username);
    const userinfo = await simpleUserInfoFindManyOrdered({ username: userlist });
    return userinfo;
}

/* Search posts */

type SearchPostProps = {
    query: string;
    from?: string;
    limit?: number;
    previliged?: boolean;
    requesterId: string | undefined;
};
export async function searchPost({ query, from, limit, previliged, requesterId }: SearchPostProps) {
    const isTopic = !!query.trim().match(/^[Tt]opic:/g);
    const topicText = query.trim().replace(/^[Tt]opic:/g, "");
    const isTag = !!query.trim().match(/^#\S*$/g);
    const tagText = query.trim().replace(/^#/g, "");
    const data = await prismaClient.post.findMany({
        take: limit,
        cursor: from ? { id: from } : undefined,
        skip: from ? 1 : undefined,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
        },
        where: {
            suspended: previliged ? undefined : false,
            author: previliged
                ? undefined
                : {
                      suspended: false,
                  },
            postCryptoTopics: isTopic
                ? {
                      some: { OR: [{ cryptoId: { startsWith: topicText } }] },
                  }
                : undefined,
            postHashtags: isTag
                ? {
                      some: { tagText: { startsWith: tagText } },
                  }
                : undefined,
            OR: isTopic || isTag ? undefined : [{ content: { contains: query } }, { author: { username: { startsWith: query } } }],
        },
    });
    if (!data) {
        return null;
    }
    const postlist = data.map((post) => post.id);
    const postinfo = await postInfoFindManyOrdered({ postId: postlist, requesterId: requesterId });
    return postinfo;
}
