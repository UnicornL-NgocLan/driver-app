import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'


const initialState : null | {[key:string]:any} = null;

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addAuth: (state,action) => {
      state = action.payload
      return state;
    },
    addDriver: (state,action) => {
      if(state){
        (state as {[key:string]:any}).driver = action.payload
      }
      return state;
    }
  },
})

// Action creators are generated for each case reducer function
export const { addAuth,addDriver } = authSlice.actions

export default authSlice.reducer