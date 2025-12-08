"use client";

import React from "react";
import Intercom from "@intercom/messenger-js-sdk";

export const IntercomProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  React.useEffect(() => {
    Intercom({
      app_id: "w82ki443",
    });
  }, []);

  return <div>{children}</div>;
};
