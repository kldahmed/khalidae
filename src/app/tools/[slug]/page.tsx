import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section, Container } from "@/components/ui/Layout";
import { Badge } from "@/components/ui/Badge";
import { ToolRenderer } from "@/features/tools/ToolRenderer";
import { getToolBySlug, tools } from "@/lib/tools-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: tool.name,
    description: tool.tagline,
  };
}

const toolFAQs: Record<string, { question: string; answer: string }[]> = {
  "link-analyzer": [
    {
      question: "What does this tool check?",
      answer:
        "It inspects HTTP headers, status codes, and basic response data for any publicly accessible URL.",
    },
    {
      question: "Is data stored or logged?",
      answer:
        "No request data is stored. Queries are ephemeral and discarded after the response.",
    },
    {
      question: "Can I analyze private or authenticated URLs?",
      answer:
        "No. This tool only operates on publicly accessible URLs without credentials.",
    },
  ],
  "metadata-viewer": [
    {
      question: "What metadata is extracted?",
      answer:
        "Open Graph tags, Twitter Card tags, canonical URL, page title, and meta description.",
    },
    {
      question: "Does this store the pages I inspect?",
      answer: "No. Pages are fetched on demand and not stored.",
    },
    {
      question: "Will it work on pages behind a login?",
      answer:
        "No. Only publicly accessible pages can be inspected by this tool.",
    },
  ],
  "text-utilities": [
    {
      question: "Does my text leave the browser?",
      answer:
        "No. All text operations are performed entirely in your browser. Nothing is transmitted.",
    },
    {
      question: "What operations are available?",
      answer:
        "Uppercase, lowercase, title case, whitespace trimming, line deduplication, Base64 encoding/decoding, and word/character count.",
    },
  ],
  "card-generator": [
    {
      question: "Where is my profile data stored?",
      answer:
        "It is not stored anywhere. The card is generated entirely in your browser.",
    },
    {
      question: "Can I export the card?",
      answer:
        "You can copy the HTML embed code using the copy button below the preview.",
    },
  ],
};

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  const faqs = toolFAQs[slug] ?? [];
  const usagePolicyText =
    slug === "card-generator"
      ? "This tool generates profile cards entirely in your browser. No data is transmitted or stored. Use responsibly and only with your own information."
      : "This tool is intended for lawful, authorized use only. Do not use it to inspect URLs or content you do not have permission to access.";

  return (
    <main className="pt-24">
      {/* Header */}
      <Section>
        <Container size="narrow">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl">{tool.icon}</span>
            <Badge variant="muted">{tool.category}</Badge>
            {tool.comingSoon && <Badge variant="accent">Coming soon</Badge>}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight mb-4">
            {tool.name}
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-6">
            {tool.tagline}
          </p>
          <p className="text-zinc-500 text-base leading-relaxed max-w-2xl">
            {tool.description}
          </p>
        </Container>
      </Section>

      {/* Tool Interface */}
      <Section className="border-t border-zinc-800/60 pt-10">
        <Container size="narrow">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-6">
            Interface
          </h2>

          {tool.available ? (
            <ToolRenderer slug={tool.slug} />
          ) : (
            <div className="border border-zinc-800/60 rounded-2xl p-10 bg-zinc-900/40 text-center">
              <p className="text-zinc-500 text-base mb-2 font-medium">
                Coming soon.
              </p>
              <p className="text-zinc-600 text-sm">
                This tool is in development. Check back for updates.
              </p>
            </div>
          )}
        </Container>
      </Section>

      {/* Policy Note */}
      <Section className="pt-6 pb-10">
        <Container size="narrow">
          <div className="border border-amber-500/20 rounded-xl p-5 bg-amber-500/5">
            <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-2">
              Usage Policy
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed">
              {usagePolicyText} All usage is subject to the{" "}
              <a href="/terms" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <Section className="border-t border-zinc-800/60 pt-10">
          <Container size="narrow">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-8">
              FAQ
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-zinc-200 font-medium text-sm mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </main>
  );
}
