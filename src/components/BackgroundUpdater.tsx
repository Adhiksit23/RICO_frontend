"use client";

import { useEffect } from "react";
import { MonitorService } from "@/services";


export default function BackgroundUpdater() {
  useEffect(() => {
    const update = async () => {
      try {
        await MonitorService.update();
      } catch (err) {
        console.warn("Background update error:", err);
      }
    };


    // Run once immediately
    update();

    // Then every minute
    const interval = setInterval(update, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
