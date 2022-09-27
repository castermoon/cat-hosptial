import { SmileOutlined, CheckCircleOutlined, SolutionOutlined, UserOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Steps, Modal, Form, Button, Space, DatePicker, Input, Select, Descriptions } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoReserve from '../../Backend/TodoReserve'
import './index.css'

const { Step } = Steps;
const { Option } = Select;

export default function Appointment() {
  const [form] = Form.useForm();//ANTD官方Form的hook
  const [current, setCurrent] = useState(0)
  const [doctor, setDoctor] = useState([])
  const [user, setUser] = useState([])
  const [appointment, setAppointment] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navi = useNavigate()

  //格式处理
  const forMoment = (origin) => {
    let arr1 = origin.vaccine !== undefined ? origin.vaccine.map(item => {
      return moment(item)
    }) : []
    let arr2 = origin.vermifuge !== undefined ? origin.vermifuge.map(item => {
      return moment(item)
    }) : []
    let obj = { ...origin, birthday: moment(origin.birthday), vaccine: arr1, vermifuge: arr2 }
    return obj
  }
  //拿到local数据
  const guest = localStorage.getItem('guest')
  //——————————————————————————————————————————————————对话框内容
  const handleOk = () => {
    setCurrent(1)
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  //——————————————————————————————————————————————————点击按钮的回调
  const handleNext = () => {
    form.validateFields().then(res => {
      console.log(res);
      setCurrent(2)
    })
    console.log(current);
  }
  const handleFin = async () => {
    let recordObj = {
      "catId": '',
      "date": appointment,
      "staffId": doctor[0].id,
      "weight": '未称重',
      "treatments": [],
      "diagnosis": '<p></p>',
      "reserve": 0,
      "bill": 0,
    }
    //如果没有档案、建立档案
    await axios.get(`http://localhost:8001/cats?phoneNumber=${form.getFieldValue().phoneNumber}&nickname=${form.getFieldValue().nickname}`).then(res => {
      if (res.data.length === 0) { //为0就新建
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
        axios.post(`http://localhost:8001/cats`, obj).then(res => {
          recordObj.catId = res.data.id
        })
      } else {
        recordObj.catId = res.data[0].id
      }
    })
    axios.post(`http://localhost:8001/records`, recordObj).then(res => {
      setCurrent(3)
    })
    localStorage.setItem('guest',form.getFieldValue().phoneNumber)
  }
  //——————————————————————————————————————————————————表单中用到的函数
  const phoneOnBlur = () => {
    axios.get(`http://localhost:8001/cats?phoneNumber=${form.getFieldsValue().phoneNumber}`).then(res => {
      if (res.data.length !== 0) {
        setUser(res.data)
        if (res.data.length === 1) {
          form.setFieldsValue(forMoment(res.data[0]))
        }
      };
    })
  }
  const nicknameOnBlur = () => {
    if (user.length > 1) {
      let arr = user.filter(item => {
        return item.nickname === form.getFieldsValue().nickname
      })
      if (arr.length === 1) {
        form.setFieldsValue(forMoment(arr[0]))
      }
    }
  }
  //检查电话号码格式
  const checkPhone = (_, item) => {
    if (item * 1 < 10000000000 || isNaN(item * 1) || item * 1 > 19999999999) {
      return Promise.reject('输入的电话号码不符合')
    } else {
      return Promise.resolve()
    }
  }
  // console.log(form.getFieldValue());
  //——————————————————————————————————————————————————预约步骤内容
  const content = {
    0: <TodoReserve setCurrent={setCurrent} setDoctor={setDoctor} setAppointment={setAppointment} setIsModalVisible={setIsModalVisible} />,
    1: <div style={{ marginTop: '24px' }} >
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
        {/* 电话 string */}
        <Form.Item
          label="联系电话"
          name="phoneNumber"
          validateTrigger='onBlur'
          initialValue = {guest?guest:''}
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
          <Input onBlur={() => phoneOnBlur()} />
        </Form.Item>
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
          <Input onFocus={() => phoneOnBlur()} onBlur={() => nicknameOnBlur()} />
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
              <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  新增疫苗注射时间
                </Button>
              </Form.Item >
              {fields.map(({ key, name, ...restField }) => (
                <Space size={'small'} key={key} style={{ float: 'inline-start', marginLeft: '100px' }} align="baseline" >
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
              <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  新增驱虫时间
                </Button>
              </Form.Item>
              {fields.map(({ key, name, ...restField }) => (
                <Space size={'small'} key={key} style={{ float: 'inline-start', marginLeft: '100px' }} align="baseline" >
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
      <Button onClick={() => { setCurrent(0) }} >上一步</Button>
      <Button onClick={handleNext} style={{ float: 'right' }} >下一步</Button>

    </div>,
    2: <div>
      <Descriptions
        style={{ marginTop: '20px' }}
        bordered
        column={1}
      >
        <Descriptions.Item label="医生">{doctor.length === 0 ? '' : doctor[0].name}医生</Descriptions.Item>
        <Descriptions.Item label="预约时间">{moment(appointment).format('M月DD日HH时')}</Descriptions.Item>
        <Descriptions.Item label="联系方式">{form.getFieldValue().phoneNumber}</Descriptions.Item>
        <Descriptions.Item label="预约人">{form.getFieldValue().catOwner}</Descriptions.Item>
        <Descriptions.Item label="就诊猫咪">{form.getFieldValue().nickname}</Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: '24px' }} >
        <Button onClick={() => { setCurrent(1) }} >上一步</Button>
        <Button onClick={handleFin} style={{ float: 'right' }} >确定预约</Button>
      </div>
    </div>,
    3: <div>
      <div className='success'>
        <SmileOutlined className='item' style={{ fontSize: "70px" }} />
        <div >
          <div fontSize='36px' className='title'> 预约完成！</div>
          请于预约时间：{moment(appointment).format('M月DD日H时')}到店。<br></br>如需取消预约请在主页中点击查看预约页面。
        </div>
      </div>
      <div style={{ marginTop: '24px' }} >
        <Button onClick={() => navi('/guest')} >返回首页</Button>
        <Button onClick={() => navi('/guest/view')} style={{ float: 'right' }} >查看预约</Button>
      </div>
    </div>
  }

  return (
    <div>
      <Steps current={current}>
        <Step title="预约时间" icon={<UserOutlined />} />
        <Step title="登陆信息" icon={<SolutionOutlined />} />
        <Step title='信息确认' icon={<CheckCircleOutlined />} />
        <Step title="完成预约" icon={<SmileOutlined />} />
      </Steps>
      <div>{content[current]}</div>

      <Modal title="预约情况确认" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>请问您确认预约信息：</p>
        <p>主治医生：{doctor.length === 0 ? '' : doctor[0].name}医生</p>
        <p>预约时间：{moment(appointment).format('M月DD日H时')}</p>
      </Modal>
    </div>
  )
}
