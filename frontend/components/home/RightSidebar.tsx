"use client";

import { useEffect, useState, useCallback,useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { apiClient } from "@/lib/apiClient";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { CryptoInfo } from "#/shared/models/crypto";
import { PersonalUserInfo } from "#/shared/models/user";
import CryptoSearch from "@/components/crypto/CryptoSearch";

const RightSidebar = () => {
    const [bsidebarVisible, setSidebarVisible] = useState<boolean>(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, userInfo } = useAuthContext();
    const [bIsGuest, setbIsGuest] = useState(true);

    const [cryptoBookmarks, setCryptoBookmarks] = useState<CryptoInfo[] | null>(null);
    const [bEditCryptoDiagVisible, setbEditCryptoDiagVisible] = useState<boolean>(false);
    const [deletingCrypto, setDeletingCrypto] = useState<CryptoInfo | null>(null);
    const [bDeleteBookmarkDiagVisible, setbDeleteBookmarkDiagVisible] = useState<boolean>(false);
    const [addedItems, setAddedItems] = useState<CryptoInfo[]>([]);
    const [cryptoUpdatedTime, setCryptoUpdatedTime] = useState<string>("");

    useEffect(() => {
        const wrapper = async () => {
          if (!user) {
            setbIsGuest(true);
          } else {
            setbIsGuest(false);
          }
        };
    
        wrapper();
      }, [user]);

       // save the updated crypto bookmarks to the backend
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

        // delete the selected crypto bookmark on the backend
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

        // update the crypto bookmarks and the updated time when the user info is fetched
        useEffect(() => {
            setCryptoBookmarks(userInfo?.userCryptoInfo.cryptoBookmarks || null);
            setAddedItems(userInfo?.userCryptoInfo.cryptoBookmarks || []);
            if (userInfo && userInfo.userCryptoInfo.cryptoBookmarks.length > 0) {
            const updatedAt = userInfo.userCryptoInfo.cryptoBookmarks[0].updatedAt;
            const cryptoUpdatedTimeString = updatedAt ? new Date(updatedAt).toLocaleString(undefined, {
                dateStyle: 'short', timeStyle: 'short', hour12: false
            }) : "";
            setCryptoUpdatedTime(cryptoUpdatedTimeString);
            }
        }, [userInfo]);


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
            <Button
                label="No"
                icon="pi pi-times"
                onClick={() => {
                setbDeleteBookmarkDiagVisible(false);
                setDeletingCrypto(null);
                }}
                className="p-button-text"
            />
            <Button label="Yes" icon="pi pi-check" onClick={handleDeletion} autoFocus />
            </div>
        );

        // header of sidebar
        const cryptoHeader = (
            <div className="flex flex-col w-full space-y-4">
                <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                            <p className="text-3xl font-bold ">Bookmarked Cryptos</p>
                </div>
            </div>
        );

        



        

    return (
        <>
           {!bIsGuest && (<Button 
                    icon ="pi pi-bitcoin text-4xl" 
                    raised 
                    className=" align-middle size-16"
                    onClick={() => setSidebarVisible(true)}

            />)
           }
            <Sidebar visible={bsidebarVisible} 
                     onHide={() => setSidebarVisible(false)}
                     position="right"
                     className=" w-full max-w-lg "  
                     header={cryptoHeader}

            >
                {  !cryptoBookmarks ?
                        (<div>Cannot fetch ._.</div>)
                    :(
                        <div className="flex w-full overflow-y-auto justify-center min-h-full">
                            <Dialog
                                header="Edit Crypto Bookmarks"
                                footer={footerElementSave}
                                visible={bEditCryptoDiagVisible}
                                className="w-[50vw] min-h-[80%]"
                                onHide={() => {
                                setbEditCryptoDiagVisible(false);
                                setAddedItems(cryptoBookmarks);
                                }}
                            >
                                <CryptoSearch
                                cryptoList={addedItems}
                                onEdit={(newItems) => {
                                    setAddedItems(newItems);
                                }}
                                />
                            </Dialog>

                            <div className="flex flex-col w-full space-y-4">
                                {/* <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                                <p className="text-3xl font-bold">Bookmarked Cryptos</p>
                                </div> */}

                                <div className="flex w-full h-fit justify-between mt-5 items-center !mb-0">
                                <div>
                                    {cryptoUpdatedTime && (<p className="text-gray-500 text-sm">Prices updated at: {cryptoUpdatedTime}</p>)}
                                    <p className="text-gray-500 text-sm">Data source:&nbsp;
                                    <a href="https://coincap.io/" target="_blank" rel="noreferrer"
                                        className="text-gray-500 hover:underline text-sm">coincap.io</a>
                                    </p>
                                </div>
                                <Button className="w-33" label="Edit List" onClick={() => setbEditCryptoDiagVisible(true)} />
                                </div>

                                {/* crypto table */}
                                <Dialog
                                footer={footerElementDelBookmark}
                                visible={bDeleteBookmarkDiagVisible}
                                onHide={() => {
                                    setbDeleteBookmarkDiagVisible(false);
                                    setDeletingCrypto(null);
                                    setAddedItems(cryptoBookmarks);
                                }}
                                >
                                <p className="text-xl ">
                                    Are you sure you want to delete{" "}
                                    <span className="font-bold">
                                    {deletingCrypto?.name} &#40;{deletingCrypto?.symbol}&#41;
                                    </span>
                                    ?
                                </p>
                                </Dialog>

                                <div className="flex w-full gap-9">
                                {cryptoBookmarks && (
                                    <div className="w-full space-y-2">
                                    {cryptoBookmarks.map((result, index) => {
                                        
                                        return(
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
                                                    className=" size-8 "
                                                />
                                            
                                            <div>
                                                <p className="text-lg text-black font-bold">{result.name}</p>
                                                <p className="text-sm text-gray-500">{result.symbol}</p>
                                            </div>

                                            
                                            </div>
                                            <div className=" flex flex-row items-center">
                                            <p className="text-lg text-black font-bold">${result.priceUsd}</p>
                                            <Button
                                                text
                                                className="`flex ml-4 items-center py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-black"
                                                icon="pi pi-trash"
                                                onClick={() => {
                                                setbDeleteBookmarkDiagVisible(true);
                                                setDeletingCrypto(result);
                                                }}
                                            />
                                            </div>
                                        </div>
                                        </Card>
                                        );
                                        })}
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>
                    )    
                }

                
                
            </Sidebar>
        </>
    )
}
export default RightSidebar;