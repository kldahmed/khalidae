"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/FormElements";
import { Button } from "@/components/ui/Button";

interface CardData {
  name: string;
  title: string;
  bio: string;
  website: string;
  twitter: string;
  github: string;
}

const defaultCard: CardData = {
  name: "",
  title: "",
  bio: "",
  website: "",
  twitter: "",
  github: "",
};

export function CardGeneratorTool() {
  const [form, setForm] = useState<CardData>(defaultCard);
  const [preview, setPreview] = useState(false);

  function set(key: keyof CardData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerate() {
    if (form.name) setPreview(true);
  }

  function handleCopyEmbed() {
    const html = generateHTML(form);
    navigator.clipboard.writeText(html);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Name *
          </label>
          <Input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Title
          </label>
          <Input
            placeholder="Engineer / Builder / Creator"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Bio
        </label>
        <Textarea
          rows={3}
          placeholder="One or two lines about you."
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Website
          </label>
          <Input
            placeholder="https://..."
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Twitter / X
          </label>
          <Input
            placeholder="@handle"
            value={form.twitter}
            onChange={(e) => set("twitter", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            GitHub
          </label>
          <Input
            placeholder="username"
            value={form.github}
            onChange={(e) => set("github", e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={!form.name}>
        Generate Card
      </Button>

      {preview && (
        <div className="space-y-4">
          <div className="border border-zinc-700/60 rounded-2xl p-8 bg-zinc-950 max-w-md">
            <p className="text-2xl font-bold text-zinc-100 tracking-tight mb-1">
              {form.name}
              <span className="text-zinc-600">.</span>
            </p>
            {form.title && (
              <p className="text-sm text-zinc-500 mb-4">{form.title}</p>
            )}
            {form.bio && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                {form.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {form.website && (
                <span className="text-xs text-zinc-400 font-mono">
                  {form.website.replace(/^https?:\/\//, "")}
                </span>
              )}
              {form.twitter && (
                <span className="text-xs text-zinc-500">{form.twitter}</span>
              )}
              {form.github && (
                <span className="text-xs text-zinc-500">
                  github/{form.github}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleCopyEmbed}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Copy HTML embed →
          </button>
        </div>
      )}
    </div>
  );
}

function generateHTML(form: CardData): string {
  return `<div style="background:#09090b;border:1px solid #27272a;border-radius:16px;padding:32px;max-width:400px;font-family:system-ui,sans-serif;">
  <p style="color:#f4f4f5;font-size:1.25rem;font-weight:700;margin:0 0 4px">${form.name}.</p>
  ${form.title ? `<p style="color:#71717a;font-size:0.8rem;margin:0 0 16px">${form.title}</p>` : ""}
  ${form.bio ? `<p style="color:#a1a1aa;font-size:0.875rem;margin:0 0 20px;line-height:1.6">${form.bio}</p>` : ""}
  <div style="display:flex;gap:12px;flex-wrap:wrap;">
    ${form.website ? `<span style="color:#a1a1aa;font-size:0.75rem;font-family:monospace">${form.website.replace(/^https?:\/\//, "")}</span>` : ""}
    ${form.twitter ? `<span style="color:#71717a;font-size:0.75rem">${form.twitter}</span>` : ""}
    ${form.github ? `<span style="color:#71717a;font-size:0.75rem">github/${form.github}</span>` : ""}
  </div>
</div>`;
}
