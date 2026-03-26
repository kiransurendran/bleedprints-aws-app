import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import Sidebar from '@/components/Sidebar';

const sizes = ['A3', 'A4', 'A5'];

export default function CreatePosterPage() {
  const [activeSize, setActiveSize] = useState('A4');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 5rem)' }}>
        {/* Left Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-full bg-zinc-50 border-r-0 p-4 gap-2">
          <div className="mb-6 px-2">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest">Categories</h2>
            <p className="text-xs text-on-surface-variant">Browse by Style</p>
          </div>
          <nav className="flex flex-col gap-1">
            {[
              { icon: 'brush', label: 'Abstract', active: true },
              { icon: 'filter_hdr', label: 'Minimalist' },
              { icon: 'photo_camera', label: 'Photography' },
              { icon: 'history', label: 'Vintage' },
              { icon: 'palette', label: 'Pop Art' },
            ].map(cat => (
              <button
                key={cat.label}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-transform duration-200 hover:translate-x-1 rounded-lg ${
                  cat.active ? 'bg-white text-on-surface shadow-sm' : 'text-zinc-600 hover:bg-zinc-200/50'
                }`}
              >
                <MaterialIcon icon={cat.icon} className={cat.active ? 'text-primary' : ''} />
                {cat.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
            <p className="text-xs font-semibold mb-2 text-on-surface-variant">Active Size</p>
            <div className="flex gap-2">
              {sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveSize(s)}
                  className={`flex-1 py-1 text-[10px] rounded ${
                    activeSize === s ? 'bg-primary text-white' : 'bg-white border border-outline-variant shadow-sm'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 bg-surface-container-low relative flex items-center justify-center p-8 overflow-auto">
          <div className="relative w-[450px] aspect-[1/1.414] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] group overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgyAPQunWDKmY6lPqqL2xfUGw5Cq_WVIjizFnxyPyVB2VA96GeyZl0KIsrTQPAnGm20wD37COixK_Qs_64iNmmI_rjPbxWONW09qmyOhviRlUXmjcwrtW5CM8LVMdq0GOHhB5ogDX643rkNcAkOXP7iGHy7T5-8GGup_8WoQENGPro2t3ZYV1ocHJmORUINwnAPlZX_LUELdV-Dr7HyN4N7hNZOghzrOZuF8iUTSZQk-Gl_vKqxXS2apIFd_ExbFUPiYLWS_5qcQ"
              alt="Poster Preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 border-[24px] border-white/10 pointer-events-none" />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center w-full px-8">
              <h3 className="font-headline text-3xl font-extrabold tracking-tighter text-white drop-shadow-lg uppercase">Curated Space</h3>
              <p className="text-white/80 text-sm font-medium tracking-widest mt-2">LIMITED EDITION SERIES</p>
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-surface-container-lowest rounded-xl shadow-lg p-2">
            {[
              { icon: 'zoom_in', label: 'Zoom' },
              { icon: 'undo', label: 'Undo' },
              { icon: 'redo', label: 'Redo' },
              { icon: 'grid_view', label: 'Grid' },
            ].map(ctrl => (
              <button key={ctrl.label} className="flex flex-col items-center gap-1 px-4 py-2 hover:bg-surface-container-high rounded-lg transition-colors">
                <MaterialIcon icon={ctrl.icon} className="text-on-surface-variant" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">{ctrl.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Right Panel: Content Engine */}
        <aside className="hidden lg:flex flex-col w-80 bg-surface-container-lowest p-6 overflow-y-auto border-l-0">
          <h2 className="font-headline font-bold text-lg mb-6">Content Engine</h2>

          {/* Upload */}
          <div className="bg-surface-container-low rounded-xl p-6 mb-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors min-h-[120px]">
            <MaterialIcon icon="cloud_upload" className="text-3xl text-outline mb-2" />
            <p className="font-semibold text-sm">Upload Artwork</p>
            <p className="text-xs text-on-surface-variant">High-res JPG or PNG (Max 50MB)</p>
          </div>

          {/* Headline */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Headline Text</label>
            <input
              className="w-full bg-surface-container-high border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary text-sm"
              defaultValue="Curated Space"
            />
          </div>

          {/* Text Controls */}
          <div className="flex gap-2 mb-8">
            {['format_bold', 'format_italic', 'format_align_center', 'title'].map(icon => (
              <button key={icon} className="flex-1 p-3 bg-surface-container-high rounded-lg hover:bg-surface-dim transition-colors flex items-center justify-center">
                <MaterialIcon icon={icon} className="text-on-surface-variant" />
              </button>
            ))}
          </div>

          {/* Layout Templates */}
          <h3 className="font-headline font-bold text-lg mb-4">Layout Templates</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="aspect-[3/4] rounded-lg bg-inverse-surface flex items-center justify-center cursor-pointer border-2 border-primary">
              <span className="text-4xl font-headline font-extrabold text-inverse-on-surface opacity-50">1</span>
            </div>
            <div className="aspect-[3/4] rounded-lg bg-surface-container-high flex items-center justify-center cursor-pointer border border-outline-variant/30 hover:border-primary transition-colors">
              <span className="text-4xl font-headline font-extrabold text-on-surface-variant opacity-30">2</span>
            </div>
          </div>

          {/* Print Quality */}
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-sm">Print Quality</span>
            <span className="text-sm text-tertiary font-semibold">Premium Matte</span>
          </div>

          {/* CTAs */}
          <button className="w-full bg-cta-gradient text-white py-4 rounded-lg font-bold text-sm mb-3 hover:opacity-90 transition-opacity">
            Order Print — $45.00
          </button>
          <button className="w-full bg-surface-container-high text-on-surface py-4 rounded-lg font-bold text-sm hover:bg-surface-dim transition-colors">
            Export Digital PDF
          </button>
        </aside>
      </main>
    </div>
  );
}
