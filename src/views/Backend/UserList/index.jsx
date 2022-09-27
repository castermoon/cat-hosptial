import { Avatar, Button, List, Space, Tag, Modal } from 'antd';
import { SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment'
import { useNavigate } from 'react-router-dom';




export default function UserList() {
  // List数据
  const [data, setData] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false);
  //正在编辑的用户信息
  const [userInfo, setUserInfo] = useState()
  const navi = useNavigate()
  //映射数组
  const color = ['', 'red', 'geekblue', 'green','']
  const catagaki = ['', '院长', '医生', '助理','未分配']
  useEffect(() => {
    axios.get(`http://localhost:8001/staff`).then(res => {
      // console.log(res.data);
      setData(res.data)
    })
  }, [])

  const showModal = () => {
    setIsModalVisible(true);
  };
  //删除用户、更新页面
  const handleOk = () => {
    console.log(userInfo);
    axios.delete(`http://localhost:8001/staff/${userInfo.id}`).then(
      setData(data.filter(item => {
        return item.id !== userInfo.id
      }))
    )
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDel = (item) => {
    setUserInfo(item);
    showModal()
  }
  const handleEdit = (item) => {
    navi('/user/edit', {state:{ item: item,type: "edit" }})
    // console.log(item);
}
return (
  <div>
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Space size='middle' >
              <Button type='primary' shape='circle' onClick={() => handleEdit(item)} icon={<SettingOutlined />} ></Button>
              <Button danger shape='circle' onClick={() => handleDel(item)} icon={<DeleteOutlined />} ></Button>
            </Space>]}>
          <List.Item.Meta
            avatar={<Avatar src={item.avatar} />}
            title={<span>{item.name}</span>}
            description={
              <>
                <span>{`入职时间:${moment(item.key).format('YYYY-MM-DD')}`}</span>
                <span style={{ padding: '54px' }} ><Tag color={color[item.rolesId]}>{catagaki[item.rolesId]}</Tag></span>
                <span >{`用户名：${item.username}`}</span>
              </>
            }
          />
        </List.Item>
      )}
    />
    <Modal title="删除确认" open={isModalVisible} okButtonProps={{ type: '', danger: true }} onOk={handleOk} onCancel={handleCancel}>
      <span>是否删除该员工信息</span>
    </Modal>
  </div>
)
};

