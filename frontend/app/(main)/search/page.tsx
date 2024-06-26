"use client";

import { InputText } from "primereact/inputtext";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Link from "next/link";
import { SimpleUserInfo } from "#/shared/models/user";
import { PostInfo } from "#/shared/models/post";

const Search = () => {
  // initialize next js's search feature
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This will run after every render
    // keeps input field focused after every input
    inputRef.current?.focus();
  });

  const [userSearchResult, setSearchResult] = useState<SimpleUserInfo[] | null>(null);
  const [postSearchResult, setPostSearchResult] = useState<PostInfo[] | null>(null);

  // submit search query to backend
  const handleSearch = useCallback(
    async (term: string | undefined) => {
      const params = new URLSearchParams(searchParams);
      
      // set query parameter in the url
      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }
      replace(`${pathname}?${params.toString()}`);

      if (term) {
        const userSearchResult = await apiClient.user.userSearch({ query: { query: term } });
        const postSearchResult = await apiClient.post.postSearch({ query: { query: term } });

        if (userSearchResult.status === 200) {
          console.log(userSearchResult.body);
          setSearchResult(userSearchResult.body);
        }
        if (postSearchResult.status === 200) {
          console.log(postSearchResult.body);
          setPostSearchResult(postSearchResult.body);
        }
      }

      inputRef.current?.focus();
    },
    [replace, searchParams, setSearchResult, pathname]
  );

  // get search results on page load
  // if there is a query parameter in the url, search for it
  useEffect(() => {
    if (searchParams.get("query")) {
      handleSearch(searchParams.get("query")?.toString());
    }
  }, [handleSearch, searchParams]);

  return (
    <div className="flex w-full overflow-y-auto justify-center min-h-full">
      <div className="flex flex-col w-[60%] space-y-4">
        <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
          <p className="text-3xl font-bold">Search</p>
        </div>
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pi pi-search"></span>
          <InputText
            ref={inputRef}
            className="pl-10 pr-10 font-medium center w-full"
            placeholder="Search User"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
            defaultValue={searchParams.get("query")?.toString()}
          />
        </div>

        {/* display table */}
        <div className="flex w-full gap-9">
          {userSearchResult && (
            <div className="w-full space-y-2">
              {userSearchResult.map((result, index) => (
                <Card
                  key={index}
                  pt={{
                    content: { className: "p-0" },
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg text-black font-bold">{result.displayName}</p>
                      <p className="text-sm text-gray-500">@{result.username}</p>
                    </div>
                    <Link href={`/profile/${result.username}`}>
                      <Button label="View Profile" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div className="flex w-full gap-9">
          {postSearchResult && (
            <div className="w-full space-y-2">
              {postSearchResult.map((result, index) => (
                <Card
                  key={index}
                  pt={{
                    content: { className: "p-0" },
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg text-black font-bold  overflow-ellipsis overflow-hidden max-w-2xl">{result.content}</p>
                      <p className="text-sm text-gray-500">@{result.author.username}</p>
                    </div>
                    <Link href={`/post/${result.id}`}>
                      <Button label="View Post" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
