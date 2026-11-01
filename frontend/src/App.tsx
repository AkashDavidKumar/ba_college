import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SiteDataProvider } from "@/lib/site-context";
import { ThemeProvider } from "@/lib/theme-context";
import { CMSStoreProvider } from "@/lib/cms-store";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import IQACPage from "@/pages/IQACPage";
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLoginPage";

export default function App() {
  return (
    <ThemeProvider>
      <SiteDataProvider>
        <CMSStoreProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/iqac" element={<IQACPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </CMSStoreProvider>
      </SiteDataProvider>
    </ThemeProvider>
  );
}
