"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1")}=([^;]*)`,
    ),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken =
        localStorage.getItem("accessToken") || getCookie("accessToken");

      if (!accessToken) {
        router.replace("/login");
        return;
      }

      setAuthorized(true);
    };

    checkAuth();
  }, [router]);

  if (authorized === null) {
    return null;
  }

  return <>{children}</>;
}
