import { Modal, Space, Button, Input, Form, notification, InputNumber, Select, Descriptions } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom'
import DraftEdit from '../../../component/DraftEdit';
import moment from 'moment'
import { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'
const { Option } = Select;

// 富文本框样式
const draftEditLayout = {
  labelCol: {
    span: 3,
    offset: 0,
  },
  wrapperCol: {
    span: 12,
    offset: 0,
  },
};

export default function ArchivesAddrecord() {
  //创建病历时富文本框的初始值
  const [content, setContent] = useState('<p></p>')
  const [staff, setStaff] = useState([])
  const [instock, setInstock] = useState([])
  const [formList, setFormList] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false);
  //员工数据和库存数据
  const navi = useNavigate()
  const [pageState, setPageState] = useState(0)
  const [catInfo,setCatInfo] = useState({})
  const [recordInfo,setRecordInfo] = useState({})
  const [form] = Form.useForm();//ANTD官方Form的hook
  const naviProps = useLocation().state
  useEffect(() => {
    axios.get('http://localhost:8001/staff?rolesId=1&rolesId=2').then(res => {
      setStaff(res.data)
    })
    axios.get('http://localhost:8001/inStocks').then(res => {
      setInstock(res.data)
    })
    setCatInfo(naviProps.cat)
    setRecordInfo(naviProps.record)
  }, [naviProps])
  //所有从navi拿到的数据
  //一定要拿到的宠物猫数据
  form.setFieldsValue(recordInfo)

  const age = (Date.now() - catInfo.birthday) / (24 * 3600 * 1000)

  //处理数字
  const toInt = (number) => {
    return Math.floor(number)
  }
  //submit
  const handleSubmit = () => {
    form.validateFields().then(res => {
      setFormList(res);
      setIsModalVisible(true);
    }).catch(res => {
      console.log(res);
    })
  }
  //Modal对话框
  const handleOk = () => {
    let obj = {
      "catId": catInfo.id,
      "date": 0,
      "staffId": formList.staff,
      "weight": formList.weight ? formList.weight : '未称重',
      "treatments": formList.treatments ? formList.treatments : [],
      "diagnosis": content,
      "reserve": 0,
      "bill": 0,
    }
    axios.post(`http://localhost:8001/records`, obj).then(res => {
      notification.success({
        message: `创建成功`,
        description:
          '已经成功创建新病例，正在跳转至宠物档案页面',
        placement: 'bottomRight',
      });
      setTimeout(() => {
        navi('/archives/cats')
      }, 1000);
    })
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  return (
    <div>
      <Descriptions title={catInfo.nickname}>
        <Descriptions.Item label="年龄">{Math.floor(age / 365) + '年' + Math.floor(age % 365 / 30) + '月' + Math.floor(age % 365 % 30) + '天'}</Descriptions.Item>
        <Descriptions.Item label="主人姓名">{catInfo.catOwner}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{catInfo.phoneNumber}</Descriptions.Item>
        <Descriptions.Item label="性别">{catInfo.sex === 1 ? '公猫' : '母猫'}</Descriptions.Item>
        <Descriptions.Item label="绝育情况">{catInfo.sterilize === 1 ? '已绝育' : '未绝育'}</Descriptions.Item>
        <Descriptions.Item label="上次疫苗时间">{catInfo.vaccine === []||catInfo.vaccine === undefined ? '未接种' : moment(catInfo.vaccine.sort(function (a, b) { return b - a })[0]).format('YYYY-MM-DD')}</Descriptions.Item>
        <Descriptions.Item label="上次驱虫时间">{catInfo.vermifuge === []||catInfo.vermifuge=== undefined ? '未驱虫' : moment(catInfo.vermifuge.sort(function (a, b) { return b - a })[0]).format('YYYY-MM-DD')}</Descriptions.Item>
      </Descriptions>

      <Form name="basic" form={form}
        labelCol={{
          span: 3,
        }}
        wrapperCol={{
          span: 6,
        }}
        style={{ marginTop: '10px' }}
        autoComplete="off"
        size="small"
      >
        {/* 病历负责人 string */}
        <Form.Item
          label="病历负责人"
          name="staffId"
          rules={[
            {
              required: true,
              message: '请选择本次病历负责人!',
            },
          ]}
        >
          <Select>
            {staff.map(item => {
              return <Option key={item.id} value={item.id} >{item.name} {item.rolesId === "3" ? '助理' : '医生'}</Option>
            })}
          </Select>
        </Form.Item>

        {/* 体重 string */}
        <Form.Item
          label="体重"
          name="weight"
          rules={[
            {
              required: false,
              message: '请输入宠物猫体重',
            },
          ]}
        >
          <Input />
        </Form.Item>

        {/* 治疗方法 num */}
        <Form.List name="treatments" >
          {(fields, { add, remove }) => (
            <>
              {/* 新增按钮 */}
              <Form.Item wrapperCol={{ offset: 3, span: 9 }}>
                <Button style={{ float: "right" }} type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  新增治疗手段
                </Button>
              </Form.Item>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key}>
                  <Form.Item wrapperCol={{ offset: 3, span: 12 }}>
                    <Space align="baseline" >
                      <Form.Item style={{ width: '180px' }}
                        {...restField}
                        name={[name, 'inStockId']}
                        rules={[
                          {
                            required: true,
                            message: '请选择治疗手段',
                          },
                        ]}
                      >
                        <Select
                          style={{ width: '100%' }}
                          showSearch
                          placeholder="选择所需要的诊疗方式"
                          optionFilterProp="children"
                          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        >
                          {instock.map(item => {
                            return <Option key={item.id} value={item.id} >{item.name}</Option>
                          })}
                        </Select>
                      </Form.Item>
                      <Form.Item style={{ width: '120px' }}
                        {...restField}
                        name={[name, 'useage']}
                        rules={[
                          {
                            required: true,
                            message: '请输入用量',
                          },
                        ]}
                      >
                        <InputNumber min={1} addonBefore="数量" formatter={(number) => toInt(number)} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'done']}
                        rules={[
                          {
                            required: false,
                            message: '请输入用量',
                          },
                        ]}
                      >
                        <Select
                          // defaultValue='0'
                          style={{
                            width: 80,
                          }}
                        >
                          <Option value={false}>未处理</Option>
                          <Option value={true}>已处理</Option>
                        </Select>
                      </Form.Item>

                      <MinusCircleOutlined style={{ marginLeft: '10px' }} onClick={() => remove(name)} />
                    </Space>
                  </Form.Item>
                </div>
              ))}
            </>
          )}
        </Form.List>

        {/* 富文本框 */}
        <Form.Item {...draftEditLayout} className="text"
          name="intro"
          label="病情描述"
        >
          <DraftEdit content={content} setContent={setContent} />
        </Form.Item>

        {/* 提交按钮 */}
        <Form.Item wrapperCol={{ offset: 3, span: 12 }}>
          {recordInfo ?'': <Button htmlType="submit" onClick={handleSubmit} >
            转交负责人
          </Button>}
        </Form.Item>
      </Form>
      <Modal title="请确认" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>是否将该病历提交给病历负责人</p>
      </Modal>
    </div >
  )
}
