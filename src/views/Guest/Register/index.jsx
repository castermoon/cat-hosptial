import { Form, Input, Button, notification } from 'antd';
import axios from 'axios';
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import './index.css'



//添加用户按钮的样式
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 6,
    },
  },
};

export default function UserAdd() {
  const navi = useNavigate()
  //校验真实姓名：由中文或字母组成，位数为2-26位
  const regRealName = (_, value) => {
    const reg = new RegExp("^[a-zA-Z\u4e00-\u9fa5]{2,26}$");
    if(reg.test(value)){
      return Promise.resolve()
    }else{
      return Promise.reject(new Error('真实姓名必须由中文或字母组成，位数为2-26位'))
    };
  }
  //校验是否用户名被占用，这里使用了async
  const checkName = async (_, value) => {

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
  //校验用户名是否符合正则表达式
  const regName = (_, value) => {
    const reg = new RegExp("^[a-zA-Z0-9_-]{6,16}$");// 数字字母下划线和减号
    if(reg.test(value)){
      return Promise.resolve()
    }else{
      return Promise.reject(new Error('用户名必须由数字、字母、下划线或减号组成，位数为6-16位'))
    };
  }
  //校验密码是否符合正则表达式：
  const regPassword = (_, value) => {
    const reg = new RegExp("^.*(?=.{6,})(?=.*\\d)(?=.*[A-Z])(?=.*[a-z]).*$");
    if(reg.test(value)){
      return Promise.resolve()
    }else{
      return Promise.reject(new Error('密码必须6位以上，并且包含大写字母、小写字母和数字各一个'))
    };
  }
  //完成所有的表单验证之后执行的函数
  const onFinish = (value) => {
    let arr = {
      name: value.name,
      username: value.username,
      password: value.password,
      rolesId: "4",
      key: moment(value.key).valueOf(),
      intro: "<p></p>",
      rightsId: "4",
      zaishoku: 0,
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

    axios.post('http://localhost:8001/staff', arr).then(res => {
      notification['success']({
        message: '创建成功',
        description:
          '用户创建成功，正在跳转至登陆页面。',
      });
      setTimeout(() => {
        navi('/')
      }, 1500);
    })
  }
  //使用useForm的hook
  const [form] = Form.useForm();
  return (
    <div className='fromDivRegister'>
      <Form
        form={form}
        labelCol={{ span: 6, }}
        wrapperCol={{ span: 18, }}
        validateTrigger='onBlur'
        onFinish={(value) => onFinish(value)}
        size="small"
        layout="horizontal"
        autoComplete="off"
      >
        {/* 姓名 */}
        <Form.Item
          name="name"
          label="姓名"
          rules={[
            {
              required: true,
              message: '请输入真实姓名!',
              whitespace: true,
            },
            {
              validator:regRealName//中文正则+英文
            }
          ]}
        >
          <Input />
        </Form.Item>
        {/* 用户名 */}
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            {
              required: true,
              message: '请输入登陆时使用的用户名!',
              whitespace: true,
            },
            {
              validator: checkName,//是否被占用
            },
            {
              validator: regName,//正则表达式
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
            {
              validator:regPassword
            }
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
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            提交注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
