import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { User, AuthState } from '@/types'
import api from '@/api/axiosInstance'

const stored = localStorage.getItem('auth')
const initialState: AuthState = stored
  ? JSON.parse(stored)
  : { user: null, accessToken: null, isAuthenticated: false, loading: false }

// ── Thunks ───────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/login',
  async (creds: { email: string; password: string; rememberMe?: boolean; otp?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', creds)
      return res.data.data
    } catch (err: any) {
      // Check status code for specific error cases
      if (err.response?.status === 401 || err.response?.status === 404) {
        return rejectWithValue('Invalid credentials')
      }
      const message = err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string; companyName: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data)
      return res.data.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Registration failed')
    }
  }
)

export const onboardCompany = createAsyncThunk(
  'auth/onboardCompany',
  async (data: any, { rejectWithValue }) => {
    try {
      console.log('Onboarding company with payload:', data)
      const res = await api.post('/companies/onboard_company', data)
      return res.data.data || res.data
    } catch (err: any) {
      console.error('Onboarding error:', err)
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Onboarding failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/auth/logout')
      const data = res.data?.message || res.data
      if (data === 'Logged out' || res.status === 200) {
        dispatch(logout())
        return data
      }
      return rejectWithValue('Logout failed on server')
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data || 'Logout failed'
      return rejectWithValue(message)
    }
  }
)

export const fetchCompanyDetails = createAsyncThunk(
  'auth/fetchCompanyDetails',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching company details from /api/companies/me...')
      const res = await api.get('/companies/me')
      console.log('Company details response:', res.data)
      // Flexible with response structure
      return res.data?.data || res.data
    } catch (err: any) {
      console.error('Failed to fetch company details:', err)
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch company details')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('auth')
    },
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      localStorage.setItem('auth', JSON.stringify(state))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,    (s) => { s.loading = true })
      .addCase(loginUser.fulfilled,  (s, a) => {
        s.loading = false
        s.user = a.payload.user || a.payload
        // Preserve login email specifically as ownerEmail
        if (s.user) {
          s.user.ownerEmail = a.payload.email || a.payload.user?.email || a.payload.username || a.payload.userEmail
        }
        s.accessToken = a.payload.accessToken || a.payload.token || a.payload.jwt
        s.isAuthenticated = true
        localStorage.setItem('auth', JSON.stringify(s))
      })
      .addCase(loginUser.rejected,   (s) => { s.loading = false })
      .addCase(registerUser.rejected,  (s) => { s.loading = false })
      .addCase(onboardCompany.pending,   (s) => { s.loading = true })
      .addCase(onboardCompany.fulfilled, (s, a) => {
        s.loading = false
        // Automatically log in after onboarding if token is returned
        if (a.payload.accessToken || a.payload.token || a.payload.jwt) {
          s.user = a.payload.user || a.payload
          s.accessToken = a.payload.accessToken || a.payload.token || a.payload.jwt
          s.isAuthenticated = true
          localStorage.setItem('auth', JSON.stringify(s))
        }
      })
      .addCase(onboardCompany.rejected,  (s) => { s.loading = false })
      .addCase(logoutUser.fulfilled,   (s) => {
        s.user = null
        s.accessToken = null
        s.isAuthenticated = false
      })
      .addCase(fetchCompanyDetails.fulfilled, (s, a) => {
        let companyData = a.payload
        // Handle array response from /companies/me
        if (Array.isArray(a.payload)) {
          companyData = a.payload[0]
        }

        if (s.user && companyData) {
          console.log('Updating state with company data:', companyData)
          // Store the company name
          s.user.companyName = companyData.displayName || companyData.companyName || companyData.name || s.user.companyName
          // Merge other metadata
          s.user = { ...s.user, ...companyData }
          localStorage.setItem('auth', JSON.stringify(s))
        }
      })
  },
})

export const { logout, setCredentials } = authSlice.actions
export default authSlice.reducer
