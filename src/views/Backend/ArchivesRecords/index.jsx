import { Table, Space, Button, Card, Popconfirm, Input, Typography, Select, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import './index.css'
const { Option } = Select;
const { Text } = Typography;

export default function ArchivesRecords() {
  //表格数据及表格临时数据
  const [data, setData] = useState()
  const [tempData, setTempData] = useState()
  //搜索用Input框的值
  const [value, setValue] = useState()
  const [searchItem, setSearchItem] = useState('phoneNumber')
  //需要搜索功能，因此多一个临时Data
  useEffect(() => {
    axios.get(`http://localhost:8001/records?_expand=cat&bill=2`).then(res => {
      setTempData(res.data)
      setData(res.data)
      console.log(res.data);
    })
  }, [])
  //————————————————————————————————————————————————————表格里面的按钮
  const handleDel = (record) => {
    console.log(record);
    axios.delete(`http://localhost:8001/records/${record}`).then(res => {

      message.info('已成功删除该病历档案')
      setData(tempData.filter(item => {
        return item.id !== record
      }))
      setTempData(tempData.filter(item => {
        return item.id !== record
      }))
    }
    )
  }
  //————————————————————————————————————————————————————子表格内容
  const columnsBill = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: '单价',
      dataIndex: 'sellPrice',
    },
    {
      title: '用量',
      dataIndex: 'useage',
    },
    {
      title: '单项总价',
      dataIndex: 'itemPrice',
      render: (_, record) => { return record.sellPrice * record.useage }
    }
  ];
  //————————————————————————————————————————————————————搜索框
  //搜索框前置变化
  const handleSearch = (value) => {
    setSearchItem(value)
    console.log(searchItem);
  }
  //搜索框前置选项
  const selectBefore = (
    <Select defaultValue="phoneNumber" className="select-before" onChange={handleSearch} >
      <Option value="phoneNumber">电话</Option>
      <Option value="nickname">昵称</Option>
    </Select>
  );
  //查询宠物猫档案——input框值变化
  const handleChange = (e) => {
    const input = e.target.value
    setValue(input)
    if (input) {
      if (searchItem === 'phoneNumber') {
        setData(tempData.filter(item => {
          return item.cat.phoneNumber.includes(input)
        }));
      } else {
        setData(tempData.filter(item => {
          return item.cat.nickname.includes(input)
        }));
      }
    } else {
      setData(tempData)
    }
  };

  //表格显示的内容
  const columns = [
    Table.EXPAND_COLUMN,
    {
      title: '猫咪名字',
      dataIndex: 'cat',
      render: (cat) => { return cat.nickname }
    },
    {
      title: '主人姓名',
      dataIndex: 'cat',
      render: (cat) => { return cat.catOwner }
    },
    {
      title: '联系电话',
      dataIndex: 'cat',
      render: (cat) => { return cat.phoneNumber }
    },
    {
      title: '病历创建时间',
      dataIndex: 'date',
      render: (date) => { return (moment(date).format('YYYY-MM-DD HH:mm')) },
    },
    {
      title: '操作',
      render: (_, record) => {
        return (
          <Popconfirm title="是否删除该宠物猫数据?" onConfirm={() => handleDel(record.id)}>
            <Button danger shape='circle' icon={<DeleteOutlined />} ></Button>
          </Popconfirm>
        )
      }
    }
  ];



  return (

    <div>
      <Space className='search' size={'small'} >
        <Input allowClear='true' className='input' value={value} onChange={(e) => handleChange(e)} addonBefore={selectBefore}></Input>
      </Space>

      <Table
        rowKey={data => data.id}
        size='small'
        columns={columns}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <Space>
                <Card
                  size="small"
                  title="账单情况"
                  style={{
                    width: 360,
                  }}
                >
                  <Table className='table'
                    columns={columnsBill}
                    dataSource={record.billList}
                    pagination={false}

                    bordered
                    summary={(pageData) => {
                      let totalRepayment = 0;
                      pageData.forEach(({ sellPrice, useage }) => {
                        totalRepayment += sellPrice * useage;
                      });
                      return (
                        <>
                          <Table.Summary.Row >
                            <Table.Summary.Cell index={0}>总价</Table.Summary.Cell>
                            <Table.Summary.Cell index={1} colSpan={3}>
                              <Text strong='true' type="danger"><div style={{ float: 'right', marginRight: '5px' }}>{totalRepayment}</div></Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row >
                        </>
                      );
                    }}
                  />
                </Card>
                <Card
                  size="small"
                  title="就诊信息"
                  style={{
                    width: 540,
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: record.diagnosis }} style={{ height: '180px', overflow: 'auto' }} ></div>
                </Card>
              </Space>
            )
          }
        }}
        dataSource={data}
      />
    </div>
  )
}
