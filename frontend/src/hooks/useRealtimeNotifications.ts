import { useEffect } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import type { Notice } from "@/lib/types";

/** Wires up live push updates (FR-13 real-time notices, plus attendance/result/fee events). */
export function useRealtimeNotifications() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const onNotice = (notice: Notice) => {
      toast(`📌 ${notice.title}`, { duration: 5000 });
      qc.invalidateQueries({ queryKey: ["notices"] });
    };
    const onAttendance = () => {
      if (user.role === "student") {
        toast("Your attendance was just updated.");
        qc.invalidateQueries({ queryKey: ["attendance"] });
      }
    };
    const onResult = () => {
      if (user.role === "student") {
        toast.success("A new result was published for you.");
        qc.invalidateQueries({ queryKey: ["results"] });
        qc.invalidateQueries({ queryKey: ["ai", "predict", "me"] });
      }
    };
    const onFee = () => {
      if (user.role === "student") {
        toast("A fee record was added to your account.");
        qc.invalidateQueries({ queryKey: ["fees"] });
      }
    };

    socket.on("notice:new", onNotice);
    socket.on("attendance:marked", onAttendance);
    socket.on("result:published", onResult);
    socket.on("fee:new", onFee);
    socket.on("fee:updated", onFee);

    return () => {
      socket.off("notice:new", onNotice);
      socket.off("attendance:marked", onAttendance);
      socket.off("result:published", onResult);
      socket.off("fee:new", onFee);
      socket.off("fee:updated", onFee);
    };
  }, [user, qc]);
}
