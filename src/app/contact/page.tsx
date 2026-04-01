import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/ContactForm";
import ContactCard from '@/components/contact/ContactCard';

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Khalidae for collaboration or inquiry.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">تواصل معي</h1>
        <div className="grid gap-6 mb-10">
          <ContactCard
            label="البريد الإلكتروني"
            value="adminkhalidae@gmail.com"
            type="email"
            link="mailto:adminkhalidae@gmail.com"
          />
          <ContactCard
            label="X (تويتر سابقًا)"
            value="@khalldahmd"
            type="x"
            link="https://x.com/khalldahmd"
          />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">نموذج التواصل</h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
