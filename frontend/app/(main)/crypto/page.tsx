"use client";
import { apiClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import { Button } from "primereact/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
// import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { CryptoInfo } from "#/shared/models/crypto";
import { PersonalUserInfo } from "#/shared/models/user";
import CryptoEdit from "@/components/crypto/CryptoSearch";

// type Props = {
//     symbol: string
// }

async function getCryptoInfo(query: string) {
  const { body, status } = await apiClient.crypto.cryptoSearch({ query: { query: query, limit: 20 } });
  if (!(status === 200)) {
    return null;
  }
  return body;
}

function Crypto() {
  const { user, userInfo } = useAuthContext();
  const [cryptoBookmarks, setCryptoBookmarks] = useState<CryptoInfo[] | null>(null);
  const [searchResult, setSearchResult] = useState<CryptoInfo[] | null>(null);
  const [bEditCryptoDiagVisible, setbEditCryptoDiagVisible] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // const [bHasAdded, setbHasAdded] = useState<boolean>(false);
  const [selectedButton, setSelectedButton] = useState("Bookmark");
  const [cryptoHolding, setCryptoHolding] = useState<PersonalUserInfo["userCryptoInfo"]["cryptoHoldings"] | null>(null);
  const [bDeleteBookmarkDiagVisible, setbDeleteBookmarkDiagVisible] = useState<boolean>(false);
  const [deletingCrypto, setDeletingCrypto] = useState<CryptoInfo | null>(null);
  const [addedItems, setAddedItems] = useState<CryptoInfo[]>([]);
  


  async function handleSave() {
    let updatedCryptoBookmarks = addedItems;
    if (updatedCryptoBookmarks) {
      const { body, status } = await apiClient.user.userConfig({
        body: {
          cryptoBookmarks: updatedCryptoBookmarks.map((value) => value.cryptoId),
        },
      });
      if (status === 200 && body) {
        if (body.userCryptoInfo.cryptoBookmarks) {
          const newBookmarks: CryptoInfo[] = [];
          for (const bookmark of body.userCryptoInfo.cryptoBookmarks) {
            if (bookmark) {
              newBookmarks.push(bookmark);
            }
          }
          setCryptoBookmarks(newBookmarks);
          setAddedItems(newBookmarks);
        }
      }
    }
    setbEditCryptoDiagVisible(false);
  }

  async function handleDeletion() {
    if (cryptoBookmarks && deletingCrypto) {
        const newList = cryptoBookmarks.filter((value) => value.cryptoId !== deletingCrypto.cryptoId);
        const { body, status } = await apiClient.user.userConfig({
            body: {
                cryptoBookmarks: newList.map((crypto) => crypto.cryptoId),
            },
        });
        if (status === 200 && body) {
          if (body.userCryptoInfo.cryptoBookmarks) {
            const newBookmarks: CryptoInfo[] = [];
            for (const bookmark of body.userCryptoInfo.cryptoBookmarks) {
              if (bookmark) {
                newBookmarks.push(bookmark);
              }
            }
            setCryptoBookmarks(newBookmarks);
            setAddedItems(newBookmarks);
          }
        }
    }
    setDeletingCrypto(null);
    setbDeleteBookmarkDiagVisible(false);
  }

  useEffect(() => {
    setCryptoBookmarks(userInfo?.userCryptoInfo.cryptoBookmarks || null);
    setAddedItems(userInfo?.userCryptoInfo.cryptoBookmarks || []);
  }, [userInfo]);

  {
    /*   crypto edit display */
  }
  const handlecryptoSearch = useCallback(
    async (term: string) => {
      const searchResult = await getCryptoInfo(term);
      setSearchResult(searchResult);

      inputRef.current?.focus();
    },
    [setSearchResult]
  );

  const handlecryptoHandle = (input: string) => {};

  useEffect(() => {
    handlecryptoSearch("");
  }, [handlecryptoSearch]);

  if (!user) {
    return <div>Go back to login</div>;
  }

  if (!cryptoBookmarks) {
    return <div>Cannot fetch ._.</div>;
  }

  const footerElementSave = (
    <div className="mt-4">
      <Button label="Save" icon="pi pi-check" onClick={handleSave} />
    </div>
  );

  const footerElementDelBookmark = (
    <div className="mt-4">
      <Button label="No" icon="pi pi-times" onClick={() => { setbDeleteBookmarkDiagVisible(false); setDeletingCrypto(null) }} className="p-button-text" />
      <Button label="Yes" icon="pi pi-check" onClick={handleDeletion} autoFocus />
    </div>
  );

  return (
    <div className="flex w-full overflow-y-auto justify-center min-h-full">
            <Dialog
                header="Edit Crypto Bookmarks"
                footer={footerElementSave}
                visible={bEditCryptoDiagVisible}
                className="w-[50vw] min-h-[80%]"
                onHide={() => {setbEditCryptoDiagVisible(false); setAddedItems(cryptoBookmarks);}}
        >
                <div className="flex justify-between w-full">
                <Button
                    className={`w-full ${selectedButton === "Bookmark" ? "border-0 !border-b-2 border-orange1" : ""}`}
                    label="Bookmark"
                    text
                    onClick={() => setSelectedButton("Bookmark")}
                />
                <Button
                    className={`w-full ${selectedButton === "Flexfolio" ? "border-0 !border-b-2 border-orange1" : ""}`}
                    label="Flexfolio"
                    text
                    onClick={() => setSelectedButton("Flexfolio")}
                />
                </div>
                {selectedButton === "Bookmark" ?(
                    <CryptoEdit cryptoList={cryptoBookmarks} onEdit={(newItems) => {
                        setAddedItems(newItems);
                    }} />
                    )
                    :selectedButton === "Flexfolio" ?(
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
                                {cryptoHolding && (
                                    <div className='w-full space-y-2'>
                                        {cryptoHolding.map((result, index) => {
                                            
                                            return (
                                                <Card key={index} {...result}
                                                    pt={{
                                                        content: { className: 'p-0' }
                                                    }}>
                                                    <div className='flex justify-between items-center'>
                                                        <div>
                                                            <p className='text-lg text-black font-bold'>{result.crypto.name}</p>
                                                            <p className='text-sm text-gray-500'>{result.crypto.symbol}</p>
                                                        </div>

                                                        <p className='text-lg text-black font-bold'>${result.crypto.priceUsd}</p>
                                                        <InputText
                                                         ref={inputRef}
                                                         className=" font-medium center w-11"
                                                         
                                                         onChange={(e) => {
                                                             handlecryptoHandle(e.target.value);
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

                    ): null} 
            </Dialog>

      <div className="flex flex-col w-[60%] space-y-4">
        <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
          <p className="text-3xl font-bold">Bookmarked Cryptos</p>
        </div>

        <div className="flex w-full h-fit justify-end mt-5 items-center !mb-0">
          <Button className="w-36" label="Edit List" onClick={() => setbEditCryptoDiagVisible(true)} />
        </div>

        {/* crypto table */}
        <Dialog
                footer={footerElementDelBookmark}
                visible={bDeleteBookmarkDiagVisible}
                onHide={() => {setbDeleteBookmarkDiagVisible(false); setAddedItems(cryptoBookmarks);}}
        >
            <p className="text-xl "> 
            Are you sure you want to delete <span className="font-bold">{deletingCrypto?.name} &#40;{deletingCrypto?.symbol}&#41;</span>?</p>
        </Dialog>

        <div className="flex w-full gap-9">
          {cryptoBookmarks && (
            <div className="w-full space-y-2">
              {cryptoBookmarks.map((result, index) => (
                <Card
                  key={index}
                  pt={{
                    content: { className: "p-0" },
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg text-black font-bold">{result.name}</p>
                      <p className="text-sm text-gray-500">{result.symbol}</p>
                    </div>
                    <div className=" flex flex-row items-center">
                        <p className="text-lg text-black font-bold">${result.priceUsd}</p>
                        <Button 
                            className="`flex ml-4 items-center py-2 px-7 rounded-lg 
                            ${selectedButton === 'User management' ? 'bg-orange1 text-white' : ' text-black'}`"
                            icon ="pi pi-trash"
                            onClick={() => {
                                setbDeleteBookmarkDiagVisible(true);
                                setDeletingCrypto(result);

                            }}
                        />

                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Crypto;
