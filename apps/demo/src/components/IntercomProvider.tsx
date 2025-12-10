"use client";

import React from "react";

const INTERCOM_APP_ID = "w82ki443";

export const IntercomProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  React.useEffect(() => {
    // Standard Intercom script injection - most reliable method
    // This is the same code Intercom provides for "Code snippet" installation
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const w = window as any;
    const ic = w.Intercom;

    if (typeof ic === "function") {
      ic("reattach_activator");
      ic("update", w.intercomSettings);
    } else {
      const d = document;
      const i = function (...args: any[]) {
        i.c(args);
      } as any;
      i.q = [] as any[];
      i.c = function (args: any) {
        i.q.push(args);
      };
      w.Intercom = i;

      const l = function () {
        const s = d.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = `https://widget.intercom.io/widget/${INTERCOM_APP_ID}`;
        const x = d.getElementsByTagName("script")[0];
        if (x && x.parentNode) {
          x.parentNode.insertBefore(s, x);
        } else {
          d.head.appendChild(s);
        }
      };

      if (document.readyState === "complete") {
        l();
      } else if (w.attachEvent) {
        w.attachEvent("onload", l);
      } else {
        w.addEventListener("load", l, false);
      }
    }

    // Boot Intercom
    w.Intercom("boot", {
      api_base: "https://api-iam.intercom.io",
      app_id: INTERCOM_APP_ID,
    });

    // Cleanup on unmount - don't shutdown to prevent widget disappearing
    return () => {
      // Intentionally not calling shutdown to keep widget visible during navigation
    };
  }, []);

  return <>{children}</>;
};
