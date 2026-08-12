"use client";

import { useEffect } from "react";
import { MonitorService } from "@/services";


export default function BackgroundUpdater() {
  useEffect(() => {
    const update_IOT = async () => {
      try {
        await MonitorService.update_IOT();
      } catch (err) {
        console.warn("Background IOT update error:", err);
      }
    };

    const update = async () => {
      try {
        await MonitorService.update();
      } catch (err) {
        console.warn("Background update error:", err);
      }
    };


    // Run once immediately
    update_IOT();

    // Then every minute
    const interval = setInterval(update_IOT, 60000);
    
    // // Then every 1 minute
    // const interval_1 = setInterval(update, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
