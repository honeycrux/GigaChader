import dummyPost from "@/dummy_data/dummyPosts.json";
// import { useEffect, useState } from "react";
// import { validateUser } from "@/lib/actions/auth";

export function formatDate(dateString: string) {
  const date = new Date(dateString);

  // Format the time
  const time = date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

  // Format the date
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  // Combine the formatted time and date
  const formattedDateTime = `${time} - ${formattedDate}`;

  return formattedDateTime;
}

export function fakeFetchPost(id: string) {
  return dummyPost.find((post) => post.id === id);
}

// export function checkAuth() {
//   const [auth, setAuth] = useState<Awaited<ReturnType<typeof validateUser>>>();
//   useEffect(() => {
//     validateUser().then((data) => {
//       setAuth(data);
//     });
//   }, []);
//
//   return auth;
// }

/* Function to make links to every place on the site */

type SiteLinkKey = "login" | "signup" | "onboarding" | "home" | "global" | "discover" | "search" | "activity" | "profile" | "bookmarks" | "crypto" | "post";

function makeSiteLinkFunction<Params extends Record<string, string | number>>(callback: (params: Params) => string) {
  return callback;
}

export const siteLinkBuilder = {
  login: makeSiteLinkFunction<{}>(() => "/"),
  signup: makeSiteLinkFunction<{}>(() => "/signup"),
  onboarding: makeSiteLinkFunction<{}>(() => "/onboarding"),
  home: makeSiteLinkFunction<{}>(() => "/home"),
  global: makeSiteLinkFunction<{}>(() => "/global"),
  discover: makeSiteLinkFunction<{}>(() => "/discover"),
  search: makeSiteLinkFunction<{ searchKey?: string }>((params) => {
    return params.searchKey ? `/search/${params.searchKey}` : `/search`;
  }),
  activity: makeSiteLinkFunction<{}>(() => "/activity"),
  profile: makeSiteLinkFunction<{ username?: string }>((params) => {
    return params.username ? `/profile/${params.username}` : `/profile`;
  }),
  bookmarks: makeSiteLinkFunction<{}>(() => "/bookmarks"),
  crypto: makeSiteLinkFunction<{}>(() => "/crypto"),
  post: makeSiteLinkFunction<{ postId: string }>((params) => {
    return `/post/${params.postId}`;
  }),
} satisfies Record<SiteLinkKey, (params: any) => string>;
