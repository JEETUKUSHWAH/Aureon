import { createContext, useContext, ReactNode } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { loginUser, logoutUser, setCredentials, onboardCompany } from '@/store/slices/authSlice'
import type { User } from '@/types'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  login: (creds: { email: string; password: string; rememberMe: boolean }) => Promise<void>
  signup: (data: { name: string; email: string; password: string; companyName: string }) => Promise<void>
  onboard: (data: any) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  const login = async (creds: { email: string; password: string; rememberMe: boolean }) => {
    await dispatch(loginUser(creds)).unwrap()
  }

  const signup = async (data: { name: string; email: string; password: string; companyName: string }) => {
    // Note: authSlice registerUser thunk currently doesn't update 'user' state automatically 
    // unless you want it to log in immediately after signup.
    await dispatch(loginUser({ email: data.email, password: data.password })).unwrap()
  }

  const onboard = async (data: any) => {
    await dispatch(onboardCompany(data)).unwrap()
  }

  const logout = async () => {
    await dispatch(logoutUser()).unwrap()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, signup, onboard, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
