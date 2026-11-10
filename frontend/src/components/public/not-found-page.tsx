import React from "react";
import { useNav } from "@/components/site/nav-context";
import { ArrowLeft, Home, Compass, Search, BookOpen, Building2, Phone } from "lucide-react";
import { motion } from "framer-motion";

export function NotFoundPage({ path }: { path?: string }) {
  const { goHome, goAbout, goAcademic, goAdmissions, goContact } = useNav();

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 text-slate-800 mb-2 shadow-inner">
          <Compass className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          404 — Page Not Found
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
          The requested page <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">{path || "unknown"}</span> could not be found or has been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={goHome}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-400" />
            Return to Homepage
          </button>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Popular College Sections
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-sm">
            <button
              onClick={() => goAbout()}
              className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-700" />
              About Us
            </button>
            <button
              onClick={() => goAcademic("courses")}
              className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-700" />
              Courses Offered
            </button>
            <button
              onClick={() => goAdmissions()}
              className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-700" />
              Admissions
            </button>
            <button
              onClick={() => goContact()}
              className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-slate-700" />
              Contact Us
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
