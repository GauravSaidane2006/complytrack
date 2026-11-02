import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { api } from './api/api'

const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
})

export default store
