import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Building2,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient, ApiError } from "@/lib/api-client";

interface DemoAccount {
  id: string;
  label: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  icon: React.ElementType;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "master",
    label: "Master Admin",
    name: "Dr. V. Anitha",
    role: "Master Admin",
    email: "admin@bac.edu.in",
    initials: "DV",
    icon: Shield,
  },
  {
    id: "hod-cs",
    label: "Sub — HOD CS",
    name: "Dr. K. Suresh",
    role: "HOD Computer Science",
    email: "hod.cs@bac.edu.in",
    initials: "KS",
    icon: Building2,
  },
  {
    id: "hod-comm",
    label: "Sub — HOD Commerce",
    name: "Dr. M. Lakshmi",
    role: "HOD Commerce",
    email: "hod.commerce@bac.edu.in",
    initials: "ML",
    icon: Building2,
  },
  {
    id: "club",
    label: "Sub — Cultural Club",
    name: "Prof. R. David",
    role: "Cultural Club Head",
    email: "cultural@bac.edu.in",
    initials: "RD",
    icon: Users,
  },
];

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedDemo, setSelectedDemo] = useState<DemoAccount>(DEMO_ACCOUNTS[0]);
  const [email, setEmail] = useState("admin@bac.edu.in");
  const [password, setPassword] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectDemo = (account: DemoAccount) => {
    setSelectedDemo(account);
    setEmail(account.email);
    setPassword("Admin@2026");
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your administrative email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send authentication request to backend with credentials
      const data = await apiClient.post<any>("/auth/login", {
        email: cleanEmail,
        password,
      });

      const liveUser = data?.data?.user || data?.user;

      if (!liveUser) {
        throw new Error("Authentication failed: invalid response from server.");
      }

      // Save user profile for admin dashboard greeting only (no bearer token stored)
      const userProfile = {
        name: liveUser.name,
        role: liveUser.role,
        email: liveUser.email,
        initials:
          liveUser.initials ||
          liveUser.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        rememberMe,
      };

      localStorage.setItem("bac_admin_user", JSON.stringify(userProfile));

      toast({
        title: `Welcome back, ${userProfile.name.split(" ")[0]}!`,
        description: `Successfully signed in as ${userProfile.role}.`,
      });

      navigate("/admin");
    } catch (err: any) {
      const isNetworkError =
        (err instanceof ApiError && err.isNetworkError) ||
        (err instanceof TypeError && err.message.toLowerCase().includes("fetch"));

      const displayMessage = isNetworkError
        ? "Unable to connect to authentication server. Please ensure the backend is running."
        : err.message || "Invalid credentials. Please try again.";

      toast({
        title: "Login Failed",
        description: displayMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0B1A30]">
      {/* ── Left Hero Panel ────────────────────────────────────────── */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 bg-gradient-to-br from-[#0B1A30] via-[#0C2340] to-[#081728] text-white relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: College Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase leading-tight font-sans">
              BISHOP AMBROSE COLLEGE
            </h2>
          </div>
        </div>

        {/* Center: Main Statement */}
        <div className="relative z-10 my-12 lg:my-0 max-w-xl">
          {/* Cyan Glow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-xs font-semibold mb-6 shadow-xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Admin Portal
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Manage the entire BAC website from a single dashboard.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal text-slate-300/90">
            Master admins get full control of pages, menus, departments, faculty,
            admissions, alumni, IQAC, examination, facilities, gallery and users.
            Sub-admins see only the modules assigned to their role.
          </p>
        </div>

        {/* Bottom: Statistics Row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
          <div className="bg-[#0e2646]/70 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00E5FF] tracking-tight">
              300+
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              PAGES
            </div>
          </div>

          <div className="bg-[#0e2646]/70 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00E5FF] tracking-tight">
              12
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              DEPARTMENTS
            </div>
          </div>

          <div className="bg-[#0e2646]/70 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00E5FF] tracking-tight">
              95+
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              FACULTY
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ───────────────────────────────────────── */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#F8FAFC]">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl">
          {/* Card Title */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to the BAC admin portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bac.edu.in"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Password Reset Assistance",
                    description: "Please contact IT Administration (admin@bac.edu.in) to reset your security credentials.",
                  })
                }
                className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#0C1E36] hover:bg-[#081526] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {selectedDemo.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Login Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              QUICK DEMO LOGIN
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isCurrent = selectedDemo.id === acc.id;

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                      isCurrent
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-white" : "text-slate-500"}`} />
                    <span className="truncate">{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Back to Website Link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

