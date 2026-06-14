import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import accountsReducer from './slices/accountsSlice'
import paymentsReducer from './slices/paymentsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    payments: paymentsReducer,
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
