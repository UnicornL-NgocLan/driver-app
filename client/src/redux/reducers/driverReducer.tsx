import { createSlice } from '@reduxjs/toolkit'


const initialState : any[] = [];

export const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    getDrivers: (state,action) => {
      state = action.payload
      return state;
    }
  },
})

// Action creators are generated for each case reducer function
export const { getDrivers } = driverSlice.actions

export default driverSlice.reducer