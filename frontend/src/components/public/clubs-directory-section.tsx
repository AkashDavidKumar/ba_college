"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clubService } from "@/lib/api/club-service";
import {
  PublicClub,
  PublicClubMember,
  ClubCategory,
  CLUB_CATEGORIES,
} from "@/types/club";
import { ApiError } from "@/lib/api-client";
import {
  Users,
  Award,
  Calendar,
  MapPin,
  Mail,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  ArrowRight,
  UserCheck,
  Lock,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

export function ClubsDirectorySection() {
  // Directory state
  const [clubs, setClubs] = useState<PublicClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Club Profile Drawer/Modal
  const [selectedClub, setSelectedClub] = useState<PublicClub | null>(null);
  const [roster, setRoster] = useState<PublicClubMember[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  // Registration Modal
  const [registeringClub, setRegisteringClub] = useState<PublicClub | null>(null);
  const [regForm, setRegForm] = useState({
    studentName: "",
    registerNumber: "",
    departmentId: "computer-science",
    degree: "B.Sc Computer Science",
    yearOfStudy: 1,
    personalEmail: "",
    phoneNumber: "",
    reasonForJoining: "",
    confirmPublicDirectoryConsent: false,
  });
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessData, setRegSuccessData] = useState<Record<string, unknown> | null>(null);

  // Consent Withdrawal Dialog
  const [isConsentWithdrawalOpen, setIsConsentWithdrawalOpen] = useState(false);
  const [withdrawSlug, setWithdrawSlug] = useState("");
  const [withdrawRegisterNumber, setWithdrawRegisterNumber] = useState("");
  const [withdrawEmail, setWithdrawEmail] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<string | null>(null);

  // ── Fetch Clubs Directory ───────────────────────────────────────────────────
  const fetchClubs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clubService.getPublicDirectory({
        category: selectedCategory,
        search: searchQuery,
      });
      setClubs(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Unable to load student clubs at this time.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  // ── Fetch Roster When Profile Opened ────────────────────────────────────────
  useEffect(() => {
    if (!selectedClub) {
      setRoster([]);
      setRosterError(null);
      return;
    }
    let isCancelled = false;
    const fetchRoster = async () => {
      setIsLoadingRoster(true);
      setRosterError(null);
      try {
        const res = await clubService.getPublicRoster(selectedClub.slug);
        if (!isCancelled) {
          setRoster(res.data || []);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof ApiError ? err.message : "Unable to load public member roster.";
          setRosterError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRoster(false);
        }
      }
    };
    fetchRoster();
    return () => {
      isCancelled = true;
    };
  }, [selectedClub]);

  // ── Handle Membership Registration Submit ───────────────────────────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringClub) return;

    // Validate year of study strictly between 1 and 4
    if (regForm.yearOfStudy < 1 || regForm.yearOfStudy > 4) {
      setRegError("Year of study must be between 1 and 4.");
      return;
    }

    setIsSubmittingReg(true);
    setRegError(null);
    try {
      const res = await clubService.registerMembership(registeringClub.slug, {
        studentName: regForm.studentName.trim(),
        registerNumber: regForm.registerNumber.toUpperCase().trim(),
        departmentId: regForm.departmentId.trim().toLowerCase(),
        degree: regForm.degree.trim(),
        yearOfStudy: Number(regForm.yearOfStudy),
        personalEmail: regForm.personalEmail.toLowerCase().trim(),
        phoneNumber: regForm.phoneNumber.trim(),
        reasonForJoining: regForm.reasonForJoining.trim() || undefined,
        confirmPublicDirectoryConsent: Boolean(regForm.confirmPublicDirectoryConsent),
      });

      setRegSuccessData(res.data || { submittedAt: new Date().toISOString() });
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to submit membership application.";
      setRegError(msg);
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleResetRegForm = () => {
    setRegisteringClub(null);
    setRegSuccessData(null);
    setRegError(null);
    setRegForm({
      studentName: "",
      registerNumber: "",
      departmentId: "computer-science",
      degree: "B.Sc Computer Science",
      yearOfStudy: 1,
      personalEmail: "",
      phoneNumber: "",
      reasonForJoining: "",
      confirmPublicDirectoryConsent: false,
    });
  };

  // ── Handle Consent Withdrawal Submit ────────────────────────────────────────
  const handleConsentWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawSlug || !withdrawRegisterNumber.trim() || !withdrawEmail.trim()) {
      return;
    }
    setIsSubmittingWithdraw(true);
    setWithdrawResult(null);
    try {
      await clubService.withdrawConsent(withdrawSlug, {
        registerNumber: withdrawRegisterNumber.toUpperCase().trim(),
        personalEmail: withdrawEmail.toLowerCase().trim(),
      });
      setWithdrawResult(
        "Request processed. If an active membership with affirmative consent matches the provided register number and email, public directory consent has been securely withdrawn."
      );
    } catch (_) {
      // Generic anti-enumeration response on network/server errors
      setWithdrawResult(
        "Request processed. If an active membership with affirmative consent matches the provided register number and email, public directory consent has been securely withdrawn."
      );
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Section Introduction ──────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Student Life & Co-Curriculars
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">
              Campus Clubs & Committees
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Explore Bishop Ambrose College's vibrant student-led organizations. From technology and arts to social service and leadership, discover where your passions thrive.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConsentWithdrawalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-navy bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              Directory Privacy & Consent
            </button>
            <button
              onClick={fetchClubs}
              className="p-2 text-slate-500 hover:text-navy bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              title="Refresh Clubs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Search & Filter Controls ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === "All"
                  ? "bg-navy text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Clubs
            </button>
            {CLUB_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-navy text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clubs or coordinators..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Clubs Cards Grid ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 animate-pulse">
              <div className="h-44 bg-slate-100 rounded-2xl" />
              <div className="h-5 bg-slate-100 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-8 border border-rose-100 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Failed to Load Clubs</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchClubs}
            className="px-4 py-2 text-xs font-semibold bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      ) : clubs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Clubs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No published clubs match your current search or category filter. Try clearing filters to see all campus organizations.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="px-4 py-2 text-xs font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-lg border border-slate-100 transition-all flex flex-col"
            >
              {/* Cover Banner */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={c.bannerImage || c.logoUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-amber-900 bg-white/95 px-2 py-0.5 rounded-full shadow-xs">
                    {c.code}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs ${
                      c.isRecruiting
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700/80 text-white/90"
                    }`}
                  >
                    {c.isRecruiting ? "Open for Recruitment" : "Recruitment Closed"}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                    {c.category}
                  </span>
                  <h3 className="text-white font-bold text-base leading-snug line-clamp-1">{c.name}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Coordinator: <strong className="text-slate-700 font-medium">{c.facultyCoordinator}</strong></span>
                  </div>
                  {c.meetingSchedule && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{c.meetingSchedule}</span>
                    </div>
                  )}
                  {c.roomOrVenue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{c.roomOrVenue}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedClub(c)}
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors text-center"
                  >
                    View Profile
                  </button>
                  {c.isRecruiting ? (
                    <button
                      onClick={() => {
                        setRegisteringClub(c);
                        setRegError(null);
                        setRegSuccessData(null);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <span>Join Club</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="flex-1 px-3 py-2 text-xs font-medium text-slate-400 bg-slate-50 rounded-xl text-center cursor-not-allowed">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── MODAL 1: CLUB PROFILE & PUBLIC MEMBER ROSTER ───────────────────── */}
      {selectedClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            {/* Header Banner */}
            <div className="relative h-48 bg-slate-100">
              <img
                src={selectedClub.bannerImage || selectedClub.logoUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"}
                alt={selectedClub.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setSelectedClub(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-white/95 px-2.5 py-0.5 rounded-full">
                    {selectedClub.code}
                  </span>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {selectedClub.category}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white">
                  {selectedClub.name}
                </h2>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Mission */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About the Club
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedClub.description}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Faculty Coordinator</span>
                  <span className="font-semibold text-slate-800 text-sm">{selectedClub.facultyCoordinator}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Contact Email</span>
                  <span className="font-semibold text-slate-800 font-mono text-sm">{selectedClub.contactEmail}</span>
                </div>
                {selectedClub.meetingSchedule && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Schedule</span>
                    <span className="font-medium text-slate-700">{selectedClub.meetingSchedule}</span>
                  </div>
                )}
                {selectedClub.roomOrVenue && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Venue</span>
                    <span className="font-medium text-slate-700">{selectedClub.roomOrVenue}</span>
                  </div>
                )}
              </div>

              {/* Achievements */}
              {selectedClub.achievements && selectedClub.achievements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Achievements & Honours
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedClub.achievements.map((ach, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-xs font-medium"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        {ach}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Public Member Roster Section */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-navy flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      Public Member Directory
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Active club members who have affirmatively opted into the public directory.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                    {roster.length} Recognized Members
                  </span>
                </div>

                {isLoadingRoster ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading roster...</div>
                ) : roster.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                    No members have opted into public directory listing yet, or the roster is private.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-3 py-2 rounded-l-lg">Student Name</th>
                          <th className="px-3 py-2">Programme</th>
                          <th className="px-3 py-2">Year</th>
                          <th className="px-3 py-2 rounded-r-lg">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roster.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-semibold text-slate-800">{m.studentName}</td>
                            <td className="px-3 py-2.5 text-slate-600">{m.degree}</td>
                            <td className="px-3 py-2.5 text-slate-600">Year {m.yearOfStudy}</td>
                            <td className="px-3 py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                  m.role === "president" || m.role === "vice_president"
                                    ? "bg-purple-100 text-purple-800"
                                    : m.role === "secretary" || m.role === "treasurer" || m.role === "executive"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {m.role.replace("_", " ")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Privacy Guarantee: Contact details, phone numbers, and register numbers are strictly protected and never displayed publicly.
                  </span>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedClub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                {selectedClub.isRecruiting && (
                  <button
                    onClick={() => {
                      setRegisteringClub(selectedClub);
                      setSelectedClub(null);
                    }}
                    className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
                  >
                    Apply for Membership
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PUBLIC MEMBERSHIP REGISTRATION ────────────────────────── */}
      {registeringClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-5 border border-slate-100">
            {regSuccessData ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-navy">Application Submitted!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your application to join <strong>{registeringClub.name}</strong> has been received and is pending review by the club coordinator.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 max-w-sm mx-auto space-y-1 font-mono text-left">
                  <div>Student: <strong>{regForm.studentName}</strong></div>
                  <div>Register No: <strong>{regForm.registerNumber.toUpperCase()}</strong></div>
                  <div>Degree: <strong>{regForm.degree}</strong></div>
                  <div>Status: <span className="text-amber-600 font-bold">PENDING REVIEW</span></div>
                </div>
                <button
                  onClick={handleResetRegForm}
                  className="px-6 py-2.5 text-xs font-semibold bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-navy">
                      Join {registeringClub.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Submit your application to become an active member.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetRegForm}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Student Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.studentName}
                      onChange={(e) => setRegForm({ ...regForm, studentName: e.target.value })}
                      placeholder="e.g. Anand Kumar"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      College Register Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.registerNumber}
                      onChange={(e) => setRegForm({ ...regForm, registerNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. 24BCS101"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={regForm.departmentId}
                      onChange={(e) => setRegForm({ ...regForm, departmentId: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    >
                      <option value="computer-science">Computer Science</option>
                      <option value="commerce">Commerce</option>
                      <option value="bba">Business Admin (BBA)</option>
                      <option value="english">English</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="science">Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Degree Programme *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.degree}
                      onChange={(e) => setRegForm({ ...regForm, degree: e.target.value })}
                      placeholder="e.g. B.Sc CS"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Year of Study (1–4) *
                    </label>
                    <select
                      value={regForm.yearOfStudy}
                      onChange={(e) => setRegForm({ ...regForm, yearOfStudy: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white font-medium"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Personal Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm.personalEmail}
                      onChange={(e) => setRegForm({ ...regForm, personalEmail: e.target.value })}
                      placeholder="student@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regForm.phoneNumber}
                      onChange={(e) => setRegForm({ ...regForm, phoneNumber: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Why do you wish to join? (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={regForm.reasonForJoining}
                    onChange={(e) => setRegForm({ ...regForm, reasonForJoining: e.target.value })}
                    placeholder="Briefly mention relevant interests or previous co-curricular experience..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  />
                </div>

                {/* Directory Consent Checkbox */}
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regForm.confirmPublicDirectoryConsent}
                      onChange={(e) =>
                        setRegForm({ ...regForm, confirmPublicDirectoryConsent: e.target.checked })
                      }
                      className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 shrink-0"
                    />
                    <div className="text-xs text-slate-800">
                      <span className="font-bold text-amber-950">
                        Include me in the Public Member Directory
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        Optional affirmative consent. If checked, your name, degree, and membership role will be recognized in the club's public roster. Unchecking keeps your membership completely private.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetRegForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReg}
                    className="px-6 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingReg ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 3: DIRECTORY CONSENT WITHDRAWAL ──────────────────────────── */}
      {isConsentWithdrawalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                Directory Consent Withdrawal
              </h3>
              <button
                onClick={() => {
                  setIsConsentWithdrawalOpen(false);
                  setWithdrawResult(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {withdrawResult ? (
              <div className="space-y-4 text-center py-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{withdrawResult}</p>
                <button
                  onClick={() => {
                    setIsConsentWithdrawalOpen(false);
                    setWithdrawResult(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-navy text-white rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleConsentWithdrawSubmit} className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  If you previously opted into public directory listing for any student club and wish to make your membership private, enter your credentials below.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Club *
                  </label>
                  <select
                    required
                    value={withdrawSlug}
                    onChange={(e) => setWithdrawSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  >
                    <option value="">-- Choose Club --</option>
                    {clubs.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Register Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawRegisterNumber}
                    onChange={(e) => setWithdrawRegisterNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 24BCS101"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={withdrawEmail}
                    onChange={(e) => setWithdrawEmail(e.target.value)}
                    placeholder="e.g. student@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsConsentWithdrawalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingWithdraw || !withdrawSlug}
                    className="px-4 py-2 text-xs font-semibold bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmittingWithdraw ? "Processing..." : "Revoke Consent"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default ClubsDirectorySection;
