import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import MaterialIcon from '@/components/MaterialIcon';

const posters = [
  {
    id: '1',
    name: 'Geometric Void',
    series: 'Archival Ink Print',
    price: 45.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6B1WFplu9CoUeQ6TZkWTNFjE7xEzVITxqnG6qLb7-co8kn4PulSIZfH2Li6MiGYtNl3HQventLJCbf6_PqAEOGdRr09q4ZZ-30_Jbp44yDADq8z82bRe3pnuzzpjUszWnA3e6rWKqo8-mn5UcUnEKOjn6D4wMBXUic2lLFp_kMNTiqSum8t1BmyhJCAUhBxQ3wgtPcmG77NPtJyP_TL3g506OHD3cnTycggJAkoPHAUtdRta4gK01Y71VMJZmyPfv6dK13d-hfg',
    badge: 'A3 / A4 / A5',
  },
  {
    id: '3',
    name: 'Misty Silence',
    series: 'Fine Art Collection',
    price: 62.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxmwDhxIOBrd_CwGFvXAFk_aJVdz4bS5vbkbsedYDBhYL-oAHt5T_FRNjYfmRwcdIXQZK_SYEQKLM4F8pQpamrfK2lfya4MmIA8DOgs7ddpyUcOxTXVfJisGzd3fEw7fNbVZhvFnOj_g72qe4h1vpeGsP6noFkGBHf74t1vuuNl8z22XSFPP2fFTYuSRzmhFvIgJDpJez7jLDFS1CjhP0NHZ2o0N0664u1LFwo7D6-6cwd65OEQWso8oxwcvTXwaOqWxFkB5N9VA',
    badge: 'HAND-NUMBERED',
  },
  {
    id: '4',
    name: 'Neon Pulse',
    series: 'Pop Art Series',
    price: 38.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCizPB8qtm98KvT2YfKVVQz7iJ0riV5gKgDkVxm3H4phYTgvL3mBBsyH0FtjOAlGNufmnrZmKW8mCMgBtv2SsjvfsocknhwkGrxYDKG_nzw8h_NDQcXJODTKlqSLnFyWGAy1whQONP0GsilDTnFP4h0KM2ewxMMyPmcYCOjRZf0UB-Z8dRFL3e2-xn5FjtseCuxArE48l4ymKgKzrVsVS53ekPciZK1pEt9tjQTwX4Tx4FhrOeOw5w44PNww21FIAmILNhXH5tmGg',
    badge: 'POPULAR',
    badgeColor: 'bg-red-600',
  },
  {
    id: '5',
    name: 'Zen Balance',
    series: 'Minimalist Decor',
    price: 42.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ1PBfAE415TqocgO8wMHZUTq04xhJuDjMVUFD77f2NuS5LSjrJg7t8f_9HqixXcleWoSlzjjJjD_BR3WX3qyuCxxBDkTjYdLuL2F7qHcdliB34iRVqgNNnEWulEqbP08hwjLW7C4AWJSjzoOUVeVJQzaVZV1q4kFwePzlOwTmY_mpslLHSFHtSc7sAGM614KPf8qBAV0oqgKWK5h8vRyjkj3BfY5F1xrzoAl7RNUyiAIXdNJ-b0QrYaUt70FYmPJC79w7P66Zjg',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-24 flex-1">
        <div className="max-w-[1440px] mx-auto flex gap-0">
          <Sidebar />
          <section className="flex-1 bg-surface-container-low p-8">
            {/* Hero Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="md:col-span-2 relative rounded-2xl overflow-hidden h-72 group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAK98PjORcpS3_6lKNBIL4YlZ-M7RfX5OB1LAURdNnsXSCl9CtVqYrzyAYJtQ9Zabra3BFjDAjBT1RbLsJf1Kl00cIYYgk5zrM1NlSOdwHe8rQ4jVMn2Lv2DOZDq51Vx0NWuMsjv_SMpt1ggDKMWXA7_Vt9H5cetvUYy6PQ3OeDSunUn5ArN9vD8pLZbNo7EkA8Cz17mcET96OGclBL-SPlYv-kKtmZNfO3llwDdHbnkQ1rBaB1c38snwCeLOXH2ntrEnQQ_uR6A"
                  alt="Summer Solstice Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Editor's Choice</span>
                  <h2 className="text-3xl font-headline font-extrabold tracking-tight mt-2">
                    The Summer<br />Solstice Collection
                  </h2>
                  <Link
                    to="/shop"
                    className="mt-4 inline-block bg-cta-gradient text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Explore Series
                  </Link>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden h-72 group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuANGYuRyaVRzRYkV99qxoG95dZFaJpbPcI1m32fmgHA2G4DuTSz9g9czlYF6OmZLQ-dCqFn7MNCQZdEb-JNCNLuIpMeAICgsvYv8ARaw6IQV8aa2HpVdS6qjnwS5OblCDR93Xh2YGz88S9sZyajUHbQ6N40Jnsj6lw67L7n2vewME0V7s9CTLBw1cYkzibXbJI3NbsFzTMZQzpnEbM4ydDPr74RFvf3YBRIZkxdKC_P4O23FXupxEhvqJNQWupb3pSVtU9RpiA1uQ"
                  alt="Featured art"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Product Grid Header */}
            <div className="flex flex-wrap items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-headline font-extrabold tracking-tight">Abstract Originals</h2>
                <p className="text-on-surface-variant text-sm mt-1">Showing 124 curated results</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sort by</span>
                <select className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-primary">
                  <option>Newest Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {posters.map(poster => (
                <Link key={poster.id} to={`/poster/${poster.id}`} className="group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-container mb-3">
                    <img
                      src={poster.image}
                      alt={poster.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {poster.badge && (
                      <span className={`absolute bottom-3 left-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${poster.badgeColor || 'bg-surface-container-lowest/90 text-on-surface'}`}>
                        {poster.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline font-bold text-sm">{poster.name}</h3>
                      <p className="text-xs text-on-surface-variant">{poster.series}</p>
                    </div>
                    <span className="font-headline font-bold text-sm">${poster.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2">
              <button className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-dim">
                <MaterialIcon icon="chevron_left" />
              </button>
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    n === 1 ? 'bg-inverse-surface text-inverse-on-surface' : 'bg-surface-container text-on-surface-variant hover:bg-surface-dim'
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="w-10 h-10 flex items-center justify-center text-on-surface-variant">...</span>
              <button className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-sm font-bold text-on-surface-variant hover:bg-surface-dim">24</button>
              <button className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-dim">
                <MaterialIcon icon="chevron_right" />
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
