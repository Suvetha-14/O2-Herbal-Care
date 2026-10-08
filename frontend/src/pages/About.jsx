import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const VALUES = [
  {
    icon: '🌱',
    title: 'Pure Botanicals',
    desc: 'We formulate strictly with real plant extracts, cold-pressed oils, and essential fragrances. No artificial fillers.',
  },
  {
    icon: '✋',
    title: 'Small Batch Handcrafted',
    desc: 'Each soap bar and shampoo batch is mixed, poured, and cured in small artisan batches in Coimbatore, Tamil Nadu.',
  },
  {
    icon: '🔬',
    title: 'Gentle & Tested',
    desc: 'pH-balanced, skin-friendly formulas designed to nourish without stripping natural moisture barriers.',
  },
  {
    icon: '♻️',
    title: 'Zero Waste Mindset',
    desc: 'Committed to biodegradable ingredients, sustainable procurement, and minimal eco-impact packaging.',
  },
]

const INGREDIENTS = [
  { name: 'Pure Aloe Vera', benefit: 'Deep cellular hydration & skin calming' },
  { name: 'Neem & Tulsi', benefit: 'Purifying, antibacterial, and anti-acne shield' },
  { name: 'Bhringraj & Shikakai', benefit: 'Strengthens roots and reduces hair thinning' },
  { name: 'Saffron & Goat Milk', benefit: 'Skin radiance, gentle exfoliation & glow' },
  { name: 'Virgin Coconut Oil', benefit: 'Deep conditioning & essential fatty acids' },
  { name: 'Tea Tree & Charcoal', benefit: 'Pore detox and natural oil regulation' },
]

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[var(--color-cream)] py-16 px-4 text-center border-b border-black/5 relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="text-4xl block">🌿</span>
            <p className="eyebrow justify-center">Our Heritage & Story</p>
            <h1 className="heading-font text-3xl sm:text-5xl text-[var(--color-primary)] font-bold">
              Rooted in Nature. Crafted with Care.
            </h1>
            <p className="text-gray-700 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              O2 Herbal Care was founded on a simple principle: beauty and hygiene should never
              compromise on health, nature, or transparency.
            </p>
          </div>
        </section>

        {/* Brand Story */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-gold)]">
                Handmade in Coimbatore
              </span>
              <h2 className="heading-font text-2xl sm:text-3xl text-[var(--color-primary)] font-bold">
                A Mission of Wholesome Care
              </h2>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Modern personal care is overflowing with sulphates, parabens, synthetic colors,
                and micro-plastics. At O2 Herbal Care, we returned to our roots in Coimbatore,
                harnessing authentic Indian botanicals that have nourished skin and hair for centuries.
              </p>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                From cold-processed soaps made with pure vegetable oils to root-strengthening shampoos
                infused with Bhringraj and Hibiscus, every single formulation is handcrafted in small batches
                to ensure peak freshness, potency, and safety.
              </p>
            </div>

            <div className="bg-[var(--color-cream)] p-8 rounded-3xl border border-[var(--color-accent)]/30 space-y-6">
              <h3 className="heading-font text-xl text-[var(--color-primary)] font-bold">
                The O2 Promise
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>100% Chemical-Free:</strong> Zero sulphates, parabens, phthalates, or harsh detergents.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Cruelty-Free:</strong> We never test on animals and partner solely with ethical growers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Traditional Wisdom:</strong> Time-tested Ayurvedic herbs processed with modern quality standards.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Transparent Ingredients:</strong> Full honesty on every label. What you see is what you get.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-gray-50 py-16 px-6 border-y border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="eyebrow justify-center mb-2">What Defines Us</p>
              <h2 className="heading-font text-3xl text-[var(--color-primary)] font-bold">
                Our Core Pillars
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val) => (
                <div key={val.title} className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 space-y-3">
                  <span className="text-3xl block">{val.icon}</span>
                  <h3 className="font-bold text-[var(--color-primary)] text-base">{val.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Botanical Ingredients Highlight */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="eyebrow justify-center mb-2">Nature's Pharmacopeia</p>
            <h2 className="heading-font text-3xl text-[var(--color-primary)] font-bold">
              Key Ingredients We Cherish
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {INGREDIENTS.map((ing) => (
              <div key={ing.name} className="p-5 rounded-2xl bg-[var(--color-cream)] border border-gray-200/60">
                <h4 className="font-bold text-[var(--color-primary)] text-sm mb-1">🌿 {ing.name}</h4>
                <p className="text-xs text-gray-600">{ing.benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[var(--color-primary)] text-white py-14 px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="heading-font text-2xl sm:text-3xl font-bold">
              Ready to Experience Clean, Pure Herbal Care?
            </h2>
            <p className="text-white/80 text-sm">
              Discover soaps, shampoos, and hair treatments handcrafted for everyday wellness.
            </p>
            <div className="pt-2">
              <Link to="/products" className="btn-primary !bg-[var(--color-gold)] !text-[var(--color-ink)] hover:!bg-white font-bold text-sm">
                Shop Our Collection →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
