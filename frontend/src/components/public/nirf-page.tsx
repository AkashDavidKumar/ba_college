"use client";
import { ChevronRight, Award, Shield, Download, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/site/primitives";

const NIRF_DATA = [
  { year: "2024", rank: "Submitted", score: "—", category: "College" },
  { year: "2023", rank: "Submitted", score: "—", category: "College" },
  { year: "2022", rank: "Participated", score: "—", category: "College" },
];

const NIRF_PARAMETERS = [
  { name: "Teaching, Learning & Resources (TLR)", weight: "30%", desc: "Faculty-student ratio, research publications, expenditure on academics" },
  { name: "Research and Professional Practice (RP)", weight: "30%", desc: "Research projects, patents, conference papers, professional practice" },
  { name: "Graduation Outcomes (GO)", weight: "20%", desc: "PhD graduates, placement, higher studies, median salary" },
  { name: "Outreach and Inclusivity (OI)", weight: "10%", desc: "Regional diversity, gender diversity, economically disadvantaged" },
  { name: "Perception (PR)", weight: "10%", desc: "Academic peer review, employer perception" },
];

export function NirfPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-navy-dark text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark to-navy/80" />
        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span><ChevronRight className="w-3 h-3" /><span className="text-gold-light">NIRF</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">NIRF Ranking</h1>
          <p className="text-white/70">National Institutional Ranking Framework — Bishop Ambrose College's participation and data.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* What is NIRF */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-light flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-gold-dark" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy mb-3">About NIRF</h2>
              <div className="space-y-3 text-slate-600">
                <p>The National Institutional Ranking Framework (NIRF) was approved by the Ministry of Education, Government of India, and was launched by the Honourable Minister of Education in September 2015. The methodology draws from the overall recommendations broad by a Core Committee set up by the Ministry of Education (MoE), Government of India, to identify the broad parameters for ranking various universities and institutions.</p>
                <p>Bishop Ambrose College actively participates in NIRF and has submitted data for ranking in the "College" category. Our participation reflects our commitment to transparency, accountability, and continuous improvement in institutional quality.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BAC NIRF Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="bg-navy px-6 py-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold-light" />
            <h3 className="text-white font-bold">BAC NIRF Participation</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {NIRF_DATA.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="font-semibold text-navy">NIRF {d.year}</p>
                  <p className="text-xs text-slate-500">Category: {d.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 font-semibold rounded-full">{d.rank}</span>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-dark transition-colors">
                    <Download className="w-3.5 h-3.5" /> Data
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8">
          <h3 className="text-xl font-bold text-navy mb-6">NIRF Ranking Parameters</h3>
          <div className="space-y-4">
            {NIRF_PARAMETERS.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100/70 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-navy text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold leading-tight">{p.weight}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm mb-0.5">{p.name}</p>
                    <p className="text-xs text-slate-600">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a href="https://www.nirfindia.org" target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-dark transition-colors">
            <ExternalLink className="w-4 h-4" /> Visit NIRF Website
          </a>
          <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-navy text-navy font-semibold rounded-xl hover:bg-navy hover:text-white transition-colors">
            <Download className="w-4 h-4" /> Download NIRF Data Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
