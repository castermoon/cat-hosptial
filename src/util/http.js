import axios from "axios";
import store from '../redux/store'
import {changeMode} from '../redux/reducers/loadingSlice'

// axios.defaults.baseURL = "http://localhost:8001"

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    store.dispatch(changeMode(true))
    // console.log(store.getState().loadingReducer.isLoading)
    return config;
  }, function (error) {
    // 对请求错误做些什么
    // 可以考虑navi
    return Promise.reject(error);
  });

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    store.dispatch(changeMode(false))
    return response;
  }, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    // 可以考虑navi
    return Promise.reject(error);
  });
