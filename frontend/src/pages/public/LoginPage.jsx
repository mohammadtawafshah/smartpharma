import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GiMedicines } from 'react-icons/gi'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()

  const [form,     setForm]     = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  // ← If user is already logged in (or JUST logged in), redirect away
  useEffect(() => {
    if (!loading && user) {
      const isAdmin = ['admin', 'super_admin', 'content_admin'].includes(user.role)
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, loading])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      // Navigation is handled by the useEffect above once user state updates
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="bg-primary-600 text-white p-3 rounded-2xl inline-flex mb-4">
            <GiMedicines size={32}/>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your SmartPharma account</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={busy}
              className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SmartPharma Guide · Educational platform only
        </p>
      </div>
    </div>
  )
}
