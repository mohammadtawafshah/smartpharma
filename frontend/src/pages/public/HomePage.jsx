import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiSearch, FiArrowRight, FiShield, FiZap, FiBell } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'
import { mockDrugs, mockHerbs } from '../../utils/mockData'
import DrugCard from '../../components/common/DrugCard'
import HerbCard from '../../components/common/HerbCard'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim().length < 2) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <FiShield size={14}/> Educational · Not medical advice
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Your Smart Pharmacy<br/>
            <span className="text-primary-200">Education Guide</span>
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Search drugs, herbs, interactions, and get proactive safety alerts based on your health profile.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center pl-5 text-gray-400">
                <FiSearch size={20}/>
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for a drug, herb, or medical condition..."
                className="flex-1 px-4 py-4 text-gray-900 text-base focus:outline-none"
              />
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-8 font-semibold text-sm transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Paracetamol','Ibuprofen','Amoxicillin','Ginger','Garlic','Turmeric'].map(term => (
              <button
                key={term}
                onClick={() => navigate(`/search?q=${term}`)}
                className="bg-white/10 hover:bg-white/20 text-white/90 text-sm px-4 py-1.5 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FiZap className="text-primary-600" size={24}/>,
                bg: 'bg-primary-50',
                title: 'Smart Search',
                desc: 'Search by drug name, brand name, generic name, condition, or herb benefit. Handles typos automatically.',
              },
              {
                icon: <FiBell className="text-amber-500" size={24}/>,
                bg: 'bg-amber-50',
                title: 'Proactive Alerts',
                desc: 'Get personalized safety warnings based on your health profile — pregnancy, blood pressure, allergies, and more.',
              },
              {
                icon: <GiHerbsBundle className="text-emerald-600" size={24}/>,
                bg: 'bg-emerald-50',
                title: 'Herbal Alternatives',
                desc: 'Explore scientifically supported herbal alternatives and understand drug–herb interactions safely.',
              },
            ].map((f, i) => (
              <div key={i} className="card text-center hover:shadow-md transition-shadow">
                <div className={`${f.bg} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DRUGS ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 text-primary-600 p-2 rounded-xl">
                <GiMedicines size={22}/>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Drug Directory</h2>
                <p className="text-gray-500 text-sm">Common medications with safety information</p>
              </div>
            </div>
            <Link to="/drugs" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-semibold">
              View all <FiArrowRight size={15}/>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockDrugs.slice(0, 3).map(drug => (
              <DrugCard key={drug.id} drug={drug}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED HERBS ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                <GiHerbsBundle size={22}/>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Herb Encyclopedia</h2>
                <p className="text-gray-500 text-sm">Medicinal herbs, benefits, and safety information</p>
              </div>
            </div>
            <Link to="/herbs" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-semibold">
              View all <FiArrowRight size={15}/>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockHerbs.slice(0, 3).map(herb => (
              <HerbCard key={herb.id} herb={herb}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Get Personalised Safety Alerts</h2>
          <p className="text-primary-200 mb-8 text-lg">
            Create a free account and fill in your health profile to receive proactive warnings when browsing drugs and herbs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 text-base px-8 py-3">
              Create Free Account
            </Link>
            <Link to="/about" className="btn-secondary bg-transparent border-white/30 text-white hover:bg-white/10 text-base px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
