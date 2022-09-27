import { FolderAddTwoTone, DeleteOutlined, SettingOutlined, SettingTwoTone, AppstoreAddOutlined, ExclamationCircleOutlined, MinusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag, Tooltip, Modal, Form, Input, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash'

const toInt = (number) => {
  return Math.floor(number)
}

export default function InStockList() {
  const staff = JSON.parse(localStorage.getItem('token')).name
  //主表格数据
  const [dataSource, setDataSource] = useState()
  //删除框的状态
  const [delState, setDelState] = useState('')
  //表单对应编辑、删除
  const [addOrEdit, setAddOrEdit] = useState('')
  //目前正在编辑的item
  const [editItem, setEditItem] = useState()
  //药品表单
  const [form] = Form.useForm();
  //入库表单
  const [formInbound] = Form.useForm();
  useEffect(() => {
    axios.get("http://localhost:8001/inStocks?_embed=inbound&type=1").then(res => {
      setDataSource(res.data)
    })
  }, [])

  //是否删除「药品和入库信息」的对话框可见状态及回调函数
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleOk = () => {
    if (delState === 'inStocks') {
      axios.delete(`http://localhost:8001/inStocks/${editItem.id}`)
      setDataSource(dataSource.filter(item => {
        return item.id !== editItem.id
      }))
    }
    if (delState === 'inbound') {
      //删除单次入库数据、更新库存
      axios.delete(`http://localhost:8001/inbound/${editItem.id}`).then(res=>{
        axios.get(`http://localhost:8001/inStocks/${editItem.inStockId}`).then(res2=>{
          axios.patch(`http://localhost:8001/inStocks/${editItem.inStockId}`,{amount:res2.data.amount-editItem.amount})
        })
      })
      // axios.patch(`http://localhost:8001/inStocks/${editItem.inStockId}`,{amount:})
      let arr = dataSource
      arr.forEach(item => {
        item.inbound = item.inbound.filter(res => {
          return res.id !== editItem.id
        })
      })
      //因为以上修改的是dataSource的子集，所以其实页面已经生效，但为便于理解，再次设置dataSource
      setDataSource(arr)
    }
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  //新增、修改「药品信息」的对话框可见状态及回调函数
  const [addVisible, setAddVisible] = useState(false);
  const addOk = () => {
    form.validateFields().then(res => {
      if (addOrEdit === 'add') {
        axios.post(`http://localhost:8001/inStocks`, { ...res, type: 1, consumed: 0, amount: 0, key: Date.now() }).then(
          res => {
            setDataSource([...dataSource, { ...res.data, inbound: [] }])
          })
      } else {
        axios.patch(`http://localhost:8001/inStocks/${editItem.id}`, res).then(res => {
          setDataSource(dataSource.map(item => {
            if (item.id === res.data.id) {
              item = { ...item, sellPrice: res.data.sellPrice, name: res.data.name, brand: res.data.brand }
              return item
            } else {
              return item
            }
          }));
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

  //新增、修改「入库信息」的对话框可见状态及回调函数
  const [inboundVisible, setInboundVisible] = useState(false);
  const inboundOk = () => {
    formInbound.validateFields().then(res => {
      if (addOrEdit === 'add') {
        axios.post(`http://localhost:8001/inbound`, { ...res, key: Date.now(), staff: staff, inStockId: editItem.id, }).then(res2 => {
          // console.log(res2);
          //更新页面
          let arr = _.cloneDeep(dataSource)
          arr = arr.map(item => {
            if (item.id === editItem.id) {
              item.inbound.push(res2.data)
            }
            return item
          })
          setDataSource(arr)
          //更新单次入库数据时、更新库存
          axios.get(`http://localhost:8001/inStocks/${editItem.id}`).then(getIS=>{
            axios.patch(`http://localhost:8001/inStocks/${editItem.id}`,{amount:getIS.data.amount+res2.data.amount})
          })
        })
      } else {
        // console.log(res);
        console.log(editItem);
        axios.patch(`http://localhost:8001/inbound/${editItem.id}`, res).then(res => {
          setDataSource(dataSource.map(item => {
            item.inbound = item.inbound.map(item2 => {
              if (item2.id === editItem.id) {
                item2 = res.data
              }
              return item2
            })
            return item
          }))
          // console.log(res);
          axios.get(`http://localhost:8001/inStocks/${editItem.inStockId}`).then(res2=>{
            axios.patch(`http://localhost:8001/inStocks/${editItem.inStockId}`,{amount:res2.data.amount-editItem.amount+res.data.amount})
          })
          // axios.patch(`http://localhost:8001/inStocks/${editItem.inStockId}`,{})
        })
      }
      formInbound.resetFields();
      setInboundVisible(false);
    }).catch(res => {
      console.log(res);
    })
  };
  const inboundCancel = () => {
    formInbound.resetFields();
    setInboundVisible(false)
  }

  //删除药品
  const deleteinStocks = (item) => {
    setDelState('inStocks')
    setEditItem(item)
    setIsModalVisible(true)
  }
  //deleteStock删除入库数据
  const deleteinbound = (item) => {
    setDelState('inbound')
    setEditItem(item)
    console.log(item);
    setIsModalVisible(true)
  }
  //增加药品
  const addinStocks = () => {
    setAddOrEdit('add')
    setAddVisible(true);
  }
  //修改药品信息
  const editinStocks = (item) => {
    setAddOrEdit('edit');
    setEditItem(item);
    form.setFieldsValue(item)
    setAddVisible(true);
  }
  //addinbound增加入库数据
  const addinbound = (item) => {
    setEditItem(item);
    console.log(item);
    setAddOrEdit('add')
    setInboundVisible(true)
  }
  //editStock编辑入库数据
  const editinbound = (item) => {
    setEditItem(item);
    setAddOrEdit('edit')
    formInbound.setFieldsValue(item)
    setInboundVisible(true)
  }

  //主表格嵌套的表格
  const expandedRowRender = (record) => {
    const columns = [
      {
        title: '入库时间',
        dataIndex: 'key',
        render: (time) => moment(time).format("YYYY-MM-DD")
      },
      {
        title: '入库数量',
        dataIndex: 'amount',
      },
      {
        title: '生产批号',
        dataIndex: 'batchNumber',
      },
      {
        title: '采购价',
        dataIndex: 'purchasePrice',
      },
      {
        title: '经手人',
        dataIndex: 'staff',
      },
      {
        title: 'Action',
        render: (_, record) => (
          <Space size="middle">
            <Tooltip title="修改该次入库记录">
              <Button shape='circle' onClick={() => editinbound(record)} icon={<SettingOutlined />} />
            </Tooltip>
            <Tooltip title="删除此条记录">
              <Button shape="circle" danger onClick={() => deleteinbound(record)} icon={<DeleteOutlined />}></Button>
            </Tooltip>
          </Space>
        ),
      },
    ];
    return <Table columns={columns} dataSource={record.inbound} pagination={false} />;
  };
  //主表格展示的内容
  const columns = [
    {
      title: <Space size="middle">药品名称<Button shape='circle' onClick={addinStocks} icon={<AppstoreAddOutlined />} /></Space>,
      dataIndex: 'name',

    },
    {
      title: '药品品牌',
      dataIndex: 'brand',
    },
    {
      title: '库存量',
      // 库存量排序
      sorter: (a, b) => {
        let amount = 0
        if (a.inbound && b.inbound) {
          a.inbound.forEach(item => {
            amount += item.amount
          })
          b.inbound.forEach(item => {
            amount -= item.amount
          })
        }
        return amount - a.consumed + b.consumed
      },
      // 库存量展示 10个及以下警示
      render: (_, record) => {
        let amount = 0 - record.consumed;
        if (record.inbound) {
          record.inbound.forEach(item => {
            amount += item.amount
          })
        }

        if ((amount) <= 0) {
          return (<Tag icon={<MinusCircleOutlined />} color="error"> {amount}</Tag>)
        }
        else if ((amount) <= 10) {
          return (<Tag icon={<ExclamationCircleOutlined />} color="warning"> {amount}</Tag>)
        }
        else { return <Tag icon={<CheckCircleOutlined />} color="success"> {amount}</Tag> }
      }
    },
    {
      title: '总销量',
      dataIndex: 'consumed',
      key: 'consumed'
    },
    {
      title: '售价',
      dataIndex: 'sellPrice',
      key: 'sellPrice'
    },
    {
      title: 'Action',
      key: 'Action',
      render: (_, record) =>
        <Space size="middle">
          <Tooltip title="新增入库记录">
            <Button shape='circle' onClick={() => addinbound(record)} icon={<FolderAddTwoTone />} />
          </Tooltip>
          <Tooltip title="修改药品信息">
            <Button shape='circle' onClick={() => editinStocks(record)} icon={<SettingTwoTone />} />
          </Tooltip>
          <Tooltip title="删除该药品记录">
            <Button shape="circle" danger onClick={() => deleteinStocks(record)} icon={<DeleteOutlined />}></Button>
          </Tooltip>
        </Space>,
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
        }}
        dataSource={dataSource}
        size="small"
      />
      <Modal title="删除确认" open={isModalVisible} okButtonProps={{ type: '', danger: true }} onOk={handleOk} onCancel={handleCancel}>
        {delState === 'inStocks' ? <p>是否删除该项药品纪录？所有入库记录将保留</p> : <p>是否删除该项入库纪录</p>}
      </Modal>
      <Modal title={addOrEdit === 'add' ? "新增药品" : "药品信息编辑"} open={addVisible} onOk={addOk} onCancel={addCancel}>
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
        >
          <Form.Item
            label="药品名称"
            name="name"
            rules={[
              {
                required: true,
                message: '请输入药品名称!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="药品品牌"
            name="brand"
            rules={[
              {
                required: true,
                message: '请输入药品品牌',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="售价"
            name="sellPrice"
            rules={[
              {
                required: true,
                message: '请输入售价',
              },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal title={addOrEdit === 'add' ? "新增入库" : "入库信息编辑"} open={inboundVisible} onOk={inboundOk} onCancel={inboundCancel}>
        <Form
          name="inbound"
          form={formInbound}
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
        >
          <Form.Item
            label="入库数量"
            name="amount"
            rules={[
              {
                required: true,
                message: '请输入入库药品数量!',
              },
            ]}
          >
            <InputNumber min={1} formatter={(number) => toInt(number)} />
          </Form.Item>
          <Form.Item
            label="生产批号"
            name="batchNumber"
            rules={[
              {
                required: true,
                message: '请输入药品品牌',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="采购价"
            name="purchasePrice"
            rules={[
              {
                required: true,
                message: '请输入采购价',
              },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
