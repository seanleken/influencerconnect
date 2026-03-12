"use client";

import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher-client";

interface NotificationPayload {
  type: string;
  title: string;
  conversationId?: string;
  linkUrl?: string;
}

export function useNotifications(
  userId: string,
  onNotification?: (payload: NotificationPayload) => void,
) {
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`user-${userId}-notifications`);

    channel.bind("new-notification", (data: NotificationPayload) => {
      onNotification?.(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${userId}-notifications`);
    };
  }, [userId, onNotification]);
}
