"use client";

import React from "react";

const INTERCOM_APP_ID = "w82ki443";

export const IntercomProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  React.useEffect(() => {
    // Standard Intercom script injection - compatible with all browsers including Safari
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const w = window as any;

    // Set up intercomSettings first for Safari compatibility
    w.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: INTERCOM_APP_ID,
    };

    // Check if Intercom is already loaded
    if (typeof w.Intercom === "function") {
      w.Intercom("reattach_activator");
      w.Intercom("update", w.intercomSettings);
    } else {
      // Create Intercom function placeholder
      const intercomPlaceholder = function (...args: any[]) {
        intercomPlaceholder.c(args);
      } as any;
      intercomPlaceholder.q = [] as any[];
      intercomPlaceholder.c = function (args: any) {
        intercomPlaceholder.q.push(args);
      };
      w.Intercom = intercomPlaceholder;

      // Load Intercom script - Safari compatible approach
      const loadScript = () => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.crossOrigin = "anonymous"; // Better CORS handling for Safari
        script.src = `https://widget.intercom.io/widget/${INTERCOM_APP_ID}`;

        // Error handling for script loading
        script.onerror = () => {
          console.warn("Intercom script failed to load");
        };

        // Insert script - Safari compatible method
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          document.head.appendChild(script);
        }
      };

      // Use modern event listener only (attachEvent is IE-only, not Safari compatible)
      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        // Document already loaded, load script immediately but with a small delay for Safari
        setTimeout(loadScript, 0);
      } else {
        // Wait for DOM to be ready
        document.addEventListener("DOMContentLoaded", loadScript, false);
      }
    }

    // Boot Intercom after a small delay to ensure script is ready
    // This timeout helps with Safari's stricter script loading
    const bootTimeout = setTimeout(() => {
      if (typeof w.Intercom === "function") {
        w.Intercom("boot", {
          api_base: "https://api-iam.intercom.io",
          app_id: INTERCOM_APP_ID,
        });
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(bootTimeout);
    };
  }, []);

  return <>{children}</>;
};
