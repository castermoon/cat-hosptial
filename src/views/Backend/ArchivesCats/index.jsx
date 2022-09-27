import { Table, Space, Button, Card, Popconfirm, Tooltip, Input, Tag, Form, Modal, DatePicker, Select } from 'antd';
import { SettingOutlined, DeleteOutlined, PlusOutlined, FolderAddTwoTone, AppstoreAddOutlined, PhoneOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import './index.css'
import { useNavigate } from 'react-router-dom';
const { Option } = Select;


export default function ArchivesCats() {
  //表格数据及表格临时数据
  const [data, setData] = useState()
  const [tempData, setTempData] = useState()
  //正在编辑的表格数据
  const [editItem, setEditItem] = useState()
  //搜索用Input框的值
  const [value, setValue] = useState()
  //表单对应的状态：编辑、新增
  const [addOrEdit, setAddOrEdit] = useState('')
  const navi = useNavigate()
  const [form] = Form.useForm();//ANTD官方Form的hook
  //需要搜索功能，因此多一个临时Data
  useEffect(() => {
    axios.get(`http://localhost:8001/cats`).then(res => {
      setTempData(res.data)
      setData(res.data)
    })
  }, [])
  //增加宠物猫档案
  const addArchives = () => {
    setAddOrEdit('add')
    setAddVisible(true);
  }
  //编辑宠物猫档案
  const editArchives = (record) => {
    console.log(record);
    setAddOrEdit('edit');
    setEditItem(record);
    //格式处理 valueof => moment
    let arr1 = record.vaccine !== undefined ? record.vaccine.map(item => {
      return moment(item)
    }) : []
    let arr2 = record.vermifuge !== undefined ? record.vermifuge.map(item => {
      return moment(item)
    }) : []
    let obj = { ...record, birthday: moment(record.birthday), vaccine: arr1, vermifuge: arr2 }
    // console.log(obj);
    form.setFieldsValue(obj)
    setAddVisible(true);
  }
  //删除宠物猫档案
  const handleDel = (id) => {
    axios.delete(`http://localhost:8001/cats/${id}`).then(res => {
      setData(data.filter(item => {
        return item.id !== id
      }))
    })
  };
  //查询宠物猫档案——input框值变化
  const handleChange = (e) => {
    const phone = e.target.value
    setValue(phone)
    if (phone) {
      setData(tempData.filter(item => {
        return item.phoneNumber.includes(phone)
      }));
    } else {
      setData(tempData)
    }
  };
  //创建病历——跳转到病历创建页面
  const addRecord = (cat) => {
    navi('/archives/addrecord', { state: { cat } })
    // console.log(record);
  };

  //Modal对话框
  const [addVisible, setAddVisible] = useState(false);
  const addOk = () => {
    form.validateFields().then(res => {
      // console.log(res);
      //判断是否有输入驱虫和疫苗信息
      let arr1 = res.vaccine !== undefined ? res.vaccine.map(item => {
        return moment(item).valueOf()
      }) : []
      let arr2 = res.vermifuge !== undefined ? res.vermifuge.map(item => {
        return moment(item).valueOf()
      }) : []
      //数据进行格式整理
      let obj = { ...res, birthday: moment(res.birthday).valueOf(), vaccine: arr1, vermifuge: arr2, key: Date.now() }
      // console.log(obj);
      if (addOrEdit === 'add') {
        axios.post(`http://localhost:8001/cats`, obj).then(res => {
          setData([obj, ...tempData])
          setTempData([obj, ...tempData])
        })
      } else {
        // console.log(obj);
        axios.patch(`http://localhost:8001/cats/${editItem.id}`, obj).then(res => {
          //对表格数据进行刷新
          const refresh = (data) => {
            return (
              data.map(item => {
                if (item.id === res.data.id) {
                  item = res.data
                  return item
                } else {
                  return item
                }
              }))
          }
          setData(refresh(data))
          setTempData(refresh(tempData))
        })
      }
      form.resetFields();
      setAddVisible(false);
    }).catch(res => {
      console.log(res);
    })
  };
  const addCancel = () => {
    form.resetFields();
    setAddVisible(false);
  };
  //表格显示的内容
  //验证电话号码格式
  const checkPhone = (_, item) => {
    if (item * 1 < 10000000000 || isNaN(item * 1) || item * 1 > 19999999999) {
      return Promise.reject('输入的电话号码不符合')
    }
  }
  const columns = [
    Table.EXPAND_COLUMN,
    {
      title: '猫咪名字',
      dataIndex: 'nickname',
    },

    {
      title: '生日',
      dataIndex: 'birthday',
      render: (birthday) => { return (moment(birthday).format('YYYY-MM-DD')) },
    },
    {
      title: '主人姓名',
      dataIndex: 'catOwner',
    },
    {
      title: '联系电话',
      dataIndex: 'phoneNumber',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (sex) => { return (sex === 0 ? '母猫' : '公猫') }
    },
    {
      title: '绝育情况',
      dataIndex: 'sterilize',
      render: (sex) => { return (sex === 1 ? <Tag color={'success'}>已绝育</Tag> : <Tag color={'pink'}>未绝育</Tag>) }
    },
    {
      title: '操作',
      render: (_, record) => {
        return (
          <Space size='middle' >
            <Tooltip title="新增病历">
              <Button type='' shape='circle' onClick={() => addRecord(record)} icon={<FolderAddTwoTone />} ></Button>
            </Tooltip>
            <Tooltip title="修改资料">
              <Button type='' shape='circle' onClick={() => editArchives(record)} icon={<SettingOutlined />} ></Button>
            </Tooltip>
            <Popconfirm title="是否删除该宠物猫数据?" onConfirm={() => handleDel(record.id)}>
              <Button danger shape='circle' icon={<DeleteOutlined />} ></Button>
            </Popconfirm>
          </Space>
        )
      }
    }
  ];

  return (
    <div>
      <Space className='search' size={'small'} >
        <Input allowClear='true' className='input' value={value} onChange={(e) => handleChange(e)} addonBefore={<PhoneOutlined />}></Input>
        <Tooltip title="新增猫咪档案">
          <Button shape='circle' onClick={addArchives} icon={<AppstoreAddOutlined />} />
        </Tooltip>
      </Space>

      <Table
        size='small'
        columns={columns}
        expandable={{
          expandedRowRender: (record) => {
            //排序并截取前3位
            let vaccine = record.vaccine.sort(function (a, b) { return b - a }).slice(0, 3)
            let vermifuge = record.vermifuge.sort(function (a, b) { return b - a }).slice(0, 3)
            return (
              <Space>
                <Card
                  size="small"
                  title="近三次疫苗时间"
                  style={{
                    width: 240,
                  }}
                >
                  {vaccine.length > 0 ? vaccine.map(item => <p key={item}>{moment(item).format('YYYY-MM-DD')}</p>) : <p>なし</p>}
                </Card>
                <Card
                  size="small"
                  title="近三次驱虫时间"
                  style={{
                    width: 240,
                  }}
                >
                  {vermifuge.length > 0 ? vermifuge.map(item => <p key={item}>{moment(item).format('YYYY-MM-DD')}</p>) : <p>なし</p>}
                </Card>
              </Space>
            )
          }
        }}
        dataSource={data}
      />
      <Modal title={addOrEdit === 'add' ? "新增宠物信息" : "宠物信息编辑"} visible={addVisible} onOk={addOk} onCancel={addCancel}>
        <Form

          name="basic"
          form={form}
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 16,
          }}
          initialValues={{
            remember: true,
          }}
          autoComplete="off"
          size="small"
        >
          {/* 宠物名 string */}
          <Form.Item
            label="宠物昵称"
            name="nickname"
            rules={[
              {
                required: true,
                message: '请输入宠物昵称!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          {/* 主人名 string */}
          <Form.Item
            label="主人姓名"
            name="catOwner"
            rules={[
              {
                required: true,
                message: '请输入主人姓名！',
              },
            ]}
          >
            <Input />
          </Form.Item>
          {/* 电话 string */}
          <Form.Item
            label="联系电话"
            name="phoneNumber"
            validateTrigger='onBlur'
            rules={[
              {
                required: true,
                message: '请输入联系电话',
              },
              {
                validator: checkPhone,
              }
            ]}
          >
            <Input />
          </Form.Item>
          {/* 性别 num */}
          <Form.Item
            label="性别"
            name="sex"
            rules={[
              {
                required: true,
                message: '请选择性别',
              },
            ]}
          >
            <Select>
              <Option value={1} >公猫</Option>
              <Option value={0}>母猫</Option>
            </Select>
          </Form.Item>
          {/* 绝育 num */}
          <Form.Item
            label="是否绝育"
            name="sterilize"
            rules={[
              {
                required: true,
                message: '请选择是否绝育',
              },
            ]}
          >
            <Select>
              <Option value={1} >已绝育</Option>
              <Option value={0} >未绝育</Option>
            </Select>
          </Form.Item>
          {/* 出生日期 moment */}
          <Form.Item
            label="出生日期"
            name="birthday"
            rules={[
              {
                required: true,
                message: '请选择出生日期',
              },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Form.List name="vaccine" >
            {(fields, { add, remove }) => (
              <>
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    新增疫苗注射时间
                  </Button>
                </Form.Item>
                {fields.map(({ key, name, ...restField }) => (
                  <Space size={'small'} key={key} style={{ float: 'inline-start' }} align="baseline" >
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        {
                          required: true,
                          message: '请选择注射时间',
                        },
                      ]}
                    >
                      <DatePicker style={{ width: 120 }} />
                    </Form.Item>
                    <MinusCircleOutlined style={{ marginRight: 15 }} onClick={() => remove(name)} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.List name="vermifuge" >
            {(fields, { add, remove }) => (
              <>
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    新增驱虫时间
                  </Button>
                </Form.Item>
                {fields.map(({ key, name, ...restField }) => (
                  <Space size={'small'} key={key} style={{ float: 'inline-start' }} align="baseline" >
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        {
                          required: true,
                          message: '请选择驱虫时间',
                        },
                      ]}
                    >
                      <DatePicker style={{ width: 120 }} />
                    </Form.Item>
                    <MinusCircleOutlined style={{ marginRight: 15 }} onClick={() => remove(name)} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>

  )
}
