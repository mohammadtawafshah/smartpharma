import { Link } from 'react-router-dom'
import { GiMedicines } from 'react-icons/gi'
import { FiAlertTriangle } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Disclaimer banner */}
      <div className="bg-amber-500/10 border-t border-amber-500/30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-start gap-3 text-amber-200 text-xs">
          <FiAlertTriangle className="flex-shrink-0 mt-0.5" size={14}/>
          <p>
            <strong>Educational Disclaimer:</strong> SmartPharma Guide provides general educational information only.
            This website does not diagnose conditions, prescribe medications, or replace professional medical advice.
            Always consult a licensed doctor or pharmacist before making any health decisions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                <GiMedicines size={18}/>
              </div>
              <span className="font-bold text-white text-base">
                Smart<span className="text-primary-400">Pharma</span> Guide
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              A smart educational pharmacy platform connecting pharmaceutical knowledge with herbal medicine.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/"      className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/drugs" className="hover:text-white transition-colors">Drug Directory</Link></li>
              <li><Link to="/herbs" className="hover:text-white transition-colors">Herb Encyclopedia</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About the Project</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login"    className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/profile/health" className="hover:text-white transition-colors">Health Profile</Link></li>
              <li><Link to="/favorites"      className="hover:text-white transition-colors">My Favorites</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} SmartPharma Guide
        </div>
      </div>
    </footer>
  )
}
