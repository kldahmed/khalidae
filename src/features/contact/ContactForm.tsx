"use client";

import { useState, type FormEvent } from "react";
import { Input, Textarea, Label } from "@/components/ui/FormElements";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/providers/LocaleProvider";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const { locale, t } = useLocale();

  const labels =
    locale === "ar"
      ? { name: "الاسم", email: "البريد الإلكتروني", message: "الرسالة" }
      : { name: "Name", email: "Email", message: "Message" };

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("submitting");
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setStatus('error');
        return;
      }

      setStatus("success");
    } catch {
      setStatus('error');
    }
  }

  if (status === "success") {
    return (
      <div className="border border-emerald-500/20 rounded-2xl p-10 bg-emerald-500/5 text-center">
        <p className="text-emerald-400 font-medium mb-2">{t("contact.successTitle")}</p>
        <p className="text-zinc-500 text-sm">
          {t("contact.successDesc")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="contact-name">{labels.name}</Label>
        <Input
          id="contact-name"
          placeholder={t("contact.namePlaceholder")}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="contact-email">{labels.email}</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder={t("contact.emailPlaceholder")}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="contact-message">{labels.message}</Label>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder={t("contact.messagePlaceholder")}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">
          Something went wrong. Try again or email directly.
        </p>
      )}

      <Button type="submit" disabled={status === "submitting"} size="lg">
        {status === "submitting" ? t("contact.sending") : t("contact.send")}
      </Button>
    </form>
  );
}
