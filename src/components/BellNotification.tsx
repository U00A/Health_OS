"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Bell, X, Check, AlertTriangle, FileText, Pill } from "lucide-react";
import { Chip, Spinner } from "@heroui/react";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";
import { useState, useRef, useEffect } from "react";

export function BellNotification() {
  const betterAuthId = useBetterAuthId();
  const notifications = useQuery(
    api.notifications.getMyNotifications,
    betterAuthId ? { betterAuthId, unread_only: false } : "skip"
  );
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    betterAuthId ? { betterAuthId } : "skip"
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const acknowledgeEscalation = useMutation(api.notifications.acknowledgeEscalation);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unread = notifications?.filter((n) => !n.is_read) || [];
  const read = notifications?.filter((n) => n.is_read) || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "lab_result_arrived":
        return <FileText size={16} className="text-violet-500" />;
      case "prescription_written":
        return <Pill size={16} className="text-emerald-500" />;
      case "escalation":
      case "signal_flag":
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return <Bell size={16} className="text-slate-500" />;
    }
  };

  const handleMarkRead = async (id: Id<"notifications">) => {
    if (!betterAuthId) return;
    try {
      await markAsRead({ betterAuthId, notification_id: id });
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  };

  const handleMarkAllRead = async () => {
    if (!betterAuthId) return;
    try {
      await markAllAsRead({ betterAuthId });
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const handleAcknowledge = async (id: Id<"notifications">) => {
    if (!betterAuthId) return;
    try {
      await acknowledgeEscalation({ betterAuthId, notification_id: id });
    } catch (e) {
      console.error("Failed to acknowledge:", e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {unread.length > 0 && (
              <button
                onClick={() => { handleMarkAllRead(); setIsOpen(false); }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[28rem] overflow-y-auto divide-y divide-slate-100">
            {notifications === undefined ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Spinner size="sm" />
                <span className="ml-2 text-sm font-medium">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Bell size={32} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No notifications</p>
              </div>
            ) : (
              <>
                {/* Unread first */}
                {unread.map((n) => (
                  <div
                    key={n._id}
                    className="px-4 py-3 hover:bg-slate-50 transition-colors bg-blue-50/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getIcon(n.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                          {n.requires_acknowledgment && (
                            <Chip size="sm" color="danger" variant="soft" className="text-[9px] font-black uppercase">
                              Requires Ack
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                        {n.patientName && (
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Patient: {n.patientName}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col gap-1">
                        {n.requires_acknowledgment && !n.acknowledged_at ? (
                          <button
                            onClick={() => handleAcknowledge(n._id)}
                            className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Acknowledge"
                          >
                            <Check size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkRead(n._id)}
                            className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            title="Mark as read"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Read notifications */}
                {read.map((n) => (
                  <div
                    key={n._id}
                    className="px-4 py-3 hover:bg-slate-50/50 transition-colors opacity-70"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 opacity-50">
                        {getIcon(n.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500">{n.message}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
