import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    isLoading : false
}

const isLoadingSlice = createSlice({
    name:'isLoading',
    initialState,
    reducers:{
    //从第二个参数action中获得传递的参数payload
        changeMode:(state,action)=>{
            state.isLoading = action.payload
        }
    }
})

export const {changeMode} = isLoadingSlice.actions

export default isLoadingSlice.reducer