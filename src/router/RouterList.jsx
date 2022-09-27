import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Guest from '../views/Guest'
import Login from '../views/Login'
import NotFound from '../views/NotFound'
import Appointment from '../views/Guest/Appointment';
import View from '../views/Guest/View';
import Doctor from '../views/Guest/Doctor';
import Register from '../views/Guest/Register';
import UserEdit from "../views/Backend/UserEdit";
import Backend from "../views/Backend";
import UserList from "../views/Backend/UserList";
import UserAdd from "../views/Backend/UserAdd";
import RightRole from "../views/Backend/RightRole";
import RightPage from "../views/Backend/RightPage";
import InStockList from "../views/Backend/InStockList";
import InstockPricing from "../views/Backend/InstockPricing";
import TodoDoctor from "../views/Backend/TodoDoctor";
import TodoAssistant from "../views/Backend/TodoAssistant";
import TodoReserve from "../views/Backend/TodoReserve";
import ArchivesAddrecord from "../views/Backend/ArchivesAddrecord";
import ArchivesCats from "../views/Backend/ArchivesCats";
import ArchivesRecords from "../views/Backend/ArchivesRecords";
import Test from "../views/test";

//路由映射表
const routeList = {
    "/user/list": <UserList />,
    "/user/add": <UserAdd />,
    "/user/edit": <UserEdit />,
    "/right/role": <RightRole />,
    "/right/page": <RightPage />,
    "/inStock/list": <InStockList />,
    "/inStock/pricing": <InstockPricing />,
    "/todo/doctor": <TodoDoctor />,
    "/todo/assistant": <TodoAssistant />,
    "/todo/reserve": <TodoReserve />,
    "/archives/cats": <ArchivesCats />,
    "/archives/records": <ArchivesRecords />,
    "/archives/addrecord": <ArchivesAddrecord />,
}

export default function RouterList() {
    const [routerList, setRouterList] = useState([])
    let token = localStorage.getItem('token')
    // console.log(token)
    //获取权限数组
    useEffect(() => {

        // console.log(token);
        if (token !== null) {
            const tokenJSON = JSON.parse(token).rights
            let arr = []
            if (tokenJSON.right === 1) {
                tokenJSON.children.forEach(item => {
                    //如果有1级目录需要链接页面的，在这里修改判断、目前没有
                    if (item.right === 1) {
                        item.children.forEach(item => {
                            if (item.right === 1) {
                                // arr = [...arr, item.key]
                                arr.push(item.key)
                            }
                        })
                    }
                })
            }
            setRouterList(arr)
        }

    }, [token])

    return (
        [
            {
                path: '/', element: token !== null ? <Backend /> : <Navigate to='/login' />,
                children: [
                    ...routerList.map(item => {
                        return ({
                            path: item,
                            element: routeList[item]
                        })
                    }),
                    { path: '/', element: <Navigate to='/user/edit' /> },
                ]
            },
            { path: '/login', element: <Login /> },
            {
                path: '/guest', element: <Guest />,
                children: [{
                    path: '/guest/appointment',
                    element: <Appointment />
                },
                {
                    path: '/guest/view/',
                    element: <View />
                },
                {
                    path: '/guest/register',
                    element: <Register />
                },
                {
                    path: '/guest/doctor/:id',
                    element: <Doctor />
                }
                ]
            },
            { path:"/test",element: <Test/>},
            { path: '*', element: <NotFound /> },
        ]
    )
}
