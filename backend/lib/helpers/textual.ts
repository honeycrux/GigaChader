// stored crypto in memory

import { getFullCryptoList } from "./crypto";

type FindTextualContextProps = {
    content: string;
};
export async function analysePostContent({ content }: FindTextualContextProps) {
    // 1. Identify hashtags
    console.log("[post/create analysis] identify hashtags");
    let hashtags: string[] = [];
    let hashtagIndices: [number, number][] = []; // the indices [m, n] indicates a substring range (m, n) inclusive
    const hashtagex = /#([^ !"#$%&'()*+,\-.\/:;<=>?@[\]^_`{|}~]*)/g;
    let match;
    while ((match = hashtagex.exec(content)) !== null) {
        hashtags.push(match[1]); // add first matched group (the tag text without #) to array
        hashtagIndices.push([match.index, match.index + match[0].length - 1]);
    }
    // remove duplicate tags
    hashtags = hashtags.filter((tag, i) => hashtags?.indexOf(tag) === i);

    // 2. Identify crypto topics
    console.log("[post/create analysis] identify crypto topics");
    const cryptoTopics: string[] = [];
    const nonwordgex = /[!"#$%&'()*+,\-.\/:;<=>?@[\]^_`{|}~]/g;
    const words = content.toLowerCase().replace(nonwordgex, "").split(" ");
    const fullCryptoList = await getFullCryptoList();
    if (fullCryptoList) {
        for (const crypto of fullCryptoList) {
            if (words.some((word) => crypto.cryptoId === word || crypto.symbol.toLowerCase() === word)) {
                cryptoTopics.push(crypto.cryptoId);
            }
        }
    }

    // 3. Break down text into list of textual context
    console.log("[post/create analysis] form textual context");
    let pos = 0;
    let hashtagIndex = 0;
    let textualContexts: { href?: string; text: string }[] = [];
    const getHashtagHref = (tag: string) => `/search?query=${encodeURIComponent(tag)}`;
    while (pos < content.length) {
        // assume we always start at the end of a hashtag
        if (hashtagIndex < hashtagIndices.length) {
            const [hashtagStartPos, hashtagEndPos] = hashtagIndices[hashtagIndex];
            // consume text before the next hashtag
            let nextIndex = hashtagStartPos;
            if (nextIndex - pos > 0) {
                textualContexts.push({ href: undefined, text: content.substring(pos, hashtagStartPos) });
            }
            pos = hashtagStartPos;
            // consume the hashtag
            nextIndex = hashtagEndPos + 1;
            if (nextIndex - pos > 0) {
                const rawHashtag = content.substring(pos, nextIndex); // hashtag including the # symbol
                textualContexts.push({ href: getHashtagHref(rawHashtag), text: rawHashtag });
            }
            pos = hashtagEndPos + 1;
            hashtagIndex++;
        } else {
            // consume text till the end of string
            const nextIndex = content.length;
            if (nextIndex - pos > 0) {
                textualContexts.push({ href: undefined, text: content.substring(pos, nextIndex) });
            }
            pos = nextIndex;
        }
    }

    return {
        hashtags,
        cryptoTopics,
        textualContexts,
    };
}
