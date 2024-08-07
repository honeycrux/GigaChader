"use client";
import { apiClient } from "@/lib/apiClient";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { CryptoInfo } from "#/shared/models/crypto";
import { useCallback, useEffect, useRef, useState } from "react";

// fetch crypto info from backend
async function getCryptoInfo(query: string) {
  const { body, status } = await apiClient.crypto.cryptoSearch({ query: { query: query, limit: 20 } });
  if (!(status === 200)) {
    return null;
  }
  return body;
}

type Props = {
  cryptoList: CryptoInfo[] | null;
  onEdit: (cryptoList: CryptoInfo[]) => void;
};

// crypto search component for adding/removing crypto bookmarks or flexfolio
const CryptoSearch = ({ cryptoList, onEdit }: Props) => {
  const [searchResult, setSearchResult] = useState<CryptoInfo[] | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [bAmountDiagVisible, setbAmountDiagVisible] = useState<boolean>(false);
  const [addedItems, setAddedItems] = useState<CryptoInfo[]>(cryptoList || []);

  // add or remove crypto bookmark on add/remove button click
  function handleButtonClick(result: CryptoInfo, set: boolean) {
    const newItems = set ? [...addedItems, result] : addedItems.filter((item) => item.cryptoId !== result.cryptoId);
    setAddedItems(newItems);
    if (onEdit) {
      onEdit(newItems);
    }
  }

  // submit search request to backend
  const handlecryptoSearch = useCallback(
    async (term: string) => {
      const searchResult = await getCryptoInfo(term);
      setSearchResult(searchResult);

      inputRef.current?.focus();
    },
    [setSearchResult]
  );

  // abuse search function to fetch all cryptos on first render
  useEffect(() => {
    handlecryptoSearch("");
  }, [handlecryptoSearch]);

  if (!cryptoList) {
    return <div>Cannot fetch ._.</div>;
  }

  return (
    <div>
      <div className="flex flex-col w-full bg-[#e5eeee] relative">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pi pi-search"></span>
          <InputText
            ref={inputRef}
            className="pl-10 pr-10 font-medium center w-full"
            placeholder="Search Crypto"
            onChange={(e) => {
              handlecryptoSearch(e.target.value);
            }}
          />
        </div>
        <div className="flex w-full gap-9">
          {cryptoList && (
            <div className="w-full space-y-2">
              {searchResult &&
                searchResult.map((result, index) => {
                  const bHasAdded = addedItems.some((bookmark) => bookmark.symbol === result.symbol);
                  return (
                    <Card
                      key={index}
                      pt={{
                        content: { className: "p-0" },
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className=" flex flex-row items-center space-x-3">
                          <img 
                              src= {"https://assets.coincap.io/assets/icons/"+ result.symbol.toLowerCase()+ "@2x.png"}
                              onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src="https://coincap.io/static/logo_mark.png";
                              }}
                              alt="crypto image" 
                              className=" size-7 "
                          />
                          <div>
                            <p className="text-lg text-black font-bold">{result.name}</p>
                            <p className="text-sm text-gray-500">{result.symbol}</p>
                          </div>
                        </div>

                        <p className="text-lg text-black font-bold">${result.priceUsd}</p>

                        <Button
                          className="flex items-center py-2 px-7 rounded-lg "
                          label={bHasAdded ? "Added" : "Add"}
                          icon={bHasAdded ? "pi pi-check" : "pi pi-plus"}
                          onClick={() => {
                            if (bHasAdded) {
                              handleButtonClick(result, false);
                            } else {
                              handleButtonClick(result, true);
                            }
                          }}
                        />
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoSearch;
