import type { Metadata } from "next";
import { Section, Container } from "@/components/ui/Layout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for khalidae.com",
};

const EFFECTIVE_DATE = "March 24, 2026";

export default function PrivacyPage() {
  return (
    <main className="pt-24">
      <Section>
        <Container size="narrow">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-6">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-zinc-100 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-zinc-600 text-sm mb-12">
            Effective: {EFFECTIVE_DATE}
          </p>

          <div className="prose-custom space-y-10 text-zinc-400 text-base leading-relaxed">
            <PolicySection heading="Overview">
              <p>
                Khalidae ({siteConfig.url}) is a personal digital platform. This
                policy explains what data is and is not collected when you use
                this site or its tools.
              </p>
            </PolicySection>

            <PolicySection heading="Information We Do Not Collect">
              <p>
                We do not collect personal information beyond what is strictly
                necessary to operate the services you use. Specifically:
              </p>
              <ul>
                <li>We do not sell personal data.</li>
                <li>We do not run behavioral tracking or ad targeting.</li>
                <li>
                  We do not store tool inputs (URLs, text, form data) on our
                  servers.
                </li>
                <li>
                  Text Utilities and Card Generator operate entirely in your
                  browser. Nothing is transmitted.
                </li>
              </ul>
            </PolicySection>

            <PolicySection heading="Information Collected Automatically">
              <p>
                Like most web services, our hosting infrastructure may log
                standard request metadata, including IP address, browser type,
                and accessed paths. These logs are used for operational purposes
                (debugging, abuse prevention) and are not used for marketing.
              </p>
            </PolicySection>

            <PolicySection heading="Tool API Requests">
              <p>
                The Link Analyzer and Metadata Viewer tools send URLs to our
                server-side API to perform public HTTP requests. These URLs are
                not stored, logged to persistent storage, shared, or used for
                any purpose beyond fulfilling the immediate request.
              </p>
            </PolicySection>

            <PolicySection heading="Contact Form">
              <p>
                If you use the contact form, the information you provide (name,
                email, message) is used solely to respond to your inquiry. It is
                not shared with third parties.
              </p>
            </PolicySection>

            <PolicySection heading="Third-Party Services">
              <p>
                This site is deployed on Vercel. Vercel may collect request-level
                telemetry as part of its hosting infrastructure. Review Vercel's
                privacy policy for details.
              </p>
            </PolicySection>

            <PolicySection heading="Cookies">
              <p>
                This site does not use tracking cookies. Technical cookies
                necessary for platform operation (e.g., Vercel infrastructure)
                may be set by the hosting layer.
              </p>
            </PolicySection>

            <PolicySection heading="Your Rights">
              <p>
                If you have questions about data held about you or wish to make a
                request, contact us at {siteConfig.author.email}.
              </p>
            </PolicySection>

            <PolicySection heading="Changes">
              <p>
                This policy may be updated over time. Changes will be reflected
                with an updated effective date. Continued use of the site
                constitutes acceptance of the current policy.
              </p>
            </PolicySection>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function PolicySection({
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
