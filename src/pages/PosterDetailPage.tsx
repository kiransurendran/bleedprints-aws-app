import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const images = {
  main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxmwDhxIOBrd_CwGFvXAFk_aJVdz4bS5vbkbsedYDBhYL-oAHt5T_FRNjYfmRwcdIXQZK_SYEQKLM4F8pQpamrfK2lfya4MmIA8DOgs7ddpyUcOxTXVfJisGzd3fEw7fNbVZhvFnOj_g72qe4h1vpeGsP6noFkGBHf74t1vuuNl8z22XSFPP2fFTYuSRzmhFvIgJDpJez7jLDFS1CjhP0NHZ2o0N0664u1LFwo7D6-6cwd65OEQWso8oxwcvTXwaOqWxFkB5N9VA',
  thumbs: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAK98PjORcpS3_6lKNBIL4YlZ-M7RfX5OB1LAURdNnsXSCl9CtVqYrzyAYJtQ9Zabra3BFjDAjBT1RbLsJf1Kl00cIYYgk5zrM1NlSOdwHe8rQ4jVMn2Lv2DOZDq51Vx0NWuMsjv_SMpt1ggDKMWXA7_Vt9H5cetvUYy6PQ3OeDSunUn5ArN9vD8pLZbNo7EkA8Cz17mcET96OGclBL-SPlYv-kKtmZNfO3llwDdHbnkQ1rBaB1c38snwCeLOXH2ntrEnQQ_uR6A',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCizPB8qtm98KvT2YfKVVQz7iJ0riV5gKgDkVxm3H4phYTgvL3mBBsyH0FtjOAlGNufmnrZmKW8mCMgBtv2SsjvfsocknhwkGrxYDKG_nzw8h_NDQcXJODTKlqSLnFyWGAy1whQONP0GsilDTnFP4h0KM2ewxMMyPmcYCOjRZf0UB-Z8dRFL3e2-xn5FjtseCuxArE48l4ymKgKzrVsVS53ekPciZK1pEt9tjQTwX4Tx4FhrOeOw5w44PNww21FIAmILNhXH5tmGg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuANGYuRyaVRzRYkV99qxoG95dZFaJpbPcI1m32fmgHA2G4DuTSz9g9czlYF6OmZLQ-dCqFn7MNCQZdEb-JNCNLuIpMeAICgsvYv8ARaw6IQV8aa2HpVdS6qjnwS5OblCDR93Xh2YGz88S9sZyajUHbQ6N40Jnsj6lw67L7n2vewME0V7s9CTLBw1cYkzibXbJI3NbsFzTMZQzpnEbM4ydDPr74RFvf3YBRIZkxdKC_P4O23FXupxEhvqJNQWupb3pSVtU9RpiA1uQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ1PBfAE415TqocgO8wMHZUTq04xhJuDjMVUFD77f2NuS5LSjrJg7t8f_9HqixXcleWoSlzjjJjD_BR3WX3qyuCxxBDkTjYdLuL2F7qHcdliB34iRVqgNNnEWulEqbP08hwjLW7C4AWJSjzoOUVeVJQzaVZV1q4kFwePzlOwTmY_mpslLHSFHtSc7sAGM614KPf8qBAV0oqgKWK5h8vRyjkj3BfY5F1xrzoAl7RNUyiAIXdNJ-b0QrYaUt70FYmPJC79w7P66Zjg',
  ],
};

const sizes = ['A3', 'A4', 'A5'];

export default function PosterDetailPage() {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('A4');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const allImages = [images.main, ...images.thumbs];

  const handleAddToCart = () => {
    addItem({
      id: `summer-solstice-${selectedSize}-${Date.now()}`,
      name: 'The Summer Solstice',
      image: images.main,
      price: 35.00,
      quantity,
      size: selectedSize,
      frame: 'Unframed',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-surface-container-low rounded-xl overflow-hidden aspect-[3/4] group">
              <img
                src={allImages[selectedImage]}
                alt="The Summer Solstice"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.thumbs.map((thumb, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(i + 1)}
                  className={`aspect-square rounded-lg bg-surface-container-low overflow-hidden cursor-pointer transition-opacity ${
                    selectedImage === i + 1 ? 'border-2 border-primary opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={thumb} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 flex flex-col">
            <nav className="flex mb-4 text-xs font-label text-secondary gap-2">
              <Link to="/" className="hover:underline">Collections</Link>
              <span>/</span>
              <span className="hover:underline cursor-pointer">Abstract</span>
              <span>/</span>
              <span className="text-on-surface font-semibold">The Summer Solstice</span>
            </nav>

            <h1 className="text-4xl font-headline font-extrabold tracking-tight mb-2">The Summer Solstice</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-tertiary">
                {[1, 2, 3, 4].map(i => <MaterialIcon key={i} icon="star" filled className="text-sm" />)}
                <MaterialIcon icon="star_half" filled className="text-sm" />
              </div>
              <span className="text-sm text-secondary">4.8 (124 reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-headline font-extrabold">$35.00</span>
              <span className="text-lg text-outline line-through">$49.00</span>
              <span className="bg-tertiary-container text-white text-[10px] font-bold uppercase px-2 py-1 rounded">Summer Sale</span>
            </div>

            {/* Size */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3">Select Size</h3>
              <div className="flex gap-3">
                {sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-5 py-2 border text-sm font-medium transition-all ${
                      selectedSize === s
                        ? 'border-on-surface bg-surface-container-lowest shadow-sm'
                        : 'border-outline-variant/30 hover:border-outline'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-bold mb-3">Quantity</h3>
              <div className="flex items-center bg-surface-container-high rounded-[0.75rem] px-3 py-1 w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:text-primary">
                  <MaterialIcon icon="remove" className="text-sm" />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:text-primary">
                  <MaterialIcon icon="add" className="text-sm" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-cta-gradient text-white py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-3"
            >
              <MaterialIcon icon="shopping_bag" className="text-sm" />
              Add to Cart
            </button>
            <Link
              to="/checkout"
              className="w-full bg-surface-container-high text-on-surface py-4 rounded-lg font-bold text-sm text-center hover:bg-surface-dim transition-colors mb-4"
            >
              Buy Now
            </Link>
            <div className="flex items-center justify-center gap-6 text-xs text-secondary">
              <span className="flex items-center gap-1"><MaterialIcon icon="local_shipping" className="text-sm" /> Free shipping over $50</span>
              <span className="flex items-center gap-1"><MaterialIcon icon="verified" className="text-sm" /> 2 Year Warranty</span>
            </div>

            {/* Description */}
            <div className="mt-12">
              <h2 className="text-2xl font-headline font-extrabold mb-6">Product Description</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 bg-surface-container-lowest p-6 rounded-xl">
                  <p className="text-sm text-secondary leading-relaxed mb-6">
                    "The Summer Solstice" is an evocative piece that captures the vibrant energy and enduring warmth of the year's longest day. Each print is produced using museum-grade archival inks on heavyweight 250gsm textured paper.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-sm mb-1">Print Quality</h4>
                      <p className="text-xs text-secondary">High-definition giclée printing using 12-color pigment ink systems.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Sustainability</h4>
                      <p className="text-xs text-secondary">FSC-certified paper sourced from responsibly managed forests.</p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl space-y-3">
                  {['Premium 250gsm Paper', 'Matte Anti-Glare Finish', 'Acid-Free for Longevity', 'Standard sizing for frames'].map(feat => (
                    <div key={feat} className="flex items-center gap-3">
                      <MaterialIcon icon="check_circle" filled className="text-tertiary text-lg" />
                      <span className="text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-headline font-extrabold">Reviews</h2>
                <button className="text-sm font-semibold text-primary hover:underline">Write a Review</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { initials: 'EM', name: 'Elena M.', text: '"The quality of the paper is incredible. It feels much more expensive than it actually is."' },
                  { initials: 'JR', name: 'James R.', text: '"Beautiful piece, I got the A3 size and it\'s the perfect statement for my home office."' },
                ].map(review => (
                  <div key={review.initials} className="bg-surface-container-lowest p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-secondary">{review.initials}</div>
                      <div>
                        <p className="font-bold text-sm">{review.name}</p>
                        <p className="text-xs text-secondary">Verified Buyer</p>
                      </div>
                      <div className="ml-auto flex text-tertiary">
                        {[1, 2, 3, 4, 5].map(i => <MaterialIcon key={i} icon="star" filled className="text-sm" />)}
                      </div>
                    </div>
                    <p className="text-sm text-secondary italic">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
