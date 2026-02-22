import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'SpeakEase – India\'s #1 Speech & Hearing Care Platform',
  description: 'India\'s leading platform for Speech Therapy and Audiology. Connect with verified Speech-Language Pathologists, Audiologists, Psychologists, Physiotherapists and more. Book online or in-clinic.',
  keywords: 'speech therapy India, audiology, speech language pathologist, hearing loss treatment, stuttering, aphasia, voice disorder, cochlear implant, speech delay, audiologist near me, online speech therapy',
  openGraph: {
    title: 'SpeakEase – India\'s #1 Speech & Hearing Care Platform',
    description: 'Find verified Speech Therapists & Audiologists across India — for all ages',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white antialiased"><Providers>{children}</Providers></body>
    </html>
  );
}
