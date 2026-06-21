import { FiShield, FiSearch, FiBell } from 'react-icons/fi'
import { GiMedicines, GiHerbsBundle } from 'react-icons/gi'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="text-center mb-12">
        <div className="bg-primary-100 text-primary-600 p-4 rounded-3xl inline-flex mb-5">
          <GiMedicines size={40}/>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About SmartPharma Guide</h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
          A smart educational web platform bridging pharmaceutical knowledge and herbal medicine.
        </p>
      </div>

      {/* Disclaimer box */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-10">
        <div className="flex items-start gap-3">
          <FiShield className="text-amber-600 flex-shrink-0 mt-1" size={22}/>
          <div>
            <h3 className="font-bold text-amber-800 text-lg mb-2">Important Disclaimer</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              SmartPharma Guide is an <strong>educational platform only</strong>. All information provided is for
              general educational purposes and does not constitute medical advice, diagnosis, or treatment.
              Always consult a licensed doctor or pharmacist before making any health or medication decisions.
              Do not self-medicate based on information from this website.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {[
          { icon: <FiSearch className="text-primary-600" size={22}/>, bg: 'bg-primary-50', title: 'Smart Search', desc: 'Full-text search across drugs, herbs, and medical conditions with typo tolerance.' },
          { icon: <FiBell className="text-amber-500" size={22}/>, bg: 'bg-amber-50', title: 'Proactive Alerts', desc: 'Personalized safety alerts based on your health profile — pregnancy, hypertension, allergies.' },
          { icon: <GiHerbsBundle className="text-emerald-600" size={22}/>, bg: 'bg-emerald-50', title: 'Herbal Knowledge', desc: 'In-depth information on medicinal herbs, preparation methods, and drug–herb interactions.' },
        ].map((f, i) => (
          <div key={i} className="card text-center">
            <div className={`${f.bg} w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3`}>{f.icon}</div>
            <h3 className="font-bold text-gray-900 mb-2 text-sm">{f.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Development Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { name: 'Renad Ahmed Husein', id: '202216595' },
            { name: 'Sara Awni Qundah', id: '202216195' },
            { name: 'Mohammad Abd Al-baset Asfour', id: '202216169' },
          ].map((member, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                {member.name[0]}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">{member.id}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
          <p><strong>Supervisor:</strong> Mohammad Aodah</p>

        </div>
      </div>
    </div>
  )
}
