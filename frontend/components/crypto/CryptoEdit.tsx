"use client";
import { apiClient } from "@/lib/apiClient";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { CryptoInfo } from "#/shared/models/crypto";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

async function getCryptoInfo(query: string) {
    const { body, status } = await apiClient.crypto.cryptoSearch({ query: { query: query, limit: 20 } });
    if (!(status === 200)) {
      return null;
    }
    return body;
  }

type Props = {
    cryptoBookmarks: CryptoInfo[] | null;
    addedItems: CryptoInfo[] ;
    setAddedItems: Dispatch<SetStateAction<CryptoInfo[]>>;
    bHasAmount?: boolean;
    amountList?: number[];
    setAmountList?: Dispatch<SetStateAction<number[]>>;
}

const CryptoEdit = ({cryptoBookmarks, addedItems, setAddedItems, bHasAmount, amountList, setAmountList} : Props) => {
    const [searchResult, setSearchResult] = useState<CryptoInfo[] | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    function handleButtonClick(result: CryptoInfo, set: boolean) {
        if (set) {
          setAddedItems([...addedItems, result]);
        } else {
          setAddedItems(addedItems.filter((item) => item.cryptoId !== result.cryptoId));
        }
      }
      
      const handlecryptoSearch = useCallback(
        async (term: string) => {
          const searchResult = await getCryptoInfo(term);
          setSearchResult(searchResult);
    
          inputRef.current?.focus();
        },
        [setSearchResult]
      );
    
      
    
      useEffect(() => {
        handlecryptoSearch("");
      }, [handlecryptoSearch]);

      if (!cryptoBookmarks) {
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
                {cryptoBookmarks && (
                    <div className='w-full space-y-2'>
                        {searchResult && searchResult.map((result, index) => {
                            const bHasAdded = addedItems.some(bookmark => bookmark.symbol === result.symbol);
                            return (
                                <Card key={index} {...result}
                                    pt={{
                                        content: { className: 'p-0' }
                                    }}>
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <p className='text-lg text-black font-bold'>{result.name}</p>
                                            <p className='text-sm text-gray-500'>{result.symbol}</p>
                                        </div>

                                        <p className='text-lg text-black font-bold'>${result.priceUsd}</p>
                                        <Button
                                            className="`flex items-center py-2 px-7 rounded-lg 
                            ${selectedButton === 'User management' ? 'bg-orange1 text-white' : ' text-black'}`"
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

export default CryptoEdit;