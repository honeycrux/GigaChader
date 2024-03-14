"use client";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Calendar } from "primereact/calendar";
import { useState, useRef } from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast>(null);

  const accept = () => {
    if (toast.current) {
      toast.current.show({
        severity: "info",
        summary: "Confirmed",
        detail: "You have accepted",
        life: 3000,
      });
    }
  };

  const reject = () => {
    if (toast.current) {
      toast.current.show({
        severity: "warn",
        summary: "Rejected",
        detail: "You have rejected",
        life: 3000,
      });
    }
  };

  return (
    <>
      <Calendar value={date} onChange={(e) => {
        if (e.value) {
          setDate(e.value)
        }
      }} />
      <Toast ref={toast} />
      <ConfirmDialog
        // group="declarative"
        visible={visible}
        onHide={() => setVisible(false)}
        message="Are you sure you want to proceed?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={accept}
        reject={reject}
      />
      <div className="card flex justify-content-center">
        <Button
          onClick={() => setVisible(true)}
          icon="pi pi-check"
          label="Confirm"
        />
      </div>
    </>
  );
}
