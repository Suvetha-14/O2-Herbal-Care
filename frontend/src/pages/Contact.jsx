import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ContactForm from '../components/ContactForm'

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="eyebrow justify-center mb-2">We'd Love to Hear From You</p>
          <h1 className="heading-font text-3xl sm:text-5xl text-[var(--color-primary)] font-bold">
            Get in Touch
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto mt-3">
            Have questions about our botanical ingredients, custom gifting, or order deliveries?
            Our friendly Coimbatore team is here to assist.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Contact Details Card */}
          <div className="bg-[var(--color-cream)] p-8 rounded-3xl border border-[var(--color-accent)]/30 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-gold)]">
                Our Workshop
              </span>
              <h2 className="heading-font text-2xl text-[var(--color-primary)] font-bold mt-1">
                O2 Herbal Care
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Handcrafted homemade herbal skincare & wellness products.
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <h3 className="font-bold text-[var(--color-primary)]">Workshop Address</h3>
                  <p className="text-gray-600 mt-0.5">
                    23/2 Nehru Nagar, Swamy Settipalayam, Coimbatore, Tamil Nadu, 641047
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">📞</span>
                <div>
                  <h3 className="font-bold text-[var(--color-primary)]">Customer Helpline</h3>
                  <p className="text-gray-600 mt-0.5">
                    <a href="tel:9688199900" className="hover:underline text-[var(--color-primary)] font-semibold">+91 96881 99900</a> /{' '}
                    <a href="tel:9944558086" className="hover:underline text-[var(--color-primary)] font-semibold">+91 99445 58086</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <h3 className="font-bold text-[var(--color-primary)]">Email Support</h3>
                  <p className="text-gray-600 mt-0.5">
                    <a href="mailto:kumart1973@gmail.com" className="hover:underline text-[var(--color-primary)] font-semibold">
                      kumart1973@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">⏱</span>
                <div>
                  <h3 className="font-bold text-[var(--color-primary)]">Operating Hours</h3>
                  <p className="text-gray-600 mt-0.5">Monday – Saturday: 9:00 AM – 7:00 PM IST</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <p className="text-xs text-gray-500">
                🌱 <strong>Fast Response:</strong> All messages submitted through the form are typically answered within 24 business hours.
              </p>
            </div>
          </div>

          {/* Contact Form Card */}
          <div>
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
