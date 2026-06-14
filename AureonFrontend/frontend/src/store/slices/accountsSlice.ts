import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/api/axiosInstance'

export interface Account {
  accountId: string
  accountName: string
  accountType: string
  balance: number
  currency: string
  status: string
}

interface AccountsState {
  items: Account[]
  loading: boolean
  error: string | null
}

const initialState: AccountsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching accounts from /api/accounts...')
      const res = await api.get('/accounts')
      console.log('Accounts response data:', res.data)
      return res.data?.data || res.data
    } catch (err: any) {
      // Fallback if /accounts is forbidden
      if (err.response?.status === 403) {
        try {
          console.log('403 on /accounts, trying fallback /api/user/accounts...')
          const res2 = await api.get('/user/accounts')
          console.log('Fallback accounts response data:', res2.data)
          return res2.data?.data || res2.data
        } catch (err2: any) {
          console.error('Failed both account endpoints:', err2)
        }
      }
      console.error('Failed to fetch accounts:', err)
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch accounts')
    }
  }
)

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default accountsSlice.reducer
