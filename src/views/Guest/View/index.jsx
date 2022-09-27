import { Input, Button, Table, message, Form } from 'antd';

import { PhoneFilled, GithubOutlined } from '@ant-design/icons';
import React from 'react'
import axios from 'axios';
import { useState } from 'react';
import moment from 'moment';
import './index.css'
import { useEffect } from 'react';


export default function Appointment() {
  const [doctorList, setDoctorList] = useState([])
  const [data, setData] = useState([])
  const guest = localStorage.getItem('guest')
  // console.log(guest);
  useEffect(() => {
    if (guest) {
      axios.get(`http://localhost:8001/records?_expand=cat&date_gte=${Date.now()}`).then(res => {
        setData(res.data.filter(record => {
          return record.cat.phoneNumber === guest
        }));
      })
      axios.get(`http://localhost:8001/staff`).then(res => {
        let arr = []
        res.data.forEach(item => {
          arr[item.id] = item.name
        })
        setDoctorList(arr);
      })
    }
  }, [guest])


  const delAppointment = (record) => {
    axios.delete(`http://localhost:8001/records/${record.id}`).then(res => {
      message.info('已经成功取消该次预约')
      setData(data.filter(item => {
        return item.id !== record.id
      }))
    })
  }
  const columns = [
    {
      title: '预约时间',
      dataIndex: 'date',
      key: 'time',
      render: (time) => (moment(time).format('M月DD日HH时'))
    },
    {
      title: '医生',
      dataIndex: 'staffId',
      key: 'staffId',
      render: (staffId) => { return doctorList[staffId] }
    },
    {
      title: '宠物名',
      dataIndex: 'cat',
      render: (cat) => cat.nickname
    },
    {
      title: '操作',
      render: (_, record) => (<Button onClick={() => delAppointment(record)} >取消预约</Button>)
    },
  ];


  //登陆完成
  const onFinish = (values) => {
    axios.get(`http://localhost:8001/cats?phoneNumber=${values.phoneNumber}&nickname=${values.nickname}`).then(res => {
      if (res.data[0]) {
        message.success('成功登陆，正在跳转。')
        localStorage.setItem('guest', res.data[0].phoneNumber)
        setTimeout(() => {
          axios.get(`http://localhost:8001/records?_expand=cat&date_gte=${Date.now()}`).then(res => {
            if(res.data){
              message.error('没有查询到预约记录')
            }
            setData(res.data.filter(record => {
              return record.cat.phoneNumber === values.phoneNumber
            }));
          })
          axios.get(`http://localhost:8001/staff`).then(res => {
            let arr = []
            res.data.forEach(item => {
              arr[item.id] = item.name
            })
            setDoctorList(arr);
          })
        }, 500);
      } else {
        message.error('未查询到信息，请确认输入是否正确或到预约界面进行预约')
      }
    })
  };

  localStorage.getItem('guest')
  return (
    <div>
      {guest ?  <></>:<div className='login'>
        <Form
          name="basic"
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 26,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: '请输入手机号码!',
              },
            ]}
          >
            <Input placeholder="请输入手机号码" prefix={<PhoneFilled />} />
          </Form.Item>

          <Form.Item
            name="nickname"
            rules={[
              {
                required: true,
                message: '请输入宠物昵称!',
              },
            ]}
          >
            <Input placeholder="请输入任意一只宠物的昵称" prefix={<GithubOutlined />} />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 0,
              span: 26,
            }}
          >
            <Button type="primary" htmlType="submit">
              游客登陆
            </Button>
          </Form.Item>
        </Form>
      </div> }
      {guest ? <Table columns={columns} dataSource={data} rowKey={data => data.id} />:<></>}
    </div>
  )
}
