import { createSlice } from '@reduxjs/toolkit'


const initialState : any[] = [];

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    getCompanies: (state,action) => {
      state = action.payload
      return state;
    }
  },
})

// Action creators are generated for each case reducer function
export const { getCompanies } = companySlice.actions

export default companySlice.reducer