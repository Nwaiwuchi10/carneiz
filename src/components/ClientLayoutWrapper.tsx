"use client";

import { usePathname } from "next/navigation";
import React from "react";
import CartDrawer from "./CartDrawer";
import FloatingWhatsApp from "./FloatingWhatsApp";

export default function ClientLayoutWrapper({
  children,
  navbar,
  footer,
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && navbar}
      <main className={isAdmin ? "" : "flex-grow"}>{children}</main>
      {!isAdmin && footer}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <FloatingWhatsApp />}
    </>
  );
}
