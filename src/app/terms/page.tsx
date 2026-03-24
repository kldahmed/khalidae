import type { Metadata } from "next";
import { Section, Container } from "@/components/ui/Layout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  description: "Terms of service for khalidae.com",
};

const EFFECTIVE_DATE = "March 24, 2026";

export default function TermsPage() {
  return (
    <main className="pt-24">
      <Section>
        <Container size="narrow">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-6">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-zinc-100 tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-zinc-600 text-sm mb-12">
            Effective: {EFFECTIVE_DATE}
          </p>

          <div className="space-y-10 text-zinc-400 text-base leading-relaxed">
            <TermsSection heading="Acceptance">
              <p>
                By accessing or using {siteConfig.url}, you agree to these
                Terms of Service. If you do not agree, do not use this site.
              </p>
            </TermsSection>

            <TermsSection heading="Permitted Use">
              <p>
                This platform and its tools are provided for personal, lawful,
                and non-commercial use unless otherwise agreed in writing.
              </p>
              <p>You may use the tools to:</p>
              <ul>
                <li>Analyze URLs and metadata you own or have permission to inspect.</li>
                <li>Process your own text content.</li>
                <li>Generate profile cards from your own information.</li>
              </ul>
            </TermsSection>

            <TermsSection heading="Prohibited Use">
              <p>You may not use this site or its tools to:</p>
              <ul>
                <li>
                  Access, scrape, or extract data from third-party systems
                  without authorization.
                </li>
                <li>
                  Circumvent access controls, copyright protections, or
                  platform terms of any third party.
                </li>
                <li>Send abusive, threatening, or illegal content.</li>
                <li>
                  Violate any applicable law or regulation, including data
                  protection laws.
                </li>
                <li>
                  Attempt to overload, abuse, or reverse-engineer the platform
                  infrastructure.
                </li>
              </ul>
            </TermsSection>

            <TermsSection heading="No Warranties">
              <p>
                This platform is provided as-is without warranty of any kind.
                Tools are offered in good faith but without guarantees of
                accuracy, uptime, or fitness for a particular purpose.
              </p>
            </TermsSection>

            <TermsSection heading="Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Khalidae is not liable
                for any indirect, incidental, consequential, or special damages
                arising from your use of this platform.
              </p>
            </TermsSection>

            <TermsSection heading="Intellectual Property">
              <p>
                All content, code, design, and brand assets on this platform are
                the property of Khalidae unless otherwise noted. You may not
                reproduce, redistribute, or re-publish platform content without
                prior written permission.
              </p>
            </TermsSection>

            <TermsSection heading="Third-Party Content">
              <p>
                Where tools interact with external URLs or services, those
                services are governed by their own terms. Khalidae has no
                affiliation with or endorsement of any third-party platform or
                service.
              </p>
            </TermsSection>

            <TermsSection heading="Changes">
              <p>
                These terms may be updated over time. Continued use of the site
                following an update constitutes acceptance of the revised terms.
              </p>
            </TermsSection>

            <TermsSection heading="Contact">
              <p>
                Questions about these terms can be directed to{" "}
                {siteConfig.author.email}.
              </p>
            </TermsSection>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function TermsSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-zinc-200 font-semibold text-lg mb-4">{heading}</h2>
      <div className="space-y-3 [&_ul]:mt-3 [&_ul]:space-y-2 [&_li]:ml-4 [&_li]:list-disc [&_li]:text-zinc-500">
        {children}
      </div>
    </div>
  );
}
