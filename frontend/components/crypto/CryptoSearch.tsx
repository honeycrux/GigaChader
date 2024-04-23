"use client";
import { apiClient } from "@/lib/apiClient";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { CryptoInfo } from "#/shared/models/crypto";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";

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
}

const CryptoEdit = ({cryptoList: cryptoBookmarks, onEdit} : Props) => {
    const [searchResult, setSearchResult] = useState<CryptoInfo[] | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [bAmountDiagVisible, setbAmountDiagVisible] = useState<boolean>(false);
    const [addedItems, setAddedItems] = useState<CryptoInfo[]>([]);

    function handleButtonClick(result: CryptoInfo, set: boolean) {
        const newItems = set ? ([...addedItems, result]) : (addedItems.filter((item) => item.cryptoId !== result.cryptoId));
        setAddedItems(newItems);
        if (onEdit) {
            onEdit(newItems);
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
            {/* pop-up amount input */}
            {/* <Dialog 
                header="Edit Crypto Bookmarks"
                footer={footerElementAmount}
                visible={bAmountDiagVisible}
                onHide={() => setbAmountDiagVisible(false)}
            >

            </Dialog> */}
            {/* end */}

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

export default CryptoEdit;