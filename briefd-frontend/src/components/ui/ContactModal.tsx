"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// ContactModal
// Opened by LandingContactSection "Get in touch" button.
// Follows existing design tokens from globals.css exactly.
// ─────────────────────────────────────────────────────────────────────────────

const MESSAGE_TYPES = [
  "General Inquiry",
  "Product Feedback",
  "Feature Request",
  "Bug Report",
  "Collaboration",
] as const;

type FormStatus = "idle" | "submitting" | "success" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<string>(MESSAGE_TYPES[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // ── Body scroll lock ────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Defer focus so Framer Motion entrance animation doesn't interfere
      const t = setTimeout(() => firstInputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── ESC to close ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open, onClose]);

  // ── Focus trap ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [open]);

  // ── Reset form after close animation ───────────────────────────────────
  function handleClose() {
    onClose();
    setTimeout(() => {
      setName(""); setEmail(""); setType(MESSAGE_TYPES[0]);
      setMessage(""); setStatus("idle"); setErrorMsg("");
    }, 280);
  }

  // ── Submission ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type, message }),
      });
      if (!res.ok) {
        let detail = "Submission failed. Please try again.";
        try { const b = await res.json(); if (b.error) detail = b.error; } catch { /* ignore */ }
        setErrorMsg(detail);
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Could not reach the server. Please try again.");
      setStatus("error");
    }
  }

  // ── Shared label style (matches experience/page.tsx label pattern) ──────
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "var(--ink-faint)",
    marginBottom: 8,
  };

  return (
    <AnimatePresence>
      {open && (
        /* ── Backdrop ───────────────────────────────────────────────────── */
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Contact form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          style={{
            position: "fixed",
            top: 0, right: 0, bottom: 0, left: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(17, 17, 16, 0.48)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          {/* ── Dialog ──────────────────────────────────────────────────── */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            className="float-card"
            style={{
              width: "100%",
              maxWidth: 520,
              padding: "40px",
              position: "relative",
              maxHeight: "calc(100vh - 48px)",
              overflowY: "auto",
            }}
          >
            {/* ── Close button ──────────────────────────────────────────── */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close modal"
              className="modal-close-btn"
            >
              ✕
            </button>

            {/* ── Success state ─────────────────────────────────────────── */}
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(232, 79, 39, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    color: "var(--orange)",
                    fontSize: "1.25rem",
                  }}
                >
                  ✓
                </div>
                <h3
                  className="card-heading"
                  style={{ fontSize: "1.2rem", marginBottom: 12 }}
                >
                  Message sent
                </h3>
                <p className="body-copy" style={{ marginBottom: 28 }}>
                  Thanks for reaching out. I will get back to you soon.
                </p>
                <button type="button" onClick={handleClose} className="btn-ink">
                  Close
                </button>
              </div>
            ) : (
              /* ── Form state ─────────────────────────────────────────── */
              <>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                  <div className="eyebrow-group" style={{ marginBottom: 12 }}>
                    <span className="eyebrow-dash" />
                    <span className="eyebrow">Contact</span>
                  </div>
                  <h2 className="card-heading" style={{ fontSize: "1.35rem" }}>
                    Get in touch
                  </h2>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="cm-name" style={labelStyle}>
                      Full Name
                    </label>
                    <input
                      ref={firstInputRef}
                      id="cm-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      disabled={status === "submitting"}
                      className="site-input"
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="cm-email" style={labelStyle}>
                      Email
                    </label>
                    <input
                      id="cm-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={status === "submitting"}
                      className="site-input"
                    />
                  </div>

                  {/* Message Type */}
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="cm-type" style={labelStyle}>
                      Message Type
                    </label>
                    <select
                      id="cm-type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      disabled={status === "submitting"}
                      className="site-input site-select"
                    >
                      {MESSAGE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: 28 }}>
                    <label htmlFor="cm-message" style={labelStyle}>
                      Message
                    </label>
                    <textarea
                      id="cm-message"
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What would you like to say?"
                      rows={4}
                      disabled={status === "submitting"}
                      className="site-input"
                      style={{ resize: "vertical", minHeight: 100 }}
                    />
                  </div>

                  {/* Error message */}
                  {status === "error" && (
                    <p
                      role="alert"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.8rem",
                        color: "#B0392B",
                        marginBottom: 16,
                      }}
                    >
                      {errorMsg}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === "submitting" || !name || !email || !message}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {status === "submitting" ? "Sending…" : "Send message"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
