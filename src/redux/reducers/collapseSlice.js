import {createSlice} from '@reduxjs/toolkit'
//设置状态的初始值
const initialState = {
    collapse : false,
}
//使用createSlice方法创建一个Slice
export const collapseSlice = createSlice({
    //第一个对象是name？用处？？
    name:'collapse',
    //第二个对象是初始值
    initialState,
    //第三个对象是reducers 可以写入多个方法
    reducers:{
        //方法中默认传入的第一个参数就是initialState，第二个值是action。
        //可以通过action.payload获得传入的payload（参数）
        onClick:(state)=>{
            state.collapse = !state.collapse
        }
    }
})
//创建一个actions，actions值就是
export const {onClick} = collapseSlice.actions
//最后将创建好的Slice当中的reducer暴露出去
export default collapseSlice.reducer