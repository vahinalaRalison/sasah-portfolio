import { Mail } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { Section } from './Section';

export function Contact({ email }: { email: string }) {
  return (
    <Section land="contact">
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="card flex flex-col justify-center text-center lg:text-left">
          <p className="text-5xl" aria-hidden>
            💌
          </p>
          <h3 className="mt-3 font-display text-2xl font-bold">Un projet, une mission ?</h3>
          <p className="mt-2 text-barbie-900/80">Parlons architecture, microservices et interfaces qui brillent.</p>
          <a href={`mailto:${email}`} className="mt-4 inline-flex items-center justify-center gap-2 font-semibold text-barbie-600 hover:underline lg:justify-start">
            <Mail className="h-4 w-4" aria-hidden /> {email}
          </a>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
