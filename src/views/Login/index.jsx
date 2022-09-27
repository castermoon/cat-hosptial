import { Button, Form, Input, message, Space } from 'antd';
import { UserOutlined, KeyOutlined } from '@ant-design/icons';
import './index.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navi = useNavigate()
  const onFinish = (values) => {
    axios.get(`http://localhost:8001/staff?_expand=rights&username=${values.username}&password=${values.password}`).then(res => {
       console.log(res.data);
      if (res.data[0]) {
        message.success('成功登陆，正在跳转。')
        localStorage.setItem('token', JSON.stringify(res.data[0]))
        setTimeout(() => {
          navi('/')
        }, 1000);
      } else {
        message.error('用户名或者密码错误，请重新输入。')
      }
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const handleClick = () => {
    navi('/guest')
  }
  return (
    <div className='loginDiv'>
      <div>まるまるペット病院</div>
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
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        >
          <Input prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: '请输入密码!',
            },
          ]}
        >
          <Input.Password prefix={<KeyOutlined />} />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 0,
            span: 26,
          }}
        >
          <Button type="primary" htmlType="submit">
            登陆系统
          </Button>
          <Space  style={{ float: 'right' }}>
            <Button type="primary" ghost onClick={()=>{navi('/guest/register')}} >
              新用户注册
            </Button>
            <Button type="primary" ghost onClick={handleClick} style={{ float: 'right' }} >
              游客界面
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

