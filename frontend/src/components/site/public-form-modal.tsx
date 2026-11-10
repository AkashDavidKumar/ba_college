"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { FormField, CMSForm } from "@/lib/cms-store";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  X,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface PublicFormModalProps {
  slug: string;
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export function PublicFormModal({
  slug,
  isOpen = true,
  onClose,
  isEmbedded = false,
}: PublicFormModalProps) {
  const [form, setForm] = useState<CMSForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    reference: string;
    message: string;
  } | null>(null);

  // Fetch public form definition
  useEffect(() => {
    let active = true;
    if (!slug) return;

    setLoading(true);
    setFetchError(null);
    setSubmitSuccess(null);
    setAnswers({});
    setValidationErrors({});

    apiClient
      .get<any>(`/forms/${slug}`)
      .then((res) => {
        if (!active) return;
        const formData = res?.data;
        if (formData) {
          setForm(formData);
          // Initialize checkbox answers as arrays
          const initial: Record<string, any> = {};
          (formData.fields || []).forEach((f: FormField) => {
            if (f.type === "checkbox") {
              initial[f.id] = [];
            }
          });
          setAnswers(initial);
        } else {
          setFetchError("Form could not be found or is not currently accepting submissions.");
        }
      })
      .catch((err) => {
        if (!active) return;
        setFetchError(err?.message || "Failed to load form details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  // Handle Input Changes
  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const current = Array.isArray(answers[fieldId]) ? answers[fieldId] : [];
    const next = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    handleInputChange(fieldId, next);
  };

  // Client Validation
  const validate = (): boolean => {
    if (!form) return false;
    const errors: Record<string, string> = {};

    form.fields.forEach((field) => {
      const val = answers[field.id];

      if (field.required) {
        if (field.type === "checkbox") {
          if (!Array.isArray(val) || val.length === 0) {
            errors[field.id] = `${field.label} is required (select at least one option).`;
          }
        } else if (val === undefined || val === null || String(val).trim() === "") {
          errors[field.id] = `${field.label} is required.`;
        }
      }

      if (val && String(val).trim() !== "") {
        if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
          errors[field.id] = "Please enter a valid email address.";
        }
        if (field.type === "phone" && !/^[0-9+\s\-()]{7,20}$/.test(String(val))) {
          errors[field.id] = "Please enter a valid phone number (digits, spaces, or hyphens).";
        }
        if (field.type === "number") {
          const num = Number(val);
          if (isNaN(num)) {
            errors[field.id] = "Please enter a valid numeric value.";
          } else {
            if (field.validation?.min !== undefined && num < field.validation.min) {
              errors[field.id] = `Value cannot be less than ${field.validation.min}.`;
            }
            if (field.validation?.max !== undefined && num > field.validation.max) {
              errors[field.id] = `Value cannot exceed ${field.validation.max}.`;
            }
          }
        }
        if (field.type === "url" && !/^https?:\/\//i.test(String(val))) {
          errors[field.id] = "URL must start with http:// or https://.";
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFetchError(null);

    try {
      const res = await apiClient.post<any>(`/forms/${slug}/submissions`, { answers });
      const data = res?.data;
      setSubmitSuccess({
        reference: data?.submissionReference || "SUB-2026-CONFIRMED",
        message: data?.successMessage || form?.successMessage || "Thank you for your submission.",
      });
    } catch (err: any) {
      setFetchError(err?.message || "Failed to submit form. Please check your inputs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className={`bg-white rounded-2xl ${isEmbedded ? "border border-slate-200 p-6 shadow-sm" : "p-6 w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto"}`}>
      {!isEmbedded && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Bishop Ambrose College
              </span>
              <span className="text-xs font-bold text-slate-800">Online Submission Portal</span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading form definition...</span>
        </div>
      ) : fetchError && !form ? (
        <div className="py-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Form Unavailable</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">{fetchError}</p>
        </div>
      ) : submitSuccess ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Submission Received</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">{submitSuccess.message}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-xs mx-auto">
            <span className="text-[11px] font-medium text-slate-500 block mb-1">Your Tracking Reference</span>
            <span className="font-mono text-sm font-bold text-blue-700 tracking-wider">
              {submitSuccess.reference}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Please preserve this reference number for all future communications with the college administration.
          </p>

          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => {
                setSubmitSuccess(null);
                setAnswers({});
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Submit Another Response
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      ) : form ? (
        <div>
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">{form.title}</h2>
            {form.description && (
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{form.description}</p>
            )}
          </div>

          {fetchError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{fetchError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {form.fields.map((field) => {
              const fieldError = validationErrors[field.id];
              return (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      value={answers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 ${
                        fieldError ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-blue-500"
                      }`}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={answers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 ${
                        fieldError ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-blue-500"
                      }`}
                    >
                      <option value="">Select an option...</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "radio" ? (
                    <div className="space-y-1.5 pt-1">
                      {(field.options || []).map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name={field.id}
                            value={opt}
                            checked={answers[field.id] === opt}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="text-blue-600 focus:ring-0"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <div className="space-y-1.5 pt-1">
                      {(field.options || []).map((opt) => {
                        const checked = Array.isArray(answers[field.id]) && answers[field.id].includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleCheckboxToggle(field.id, opt)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0"
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type={field.type === "phone" ? "tel" : field.type}
                      value={answers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 ${
                        fieldError ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-blue-500"
                      }`}
                    />
                  )}

                  {fieldError && <p className="text-[11px] text-rose-500">{fieldError}</p>}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {form.submitButtonText || "Submit"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      {content}
    </div>
  );
}
