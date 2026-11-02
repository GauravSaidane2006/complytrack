import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: (() => {
    try { return JSON.parse(sessionStorage.getItem('user')) } catch { return null }
  })(),
  accessToken: null,
  organization: (() => {
    try { return JSON.parse(sessionStorage.getItem('organization')) } catch { return null }
  })(),
  isAuthenticated: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, organization } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.organization = organization || state.organization
      state.isAuthenticated = true
      sessionStorage.setItem('user', JSON.stringify(user))
      if (organization) sessionStorage.setItem('organization', JSON.stringify(organization))
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.organization = null
      state.isAuthenticated = false
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('organization')
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      sessionStorage.setItem('user', JSON.stringify(state.user))
    }
  }
})

export const { setCredentials, setAccessToken, logout, updateUser } = authSlice.actions
export default authSlice.reducer
