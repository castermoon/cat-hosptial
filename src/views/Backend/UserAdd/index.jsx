import { Form, Input, Button, Select, DatePicker, Modal, notification, Descriptions } from 'antd';
import axios from 'axios';
import moment from 'moment'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DraftEdit from '../../../component/DraftEdit';
import './index.css'
const { Option } = Select;

//添加用户按钮的样式
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 3,
    },
    sm: {
      span: 16,
      offset: 3,
    },
  },
};
// 富文本框样式
const draftEditLayout = {
  labelCol: {
    span: 3,
    offset: 0,
  },
  wrapperCol: {
    span: 15,
    offset: 0,
  },
};
//角色映射数组
const cakagaki = ['', '院长', '医生', '助理','未分配']

export default function UserAdd(props) {

  //创建用户时富文本框的初始值
  const [content, setContent] = useState('<p></p>')
  //最终提交到json的新用户信息
  const [info, setInfo] = useState([])
  //判断页面是新建、更新或者编辑的状态
  const [page, setPage] = useState('new')

  //Modal框
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate()

  //_修改
  useEffect(() => {
    // 如果是从编辑用户按钮进来
    if (props.state) {
      setPage(props.state.type)
      setContent(props.state.item.intro)
      form.setFieldsValue({
        ...props.state.item,
        confirm:props.state.item.password,
        key:moment(props.state.item.key),
      });
    }
  }, [props])

  // useEffect(() => {
  //   // 如果是从编辑用户按钮进来
  //   if (props.state) {
  //     setPage('edit')
  //     setContent(props.state.item.intro)
  //     form.setFieldsValue({
  //       ...props.state.item,
  //       confirm:props.state.item.password,
  //       key:moment(props.state.item.key),
  //     });
  //   // 如果从侧边栏进来的
  //   } else if (props.state === null) {
  //     const token = JSON.parse(localStorage.getItem('token'))
  //     // console.log(token.id);
  //     axios.get(`http://localhost:8001/staff/${token.id}?_expand=rights`).then(res=>{
  //       //更新token
  //       localStorage.setItem('token',JSON.stringify(res.data))
  //       let obj = res.data
  //       setContent(obj.intro)
  //       form.setFieldsValue({
  //         ...obj,
  //         confirm:obj.password,
  //         key:moment(obj.key),
  //       });
  //       setPage('self')
  //     })
  //   }
  // }, [props])// eslint-disable-line react-hooks/exhaustive-deps

  //点击确定创建用户并跳转至用户列表页面
  const handleOk = () => {
    //创建时执行
    if(page==='new'){
      axios.post('http://localhost:8001/staff', { ...info }).then(res => {
        notification['success']({
          message: '创建成功',
          description:
            '用户创建成功，正在跳转至用户列表页面。',
        });
        setTimeout(() => {
          navigate('/user/list')
        }, 1500);
      })
    }
    if(page==='edit'){
      axios.patch(`http://localhost:8001/staff/${props.state.item.id}`, { ...info }).then(res => {
        notification['success']({
          message: '更新成功',
          description:
            '用户资料更新成功，正在跳转至用户列表页面。',
        });
        setTimeout(() => {
          navigate('/user/list')
        }, 1500);
      })
    }
    // if(page === 'self'){
    //
    //     axios.patch(`http://localhost:8001/staff/${JSON.parse(localStorage.getItem('token')).id}`, { ...info }).then(res => {
    //       // console.log(res);
    //       notification['success']({
    //         message: '更新成功',
    //         description:
    //           '资料更新成功，正在重新刷新页面。',
    //       });
    //         navigate('/user/edit')
    //     })
    // }
    // setIsModalVisible(false);
    // };
    //_修改
    if(page === 'self'){
      axios.patch(`http://localhost:8001/staff/${props.state.item.id}`, { ...info }).then(res => {
          // console.log(res);
          notification['success']({
            message: '更新成功',
            description:
              '资料更新成功，正在重新刷新页面。',
          });
          axios.get(`http://localhost:8001/staff?_expand=rights&username=${props.state.item.username}&password=${props.state.item.password}`).then(res2 => {
            if (res2.data[0]) {
              localStorage.setItem('token', JSON.stringify(res2.data[0]))
            }
          })
        })
      }
      setIsModalVisible(false);
    };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  //校验是否用户名被占用，这里使用了async
  const checkName = async (_, value) => {
    //如果从资料更新页面进入
    if(page==='self' && value === JSON.parse(localStorage.getItem('token')).username){
      return Promise.resolve()
    }
    //如果从编辑用户资料按钮进入
    if(page === 'edit' && value === props.state.item.username){
      return Promise.resolve()
    }
    let arr = 1
    await axios.get(`http://localhost:8001/staff?username=${value}`).then(res => {
      arr = res.data
    })
    if (arr[0] === undefined) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('用户名已经被使用'))
    }
  }
  //点击添加、更新用户按钮
  const onFinish = (value) => {
    let userInfo = {
      name: value.name,
      username: value.username,
      password: value.password,
      rolesId: value.rolesId,
      key: moment(value.key).valueOf(),
      intro: content,
      rightsId: value.rolesId,
      zaishoku: 1,
      avatar: "https://joeschmoe.io/api/v1/random",
      showed: [
        "/right/page",
        "/inStock/pricing",
        "/todo",
        "/todo/doctor",
        "/todo/assistant",
        "/todo/reserve",
        "/archives",
        "/archives/cats",
        "/archives/records",
        "/user/add",
        "/user/edit",
        "/right",
        "/inStock",
        "/inStock/list",
        "/user",
        "/user/list",
        "/right/role"
      ],
    }
    // console.log(arr);
    setIsModalVisible(true);
    setInfo(userInfo);
  }
  //使用useForm的hook
  const [form] = Form.useForm();
  return (
    <div className='fromDiv'>

      <Form
        form={form}
        labelCol={{ span: 3, }}
        wrapperCol={{ span: 9, }}
        onFinish={(value) => onFinish(value)}
        size="small"
        layout="horizontal"
        autoComplete="off"
      >
        {/* 姓名 */}
        <Form.Item
          name="name"
          label="真实姓名"
          rules={[
            {
              required: true,
              message: '请输入员工的真实姓名!',
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        {/* 用户名 */}
        <Form.Item
          name="username"
          label="用户名"
          validateTrigger='onBlur'
          rules={[
            {
              required: true,
              message: '请输入登陆时使用的用户名!',
              whitespace: true,
            },
            {
              validator: checkName,
            }
          ]}
        >
          <Input />
        </Form.Item>
        {/* 密码 */}
        <Form.Item
          name="password"
          label="密码"
          rules={[
            {
              required: true,
              message: '请输入密码!',
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        {/* 确认密码 */}
        <Form.Item
          name="confirm"
          label="确认密码"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: '请再次输入密码!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error('两次输入的密码不匹配!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        {/* 入职时间 */}
        <Form.Item name='key' label="入职时间"
          rules={[
            {
              required: true,
              message: '请选择入职时间',
            }
          ]}>
          <DatePicker disabled={page === 'new'||JSON.parse(localStorage.getItem('token')).rolesId==="1"?false:true} />
        </Form.Item>
        {/* 职务 */}
        <Form.Item
          name="rolesId"
          label="角色类型"
          rules={[
            {
              required: true,
              message: '必须选择角色类型!',
            },
          ]}
        >
          <Select placeholder="请选择角色类型" disabled={page === 'new'||JSON.parse(localStorage.getItem('token')).rolesId==="1"?false:true}>
            <Option value="1">院长</Option>
            <Option value="2">医生</Option>
            <Option value="3">助理</Option>
            <Option value="4">未分配</Option>
          </Select>
        </Form.Item>
        {/* 头像地址暂时不支持修改 */}
        <Form.Item
          name="avatar"
          label="头像地址"
          valuePropName="filelist"
        >
          <Input disabled='ture' value={"https://joeschmoe.io/api/v1/random"}></Input>
        </Form.Item>

        {/* 富文本框 */}
        <Form.Item {...draftEditLayout}
          name="intro"
          label="个人简介"
        >
          <DraftEdit content={content} setContent={setContent} />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            {page==='new'?'添加用户':'更新资料'}
          </Button>
        </Form.Item>
      </Form>
      <Modal title={page==='new'?"请确认创建的用户信息":'请确认更新后的用户信息'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        {
          info ?
            <Descriptions
              bordered
              size='small'
              column={{
                xxl: 1,
                xl: 1,
                lg: 1,
                md: 1,
                sm: 1,
                xs: 1,
              }}
            >
              <Descriptions.Item label="真实姓名">{info.name}</Descriptions.Item>
              <Descriptions.Item label="用户名">{info.username}</Descriptions.Item>
              <Descriptions.Item label="入职时间">{moment(info.key).format('YYYY-MM-DD')}</Descriptions.Item>
              <Descriptions.Item label="角色类型">{cakagaki[info.rolesId]}</Descriptions.Item>
            </Descriptions>
            : null
        }
      </Modal>
    </div>
  )
}
