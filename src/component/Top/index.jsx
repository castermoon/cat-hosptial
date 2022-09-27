import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Layout, Avatar, Dropdown, Menu,Modal, message } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css'
import { useSelector, useDispatch } from 'react-redux'
import { onClick } from '../../redux/reducers/collapseSlice'

const { Header } = Layout;

export default function Top() {
  // const [collapsed, setCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  //使用useSelector拿到store里面的state某个reducer的initialState值，格式为state.reducerObjectKey
  const collapseReducer = useSelector(state => state.collapseReducer)
  //通过dispatch调用Slice中导入的方法，如dispatch(onClick())
  const dispatch = useDispatch()
  const navi = useNavigate()
  //点击退出后显示对话框
const handleClick = ()=>{
  setIsModalVisible(true)
}
//对话框确定和取消
const handleOk = () => {
  localStorage.removeItem('token')
  message.info('成功退出，正在转到登陆页面')
  setTimeout(() => {
    navi('/login')
  }, 1000);
  setIsModalVisible(false);
};
const handleCancel = () => {
  setIsModalVisible(false);
};
  const menu = (
    <Menu
      items={[
        {
          key: '1',
          danger: true,
          label: '退出登陆',
          onClick:handleClick
        },
      ]}
    />
  );
  return (
    <div className='top'>
      <Header
        className="site-layout-background"
        style={{
          padding: 0,
        }}
      >
        {React.createElement(collapseReducer.collapse ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: 'trigger',
          onClick: () => {dispatch(onClick())
            console.log(collapseReducer);},
        })}
        <Dropdown overlay={menu}>
          <span className='avatar'>
            <Avatar src="https://joeschmoe.io/api/v1/random" />
          </span>
        </Dropdown>
      </Header>
      <Modal title="退出登陆"
      open={isModalVisible} onOk={handleOk} onCancel={handleCancel} okType='danger'>
        <p>是否退出登陆？</p>
      </Modal>
    </div>
  )
}
