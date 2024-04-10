'use client';
import { PersonalUserInfo } from "#/shared/models/user";
import { apiClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import { Button } from "primereact/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from 'primereact/card';
import Link from 'next/link';
import { Dialog } from "primereact/dialog";
import { InputText } from 'primereact/inputtext';
// import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { CryptoInfo } from "#/shared/models/crypto";

// type Props = {
//     symbol: string
// }

async function getUserInfo() {
    const { body, status } = await apiClient.user.getInfo({});
    if (!(status === 200)) {
        return null;
    }
    return body;
}

async function getCryptoInfo(query: string) {
    const { body, status } = await apiClient.crypto.cryptoSearch({ query: { query: query, limit: 20 } });
    if (!(status === 200)) {
        return null;
    }
    return body;
}

function Crypto({ symbol }: any) {
    const { user } = useAuthContext();
    const [cryptoBookmarks, setCryptoBookmarks] = useState<CryptoInfo[] | null>(null);
    const [searchResult, setSearchResult] = useState<CryptoInfo[] | null>(null);
    const [bEditCryptoDiagVisible, setbEditCryptoDiagVisible] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    // const [bHasAdded, setbHasAdded] = useState<boolean>(false);
    const [addedItems, setAddedItems] = useState<CryptoInfo[]>([]);

    function handleButtonClick(result: any, set: boolean) {
        if (set) {
            setAddedItems([...addedItems, result]);
        } else {
            setAddedItems(addedItems.filter((item) => item.cryptoId !== result.cryptoId));
        }
    }

    async function handleSave() {
        let updatedCryptoBookmarks = addedItems;
        if (updatedCryptoBookmarks) {
            const { body, status } = await apiClient.user.userConfig({
                body: {
                    cryptoBookmarks: updatedCryptoBookmarks.map((value) => value.cryptoId)
                }
            })
            if (status === 200 && body) {
                if (body.userCryptoInfo.cryptoBookmarks) {
                    const nonNull: CryptoInfo[] = [];
                    for (const bookmark of body.userCryptoInfo.cryptoBookmarks) {
                        if (bookmark) {
                            nonNull.push(bookmark)
                        }
                    }

                    setCryptoBookmarks(nonNull);
                }
            }
        }
        setbEditCryptoDiagVisible(false);
    }

    useEffect(() => {
        const wrapper = async () => {
            const response = await getUserInfo();
            console.log(response)
            setCryptoBookmarks(response?.userCryptoInfo.cryptoBookmarks || null);
            setAddedItems(response?.userCryptoInfo.cryptoBookmarks || []);
        };

        wrapper();
    }, [user]);

    {/*   crypto edit display */ }
    const handlecryptoSearch = useCallback(async (term: string) => {
        const searchResult = await getCryptoInfo(term);
        setSearchResult(searchResult);

        inputRef.current?.focus();
    }, [setSearchResult, apiClient]);

    useEffect(() => {
        handlecryptoSearch("");
    }, []);

    if (!user) {
        return <div>Go back to login</div>;
    }

    if (!cryptoBookmarks) {
        return <div>Cannot fetch ._.</div>;
    }




    const footerElement = (
        <div className="mt-4">
            <Button label="Save" icon="pi pi-check" onClick={handleSave} />
        </div>
    );



    return (
        <div className='flex w-full overflow-y-auto justify-center min-h-full'>
            <Dialog
                header="Edit Crypto Bookmarks"
                footer={footerElement}
                visible={bEditCryptoDiagVisible}
                className="w-[50vw] min-h-[80%]"
                onHide={() => setbEditCryptoDiagVisible(false)}
            >
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
            </Dialog>


            <div className="flex flex-col w-[60%] space-y-4">
                <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                    <p className="text-3xl font-bold">Bookmarked Cryptos</p>
                </div>

                <div className="flex w-full h-fit justify-end mt-5 items-center !mb-0">
                    <Button className="w-36" label="Edit List" onClick={() => setbEditCryptoDiagVisible(true)} />
                </div>

                {/* crypto table */}


                <div className="flex w-full gap-9">
                    {cryptoBookmarks && (
                        <div className='w-full space-y-2'>
                            {cryptoBookmarks.map((result, index) => (
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

                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>


            </div>
        </div>
    )
}

export default Crypto
