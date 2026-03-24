"use client";

import { useState, type FormEvent } from "react";
import { Input, Textarea, Label } from "@/components/ui/FormElements";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("submitting");
    // Placeholder: Replace with your real form submission endpoint
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="border border-emerald-500/20 rounded-2xl p-10 bg-emerald-500/5 text-center">
        <p className="text-emerald-400 font-medium mb-2">Message sent.</p>
        <p className="text-zinc-500 text-sm">
          I'll read it and respond if it warrants a reply.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder="What are you working on? What do you want to discuss?"
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
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
