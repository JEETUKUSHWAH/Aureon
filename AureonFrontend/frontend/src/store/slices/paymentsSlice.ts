import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/api/axiosInstance'

export interface Payment {
  id: string
  amount: number
  category: string
  date: string
  details: string
  status: 'completed' | 'pending' | 'failed' | string
  vendor?: string
  method?: string
}

interface PaymentsState {
  items: Payment[]
  loading: boolean
  error: string | null
}

const initialState: PaymentsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (_, { rejectWithValue, getState }) => {
    const state: any = getState()
    const companyId = state.auth.user?.companyId
    
    try {
      console.log('Fetching payments from /api/payments...')
      const res = await api.get('/payments')
      console.log('Payments response raw:', res.data)
      
      // Aggressive array discovery
      let data = res.data?.data || res.data?.content || res.data?.payments || res.data?.list || res.data
      if (!Array.isArray(data) && typeof data === 'object') {
        // Look for any array inside the object
        const firstArray = Object.values(data).find(v => Array.isArray(v))
        if (firstArray) data = firstArray
      }
      
      return Array.isArray(data) ? data : []
    } catch (err: any) {
      // Fallback if /payments is forbidden
      if (err.response?.status === 403) {
        const endpoints = [
          '/user/payments',
          '/transactions',
          companyId ? `/payments/company/${companyId}` : null,
          companyId ? `/api/payments/company/${companyId}` : null
        ].filter(Boolean) as string[]

        for (const endpoint of endpoints) {
          try {
            console.log(`Trying fallback endpoint: ${endpoint}...`)
            const res = await api.get(endpoint)
            console.log(`Success on ${endpoint} raw:`, res.data)
            
            let data = res.data?.data || res.data?.content || res.data?.payments || res.data?.list || res.data
            if (!Array.isArray(data) && typeof data === 'object') {
               const firstArray = Object.values(data).find(v => Array.isArray(v))
               if (firstArray) data = firstArray
            }
            
            if (Array.isArray(data)) return data
          } catch (e) {
            console.warn(`Failed endpoint ${endpoint}`)
          }
        }
      }
      console.error('Failed all payment/transaction endpoints')
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch payments')
    }
  }
)

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default paymentsSlice.reducer
