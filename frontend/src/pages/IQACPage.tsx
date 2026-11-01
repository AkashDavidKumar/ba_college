import React from "react";
import { NavProvider } from "@/components/site/nav-context";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { IqacDataProvider } from "@/lib/iqac-context";
import { IqacPageContent } from "@/components/iqac/iqac-page-content";

export default function IQACPage() {
  return (
    <NavProvider>
      <IqacDataProvider>
        <div className="min-h-screen flex flex-col bg-[#F5FBF6]">
          <Header />
          <main className="flex-1">
            <IqacPageContent />
          </main>
          <Footer />
        </div>
      </IqacDataProvider>
    </NavProvider>
  );
}
