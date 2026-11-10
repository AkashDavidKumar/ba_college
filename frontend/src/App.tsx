import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SiteDataProvider } from "@/lib/site-context";
import { ThemeProvider } from "@/lib/theme-context";
import { CMSStoreProvider } from "@/lib/cms-store";
import { NavProvider } from "@/components/site/nav-context";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import IQACPage from "@/pages/IQACPage";

// Lazy-load heavy administrative modules to optimize initial public bundle size
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-300 font-medium">Loading Bishop Ambrose Admin Portal...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SiteDataProvider>
        <CMSStoreProvider>
          <BrowserRouter>
            <NavProvider>
              <Routes>
                {/* ── Public Section Routes ───────────────────────────────── */}
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/about" element={<HomePage />} />
                <Route path="/departments" element={<HomePage />} />
                <Route path="/departments/:slug" element={<HomePage />} />
                <Route path="/courses" element={<HomePage />} />
                <Route path="/academic" element={<HomePage />} />
                <Route path="/academic/:section" element={<HomePage />} />
                <Route path="/admissions" element={<HomePage />} />
                <Route path="/events" element={<HomePage />} />
                <Route path="/news" element={<HomePage />} />
                <Route path="/notices" element={<HomePage />} />
                <Route path="/examination" element={<HomePage />} />
                <Route path="/examinations" element={<HomePage />} />
                <Route path="/autonomous" element={<HomePage />} />
                <Route path="/library" element={<HomePage />} />
                <Route path="/nirf" element={<HomePage />} />
                <Route path="/alumni" element={<HomePage />} />
                <Route path="/contact" element={<HomePage />} />
                <Route path="/facilities" element={<HomePage />} />
                <Route path="/gallery" element={<HomePage />} />
                <Route path="/placements" element={<HomePage />} />
                <Route path="/clubs" element={<HomePage />} />
                <Route path="/clubs/:slug" element={<HomePage />} />
                <Route path="/student-activities" element={<HomePage />} />
                <Route path="/student-activities/:section" element={<HomePage />} />

                {/* ── Dedicated Institutional IQAC Dossier ────────────────── */}
                <Route path="/iqac" element={<IQACPage />} />

                {/* ── Lazy-Loaded Admin Portal ───────────────────────────── */}
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <AdminPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin/login"
                  element={
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <AdminLoginPage />
                    </Suspense>
                  }
                />

                {/* ── Catch-All 404 Route (Handled in HomePage Layout) ───── */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </NavProvider>
          </BrowserRouter>
          <Toaster />
        </CMSStoreProvider>
      </SiteDataProvider>
    </ThemeProvider>
  );
}
