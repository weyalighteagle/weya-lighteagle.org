"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LiveAvatarDemo } from "@/src/components/LiveAvatarDemo";

export default function WeyaLivePage() {
  const router = useRouter();

  useEffect(() => {
    // farklı URL’ye zorla yönlendir
    if (window.location.pathname !== "/weya-live") {
      router.replace("/weya-live");
    }
  }, [router]);

  return <LiveAvatarDemo persona="weya_live" />;
}
