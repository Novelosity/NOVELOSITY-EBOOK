"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import { getNotifications, markNotificationsRead } from "@/actions/social";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  isRead: boolean;
  createdAt: Date | null;
}

export function NotificationsBell() {
  const { isSignedIn } = useUser();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    getNotifications(10)
      .then((rows) => setNotifs(rows as Notification[]))
      .catch(() => {});
  }, [isSignedIn]);

  const unread = notifs.filter((n) => !n.isRead).length;

  const handleOpen = async (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && unread > 0) {
      await markNotificationsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 font-semibold text-sm">Notifications</div>
        <DropdownMenuSeparator />
        {notifs.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifs.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link
                href={n.href || "#"}
                className={`flex flex-col gap-0.5 px-3 py-2 cursor-pointer ${!n.isRead ? "bg-primary/5" : ""}`}
              >
                <span className="text-sm font-medium">{n.title}</span>
                {n.body && <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>}
                {n.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
