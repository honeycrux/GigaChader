"use client";
import { NotificationInfo } from "#/shared/models/user";
import { apiClient } from "@/lib/apiClient";
import { useAuthContext } from "@/providers/auth-provider";
import Link from "next/link";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useCallback, useEffect, useState } from "react";

type ButtonTabState = "Unread" | "Read";

function ActivityPage() {
  const { user, refreshUserInfo } = useAuthContext();
  const [selectedButton, setSelectedButton] = useState<ButtonTabState>("Unread");
  const [unreadNotif, setUnreadNotif] = useState<NotificationInfo[] | null>(null);
  const [readNotif, setReadNotif] = useState<NotificationInfo[] | null>(null);

  // get notifications from backend
  const getNotifications = useCallback(async (mode: "unread" | "read") => {
    const res = await apiClient.user.getNotifications({ query: { mode } });
    if (res.status === 200) {
      const tout = setTimeout(() => {
        apiClient.user.readNotifications({});
        clearTimeout(tout);
      }, 3000);
      return res.body;
    }
    return null;
  }, []);

  // filter read and unread notifications
  const getReadAndUnreadNotifications = useCallback(async () => {
    getNotifications("unread").then((data) => {
      setUnreadNotif(data);
    });
    getNotifications("read").then((data) => {
      setReadNotif(data);
    });
    refreshUserInfo();
  }, [getNotifications, refreshUserInfo]);

  useEffect(() => {
    getReadAndUnreadNotifications();
  }, [getReadAndUnreadNotifications]);

  // if user is logged in, show notifications
  return user ? (
    <div className="flex w-full h-full flex-col overflow-y-auto overflow-x-clip">
      <div className="mt-5 mx-12 flex justify-between">
        <p className="text-3xl font-bold">Activity</p>
        <Button label="Refresh" onClick={() => getReadAndUnreadNotifications()} />
      </div>
      <div className="mt-5">
        <div className="flex justify-between w-full">
          <Button
            className={`w-full ${selectedButton === "Unread" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Unread"
            text
            onClick={() => setSelectedButton("Unread")}
          />
          <Button
            className={`w-full ${selectedButton === "Read" ? "border-0 !border-b-2 border-orange1" : ""}`}
            label="Read"
            text
            onClick={() => setSelectedButton("Read")}
          />
        </div>
        <div className="flex w-full justify-center overflow-y-auto mt-5">
          <div className="flex flex-col w-[60%]">
            {selectedButton === "Unread" ? (
              unreadNotif ? (
                unreadNotif.length > 0 ? (
                  unreadNotif.map((notif, index) => <NotifCard key={index} {...notif} />)
                ) : (
                  <p className="text-center">No unread notification</p>
                )
              ) : (
                <p className="text-center">Not loaded yet</p>
              )
            ) : selectedButton === "Read" ? (
              readNotif ? (
                readNotif.length > 0 ? (
                  readNotif.map((notif, index) => <NotifCard key={index} {...notif} />)
                ) : (
                  <p className="text-center">No read notification</p>
                )
              ) : (
                <p className="text-center">Not loaded yet</p>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-center">Log in to see notifications</p>
  );
}

type NotifCardProps = {
  content: string;
  link: string | null;
  unread: boolean;
  createdAt: Date;
};
function NotifCard({ content, link, unread }: NotifCardProps) {
  let cardComponent = (
    <Card
      pt={{
        content: { className: "p-0" },
      }}
      className="rounded-none border-2 border-zinc-100"
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center">
          {unread ? <i className="pi pi-bell text-lg"></i> : <i className="pi pi-check text-lg"></i>}
          <div className="pl-4">
            <p className="text-base text-black"> {content} </p>
            {link && <p className="text-sm text-black font-bold">Click to view</p>}
          </div>
        </div>

        <div className="flex flex-row items-center">{unread && <i className="pi pi-circle-fill text-sm" style={{ color: "var(--primary-color)" }}></i>}</div>
      </div>
    </Card>
  );
  if (link) {
    cardComponent = <Link href={link}>{cardComponent}</Link>;
  }
  return cardComponent;
}

export default ActivityPage;
