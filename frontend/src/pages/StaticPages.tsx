import SEO from '@/components/SEO';

interface StaticPageProps {
  title: string;
  children: React.ReactNode;
}

function StaticPage({ title, children }: StaticPageProps) {
  return (
    <>
      <SEO title={title} />
      <div className="container-luxury py-8 sm:py-12 max-w-3xl">
        <h1 className="luxury-heading text-3xl sm:text-4xl mb-6 sm:mb-8">{title}</h1>
        <div className="prose prose-stone max-w-none space-y-4 text-stone leading-relaxed">
          {children}
        </div>
      </div>
    </>
  );
}

export function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p>Last updated: July 2026</p>
      <p>MECCIO ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.</p>
      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Information We Collect</h2>
      <p>We collect information you provide directly, including name, email, shipping address, payment information, and order history. We also collect usage data through cookies and analytics tools.</p>
      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">How We Use Your Information</h2>
      <p>We use your information to process orders, communicate about your purchases, improve our services, and send marketing communications (with your consent).</p>
      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Data Security</h2>
      <p>We implement industry-standard security measures including encryption, secure payment processing, and access controls to protect your personal data.</p>
      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Contact</h2>
      <p>For privacy inquiries, contact us at privacy@meccio.com.</p>
    </StaticPage>
  );
}

export function TermsPage() {
  return (
    <StaticPage title="Terms of Service">
      <p>Last updated: July 2026</p>
      <p>By accessing and using the MECCIO website, you agree to these Terms of Service.</p>
      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Products & Pricing</h2>
      <p>All prices are listed in USD unless otherwise stated. We reserve the right to modify prices without notice. Product images are representative; slight variations in color and pattern may occur due to the handmade nature of our rugs.</p>
      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Orders & Payment</h2>
      <p>Orders are confirmed upon successful payment. We accept payments through Razorpay and other approved payment methods.</p>
      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Intellectual Property</h2>
      <p>All content on this website, including designs, images, and text, is the property of MECCIO and protected by copyright law.</p>
    </StaticPage>
  );
}

export function LicensePage() {
  return (
    <StaticPage title="License & Attribution">
      <p>Last updated: July 2026</p>
      <p>
        This MECCIO website was designed and developed by{' '}
        <a
          href="https://codewavestudio.space"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:text-gold-dark underline underline-offset-2"
        >
          CodeWave Studio
        </a>
        .
      </p>

      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Required credit</h2>
      <p>
        The following notice is fixed in the site footer and must not be removed or altered
        without written permission from CodeWave Studio:
      </p>
      <p className="border border-sand/50 bg-ivory px-4 py-3 text-sm">
        © 2026 MECCIO. All rights reserved. Designed &amp; Developed by CodeWave Studio
      </p>

      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Agency rights</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Client retains ownership of MECCIO brand assets, product data, and business content.</li>
        <li>CodeWave Studio retains authorship credit for design and development work.</li>
        <li>Client may host and operate this codebase for the MECCIO commercial website.</li>
        <li>Redistribution as a template/SaaS product or removal of attribution is not permitted without written consent.</li>
      </ul>

      <h2 className="font-display text-2xl text-charcoal mt-8 mb-4">Contact</h2>
      <p>
        Questions about this license:{' '}
        <a
          href="https://codewavestudio.space"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:text-gold-dark underline underline-offset-2"
        >
          codewavestudio.space
        </a>
      </p>
    </StaticPage>
  );
}
