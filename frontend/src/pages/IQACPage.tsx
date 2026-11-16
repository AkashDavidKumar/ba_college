import React from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { IqacDataProvider } from "@/lib/iqac-context";
import { IqacPublicPage } from "@/components/public/iqac-public-page";

export default function IQACPage() {
  return (
    <IqacDataProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <IqacPublicPage />
        </main>
        <Footer />
      </div>
    </IqacDataProvider>
  );
}
