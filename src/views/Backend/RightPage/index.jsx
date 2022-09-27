import { Switch, Table, Tag } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function RightPage() {
  const [data, setData] = useState()
  const [userinfo, setUserinfo] = useState()
  //从token中解构rightsId和id
  const { rightsId, id } = JSON.parse(localStorage.getItem('token'))

  //Switch变化时
  const handlechange = (checked, record) => {
    let obj = userinfo;
    // 选中时在showed数组中添加该行的key
    if (checked) {
      obj.showed.push(record.key)
    } else {      // 未选中时在showed数组中剔除该行的key
      obj.showed = obj.showed.filter(item=>{
        return item !== record.key
      }
      )
    }
    //更新userinfo
    setUserinfo(obj)
    //将更新后的数据发送至json
    axios.patch(`http://localhost:8001/staff/${id}`,{
      showed:obj.showed
    })
    // console.log(obj.showed);
  }
  //表格展示的内容
  const columns = [
    {
      title: '页面',
      dataIndex: 'title',
    },
    {
      title: 'Rank',
      dataIndex: 'rank',
      render: (rank) => {
        return (
          <Tag color={rank === 1 ? 'gold' : 'blue'}>{rank === 1 ? 'Rank-1' : 'Rank-2'}</Tag>
        )
      }
    },
    {
      title: 'Router',
      dataIndex: 'key',
      render: (key, record) => {
        return (
          <Tag color={record.rank === 1 ? 'gold' : 'blue'}>{key}</Tag>
        )
      }
    },
    {
      title: '显示状态',
      // dataIndex: 'showed',
      render: (_, record) => {
        return (
          userinfo !== undefined?<Switch
            size="small"
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked={userinfo.showed.includes(record.key)}
            onChange={(checked) => handlechange(checked, record)}
          /> :<></> )
      }
    },
  ];

  useEffect(() => {
    //模拟本地拿到用户id和irghtsId
    axios.get(`http://localhost:8001/rights/${rightsId}`).then(res => {
      // console.log(res.data);
      let arr = []
      //筛除根路径无权限的项,然后加载到表格中
      arr = res.data.children.filter(child => {
        child.children = child.children.filter(item => {
          return item.right === 1
        })
        return child.right === 1
      })
      setData(arr)
    })
    //获取用户信息：隐藏、显示那些页面
    axios.get(`http://localhost:8001/staff/${id}`).then(res => {
      // console.log(res.data);
      setUserinfo(res.data)
    })
  }, [id,rightsId])

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
      />
    </>
  );
}

