import type { Metadata } from "next";
import { Section, Container } from "@/components/ui/Layout";
import { ContactForm } from "@/features/contact/ContactForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Contact — ${siteConfig.name}`,
  description: "Get in touch with Khalidae for collaboration or inquiry.",
};

export default function ContactPage() {
  return (
    <main className="pt-24">
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: context */}
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-6">
                Contact
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-8 leading-tight">
                Let&apos;s talk.
              </h1>
              <div className="space-y-5 text-zinc-400 text-base leading-relaxed mb-10">
                <p>
                  Open to serious conversations about technical collaboration,
                  platform partnerships, consulting, and interesting problems.
                </p>
                <p>
                  Not accepting cold pitches or unsolicited sales. If you have
                  something real to say, say it clearly.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="text-zinc-300 font-mono text-sm">
                    {siteConfig.author.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">
                    Twitter / X
                  </p>
                  <p className="text-zinc-300 text-sm">
                    {siteConfig.author.twitter}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">
                    GitHub
                  </p>
                  <p className="text-zinc-300 text-sm">
                    {siteConfig.author.github.replace("https://github.com/", "github/")}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
