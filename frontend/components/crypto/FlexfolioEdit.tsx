"use client";
import { apiClient } from "@/lib/apiClient";
import { Button } from "primereact/button";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import CryptoSearch from "./CryptoSearch";
import { useAuthContext } from "@/providers/auth-provider";
import { PersonalUserInfo } from "#/shared/models/user";

type Props = {
  bEditFlexfolioDiagVisible: boolean;
  onExit: () => void;
};

type CryptoHoldingList = PersonalUserInfo["userCryptoInfo"]["cryptoHoldings"];
type ButtonTabState = "Own" | "All";

const FlexfolioEdit = ({ bEditFlexfolioDiagVisible, onExit }: Props) => {
  const { userInfo } = useAuthContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [bAmountDiagVisible, setbAmountDiagVisible] = useState<boolean>(false);
  const [selectedButtonEdit, setSelectedButtonEdit] = useState<ButtonTabState>("Own");
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHoldingList | null>(null);
  const [addedItems, setAddedItems] = useState<CryptoHoldingList>([]);

  const saveCryptoHoldings = async () => {
    const res = await apiClient.user.userConfig({
      body: {
        cryptoHoldings: addedItems.map((holding) => {
          return {
            cryptoId: holding.crypto.cryptoId,
            amount: holding.amount,
          };
        }),
      },
    });
    console.log(res);
    if (res.status === 200 && res.body) {
      if (res.body.userCryptoInfo.cryptoHoldings) {
        const newCryptoHoldings: CryptoHoldingList = [];
        for (const holding of res.body.userCryptoInfo.cryptoHoldings) {
          const { crypto, ...rest } = holding;
          if (crypto) {
            newCryptoHoldings.push({ crypto, ...rest });
          }
        }
        setCryptoHoldings(newCryptoHoldings);
        setAddedItems(newCryptoHoldings);
      }
    }
  };

  useEffect(() => {
    setCryptoHoldings(userInfo?.userCryptoInfo.cryptoHoldings || null);
    setAddedItems(userInfo?.userCryptoInfo.cryptoHoldings || []);
  }, [userInfo]);

  const footerElementFlexfolio = (
    <div className="mt-4">
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={() => {
          saveCryptoHoldings();
          onExit();
          setSelectedButtonEdit("Own");
        }}
      />
    </div>
  );

  if (!cryptoHoldings) {
    return <div>Cannot fetch ._.</div>;
  }

  const cryptoInHoldings = addedItems.map((holding) => holding.crypto);

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
          setSelectedButtonEdit("Own");
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
        {selectedButtonEdit === "Own" ? (
          addedItems.map((item, index) => (
            <div key={index}>
              {item.crypto.name} {"("}
              {item.crypto.symbol}
              {")"} x{item.amount}
            </div>
          ))
        ) : selectedButtonEdit === "All" ? (
          <CryptoSearch
            cryptoList={cryptoInHoldings}
            onEdit={(newItems) => {
              const newHoldingList = newItems.map((crypto) => {
                const foundHolding = addedItems.find((holding) => {
                  return holding.crypto.cryptoId == crypto.cryptoId;
                });
                if (foundHolding) {
                  return foundHolding;
                }
                return {
                  crypto: crypto,
                  amount: 0,
                };
              });
              setAddedItems(newHoldingList);
            }}
          />
        ) : null}
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
