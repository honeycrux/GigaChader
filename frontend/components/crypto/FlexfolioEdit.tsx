"use client";
import { apiClient } from "@/lib/apiClient";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { CryptoInfo } from "#/shared/models/crypto";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import CryptoEdit from "./CryptoSearch";
import { useAuthContext } from "@/providers/auth-provider";
import { PersonalUserInfo } from "#/shared/models/user";


async function getCryptoInfo(query: string) {
    const { body, status } = await apiClient.crypto.cryptoSearch({ query: { query: query, limit: 20 } });
    if (!(status === 200)) {
      return null;
    }
    return body;
  }

type Props = {
    bEditFlexfolioDiagVisible: boolean;
    onExit: () => void;
}

type CryptoHoldingList = PersonalUserInfo["userCryptoInfo"]["cryptoHoldings"]

const FlexfolioEdit = ({bEditFlexfolioDiagVisible, onExit} : Props) => {
    const {userInfo} = useAuthContext();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [bAmountDiagVisible, setbAmountDiagVisible] = useState<boolean>(false);
    const [selectedButtonEdit, setSelectedButtonEdit] = useState("Own");
    const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHoldingList | null>(null);
    const [addedItems, setAddedItems] = useState<CryptoHoldingList>([]);


    const saveCryptoHoldings = async () => {
        await apiClient.user.userConfig({body: {cryptoHoldings: addedItems.map((holding) => {
            return {
                cryptoId: holding.crypto.cryptoId,
                amount: holding.amount
            }
        })}});
    }

    useEffect(() => {
      setCryptoHoldings(userInfo?.userCryptoInfo.cryptoHoldings || null);
      setAddedItems(userInfo?.userCryptoInfo.cryptoHoldings || []);
    }, [userInfo]);

      const footerElementFlexfolio = (
        <div className="mt-4">
          <Button label="Save" icon="pi pi-check" onClick={()=>{
            saveCryptoHoldings();
            onExit();
          }} />
        </div>
      );

      if (!cryptoHoldings) {
        return <div>Cannot fetch ._.</div>;
      }

    return (
        <div>

            <Dialog 
                header="Edit Flexfolio"
                footer={footerElementFlexfolio}
                visible={bEditFlexfolioDiagVisible}
                className="w-[50vw] min-h-[80%]"
                onHide={() => {
                    setAddedItems(cryptoHoldings);
                    onExit();
                }}
                >
                    <div className="flex justify-between w-full">
                    <Button
                        className={`w-full ${selectedButtonEdit === "Own" ? "border-0 !border-b-2 border-orange1" : ""}`}
                        label="Owned Crypto"
                        text
                        onClick={() => setSelectedButtonEdit("Own")}
                    />
                    <Button
                        className={`w-full ${selectedButtonEdit === "All" ? "border-0 !border-b-2 border-orange1" : ""}`}
                        label="Search Crypto"
                        text
                        onClick={() => setSelectedButtonEdit("All")}
                    />
                    </div>
                    {selectedButtonEdit === "Own" ?(
                        addedItems.map((item, index) => (
                            <div key={index}>{item.crypto.name} {"("}{item.crypto.symbol}{")"} x{item.amount}</div>
                        ))
                    ) 
                    :selectedButtonEdit === "All" ?(
                        <CryptoEdit cryptoList={addedItems.map((item) => item.crypto)} onEdit={(newItems) => {
                            const newHoldingList = newItems.map((crypto) => {
                                const foundHolding = addedItems.find((holding) => {
                                    holding.crypto.cryptoId = crypto.cryptoId;
                                });
                                if (foundHolding) {
                                    return foundHolding;
                                }
                                return {
                                    crypto: crypto,
                                    amount: 0
                                }
                            });
                            setAddedItems(newHoldingList);
                        }} />
                    ): null}


                </Dialog>
            {/* pop-up amount input */}
            {/* <Dialog 
                header="Edit Crypto Bookmarks"
                footer={footerElementAmount}
                visible={bAmountDiagVisible}
                onHide={() => setbAmountDiagVisible(false)}
            >

            </Dialog> */}
            {/* end */}

        </div>
    );
};

export default FlexfolioEdit;


