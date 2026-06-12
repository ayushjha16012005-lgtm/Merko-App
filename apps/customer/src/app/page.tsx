import Link from 'next/link';

export default function HomePage() {
  const categories = [
    { name: 'ID Cards', desc: 'Employee badges & visitor passes', icon: '💳' },
    { name: 'Branded T-Shirts', desc: 'Custom printed apparel', icon: '👕' },
    { name: 'Custom Mugs', desc: 'Corporate gifting & personal souvenirs', icon: '☕' },
    { name: 'Event Banners', desc: 'Wide format vinyl signboards', icon: '🚩' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-slate-900 text-white overflow-hidden py-20 px-8 md:px-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-indigo-500/20 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <span className="inline-block bg-indigo-500/20 text-indigo-300 font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
            Merko Printing Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Professional Custom Printing <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
              In Under 5 Minutes
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Browse, customize, live-preview, and order custom physical goods like badges, mugs, and apparel with zero developer delay.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
            >
              Browse Customizable Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How It Works</h2>
          <p className="text-slate-500">Simplify your custom merchandising workflow in three steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: '1. Select Product & Variant',
              desc: 'Choose from cards, apparel, and corporate accessories in standard sizing or premium finishes.',
              step: '01',
            },
            {
              title: '2. Design in Real-Time',
              desc: 'Inject text, logos, and custom graphics into our live-rendering editor canvas with instant preview feedback.',
              step: '02',
            },
            {
              title: '3. Instant Production Dispatch',
              desc: 'Submit your order and trace fulfillment through our dashboard pipeline from production to door-step delivery.',
              step: '03',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors"
            >
              <span className="absolute right-4 top-4 text-7xl font-extrabold text-slate-100 select-none group-hover:text-indigo-50/70 transition-colors">
                {item.step}
              </span>
              <div className="relative space-y-4">
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Popular Categories</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white border border-slate-100 p-6 rounded-2xl flex items-start space-x-4 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer"
            >
              <span className="text-4xl">{cat.icon}</span>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
