"use client";
import { apiClient } from "@/lib/apiClient";
import { Button } from "primereact/button";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import CryptoSearch from "./CryptoSearch";
import { useAuthContext } from "@/providers/auth-provider";
import { PersonalUserInfo } from "#/shared/models/user";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";

type Props = {
  bEditFlexfolioDiagVisible: boolean;
  onExit: () => void;
  onSave?: Function;
};

type CryptoHoldingList = PersonalUserInfo["userCryptoInfo"]["cryptoHoldings"];
type ButtonTabState = "Own" | "All";

const FlexfolioEdit = ({ bEditFlexfolioDiagVisible, onExit, onSave }: Props) => {
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
        if (onSave) {
          onSave();
        }
      }
    }
  };

  useEffect(() => {
    setCryptoHoldings(userInfo?.userCryptoInfo.cryptoHoldings || null);
    setAddedItems(userInfo?.userCryptoInfo.cryptoHoldings || []);
  }, [userInfo]);

  const footerElementFlexfolio = (
    <div className="flex mt-4 space-x-2 items-center justify-end">
      <span className="text-gray-500">Click on amount to edit</span>
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

  // const isPositiveInteger = (val: any) => {
  //   let str = String(val);

  //   str = str.trim();

  //   if (!str) {
  //     return false;
  //   }

  //   str = str.replace(/^0+/, '') || '0';
  //   let n = Math.floor(Number(str));

  //   return n !== Infinity && String(n) === str && n >= 0;
  // };

  const amountCellEditor = (editInput: ColumnEditorOptions) => {
    return (
      <div className="max-w-full">
        <InputNumber
          value={editInput.value}
          onValueChange={(e: InputNumberValueChangeEvent) => editInput.editorCallback && editInput.editorCallback(e.value)}
          onKeyDown={(e) => e.stopPropagation()}
          min={0}
          allowEmpty={false}
          maxFractionDigits={20}
        />
      </div>
    );
  };

  // const amountCellEditComplete = (e: ColumnEvent) => {
  //   let { rowData, newValue, field, originalEvent: event } = e;
  //   if (isPositiveInteger(newValue)) {
  //     rowData[field] = newValue;
  //   } else {
  //     event.preventDefault();
  //   }
  //   console.log(addedItems);
  // };

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
          // addedItems.map((item, index) => (
          //   <div key={index}>
          //     {item.crypto.name} {"("}
          //     {item.crypto.symbol}
          //     {")"} x{item.amount}
          //   </div>
          // ))
          <DataTable value={addedItems} className="w-full">
            <Column field="crypto.name" header="Name"></Column>
            <Column field="crypto.symbol" header="Symbol"></Column>
            <Column field="amount" header="Amount"
              editor={(editInput) => amountCellEditor(editInput)}
              // onCellEditComplete={amountCellEditComplete}
            ></Column>
          </DataTable>
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
