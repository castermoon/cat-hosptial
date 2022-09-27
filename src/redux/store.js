import { configureStore } from '@reduxjs/toolkit'
import collapseSlice from './reducers/collapseSlice'
import loadingSlice from './reducers/loadingSlice'

const store = configureStore({
  reducer: {
    collapseReducer:collapseSlice,
    loadingReducer:loadingSlice
  },
})

export default store