'use client';
import { PersonalUserInfo } from "#/shared/models/user";
import { apiClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { Card } from 'primereact/card';
import Link from 'next/link';
import { Dialog } from "primereact/dialog";
import { InputText } from 'primereact/inputtext';

type Props = {
    symbol: string
}

async function getUserInfo() {
  const { body, status } = await apiClient.user.getInfo();
  if (!(status === 200)) {
    return null;
  }
    return body;
}

function Crypto ({symbol} : Props) {
    const {user} = useAuthContext();
    const [userInfo, setUserInfo] = useState<PersonalUserInfo | null>(null)
    const [bEditCryptoDiagVisible, setbEditCryptoDiagVisible] = useState<boolean>(false);

    useEffect(() => {
        const wrapper = async () => {
            const response = await getUserInfo();
            console.log(response)
            setUserInfo(response);
        };

        wrapper();
    }, [user]);

    if (!user) {
        return <div>Go back to login</div>;
    }

    if (!userInfo) {
        return <div>Cannot fetch ._.</div>;
    }

    const cryptoBookmarks = userInfo.userCryptoInfo.cryptoBookmarks;

    
   {/*  const handleSaveCrypto = async () => {
        const res = await apiClient.user.userConfig({ body: { displayName: editDisplayName, bio: editBio } });
        console.log(res);
        const userinfo_fetched = await getUserInfo();
        if ("error" in userinfo_fetched) {
          console.log("Your own profile requested not found");
        } else {
          setUserinfo(userinfo_fetched);
          setEditDisplayName(userinfo_fetched.userConfig.displayName);
          setEditBio(userinfo_fetched.userConfig.bio);
        }
        setbEditCryptoDiagVisible(false);
      }
      */}

    const footerElement = (
        <div>
          <Button label="Save" icon="pi pi-check" />
        </div>
      );

      {/* onClick={handleSaveCrypto} */}

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
                        
                        className="pl-10 pr-10 font-medium center w-full"
                        placeholder="Search User"
                  
                    />
                    {/*  ref={inputRef} */}
                    {/*  onChange={(e) => {
                        handleSearch(e.target.value);
                        }}
                        defaultValue={searchParams.get('query')?.toString()} */}
            </div>
            <div className="flex w-full gap-9">
                {userInfo && (
                <div className='w-full space-y-2'>
               
                {cryptoBookmarks.map((result, index) => (
                <Card key={index} {...result}
                pt={{
                    content: {className: 'p-0'}
                }}>
                    <div className='flex justify-between items-center'>
                        <div>
                            <p className='text-lg text-black font-bold'>{result.name}</p>
                            <p className='text-sm text-gray-500'>{result.symbol}</p>
                        </div>
                        
                        <p className='text-lg text-black font-bold'>{result.priceUsd}</p>
                        <Button 
                            className="`flex items-center py-2 px-7 rounded-lg 
                                        ${selectedButton === 'User management' ? 'bg-orange1 text-white' : ' text-black'}`" 
                            icon="pi pi-plus"
                        />
                    </div>
                </Card>
                ))}
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
                <Button className="w-36" label="Edit List" onClick={() => setbEditCryptoDiagVisible(true)}/>
            </div>

            {/* crypto table */}

            
            <div className="flex w-full gap-9">
                {userInfo && (
                <div className='w-full space-y-2'>
               
                {cryptoBookmarks.map((result, index) => (
                <Card key={index} {...result}
                pt={{
                    content: {className: 'p-0'}
                }}>
                    <div className='flex justify-between items-center'>
                    <div>
                        <p className='text-lg text-black font-bold'>{result.name}</p>
                        <p className='text-sm text-gray-500'>{result.symbol}</p>
                    </div>
                    
                     <p className='text-lg text-black font-bold'>{result.priceUsd}</p>
                    
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
