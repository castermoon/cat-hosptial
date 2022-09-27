import { Popconfirm, Modal, Space, Button, Input, Form, notification, InputNumber, Select, Descriptions, message } from 'antd';
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
  //员工数据
  const [staff, setStaff] = useState([])
  //库存数据
  const [instock, setInstock] = useState([])
  //是否点击了结束诊疗按钮？
  const [bill, setBill] = useState(false)
  //表单填写后的内容
  const [formList, setFormList] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navi = useNavigate()
  //页面状态 true--编辑 false--新建
  const [pageState, setPageState] = useState(false)
  const [form] = Form.useForm();//ANTD官方Form的hook
  //所有从navi拿到的数据
  const naviProps = useLocation().state
  //一定要拿到的宠物猫数据
  const catInfo = naviProps.cat
  //从todo页面跳转时存在的数据
  const recordInfo = naviProps.record


  useEffect(() => {
    axios.get('http://localhost:8001/staff?rolesId=1&rolesId=2').then(res => {
      setStaff(res.data)
    })
    axios.get('http://localhost:8001/inStocks').then(res => {
      setInstock(res.data)
    })
    //页面是修改病历还是新增病例
    if (recordInfo !== undefined) {
      //不能直接使用传过来的数据
      axios.get(`http://localhost:8001/records/${recordInfo.id}`).then(res => {
        form.setFieldsValue(res.data)
        setContent(res.data.diagnosis)
      })
      setPageState(true)
    } else {
      setContent("<p></p>")
      setPageState(false)
    }

  }, [])// eslint-disable-line react-hooks/exhaustive-deps


  //———————————————————————————————————————————————————————————————————————————————以下是对话框相关
  //Modal对话框
  const handleOk = () => {
    let obj = {
      "catId": catInfo.id,
      "date": Date.now(),
      "staffId": formList.staffId,
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
  //———————————————————————————————————————————————————————————————————————————————以下是表单相关
  //计算天数
  const age = (Date.now() - catInfo.birthday) / (24 * 3600 * 1000)
  //处理数字
  const toInt = (number) => {
    return Math.floor(number)
  }
  //点击提交负责人处理时：确认是否提交给负责人处理
  const handleSubmit = () => {
    form.validateFields().then(res => {
      setFormList(res);
      form.setFieldsValue(res)
      setIsModalVisible(true);
    }).catch(res => {
      console.log(res);
    })
  }
  //更新病历按钮—————————点击直接更新简历
  const renew = (reserve, bill) => {
    form.validateFields().then(res => {
      // console.log(reserve);
      axios.patch(`http://localhost:8001/records/${recordInfo.id}`,
        {
          "weight": res.weight ? res.weight : '未称重',
          "treatments": res.treatments ? res.treatments : [],
          "diagnosis": content,
          "reserve": reserve !== undefined ? reserve : recordInfo.reserve,
          "bill": bill === 1 ? 1 : 0
        }
      ).then(res => {
        message.success('已提交，正在跳转至待办事项')
        setTimeout(() => {
          recordInfo.reserve === 0 ? navi('/todo/doctor') : navi('/todo/assistant')
        }, 1500);
      })
    }).catch(res => {
      console.log(res);
    })
  }
  //检查结束诊疗时是否所有的操作都已经执行完毕
  const checkDone = (_, value) => {
    if (bill) {
      if (value) {
        return Promise.resolve()
      } else {
        setBill(false)
        return Promise.reject(new Error('尚未处理'))
      }
    } else {
      return Promise.resolve()
    }
  }

  //———————————————————————————————————————————————————————————————————————————————以下是动态表单相关
  //改变是否已经处理的状态
  const doneChange = async (value, name) => {
    const treatment = form.getFieldValue().treatments[name]
    const stockthing = await axios.get(`http://localhost:8001/inStocks/${treatment.inStockId}`)
    const useage = treatment.useage
    const stock = stockthing.data


    if (value) {//由未处理改成已处理
      if (stock.type === 1 && stock.amount < useage) {//库存不足
        message.error('使用量超过最大库存，请调整使用量或者增加库存')
        form.setFieldValue(['treatments', name, 'done'], false)
      } else {//库存足够
        form.validateFields().then(res => {
          // console.log(res);
          axios.patch(`http://localhost:8001/records/${recordInfo.id}`,
            {
              "weight": res.weight ? res.weight : '未称重',
              "treatments": res.treatments ? res.treatments : [],
              "diagnosis": content,
              "bill":0
            }
          ).then(res => {
            // console.log(res);
            message.success('已处理并更新')
            form.setFieldsValue(res.data)//表单信息更新
            //库存信息更新
            axios.patch(`http://localhost:8001/inStocks/${treatment.inStockId}`,
              stock.type === 1 ? {
                amount: (stock.amount - useage),
                consumed: (stock.consumed + useage),
              } : { consumed: (stock.consumed + useage) }
            )
          })
        }).catch(res => {
          console.log(res);
        })
      }
    } else {//由已处理改成未处理
      form.validateFields().then(res => {
        axios.patch(`http://localhost:8001/records/${recordInfo.id}`,
          {
            "weight": res.weight ? res.weight : '未称重',
            "treatments": res.treatments ? res.treatments : [],
            "diagnosis": content,
            "bill":0
          }
        ).then(res => {
          message.info('已撤销处理并更新')
          //库存信息更新
          axios.patch(`http://localhost:8001/inStocks/${treatment.inStockId}`,
            stock.type === 1 ? {
              amount: (stock.amount + useage),
              consumed: (stock.consumed - useage),
            } : { consumed: (stock.consumed - useage) }
          )
          form.setFieldsValue(res.data)//表单信息更新
        })
      }).catch(res => {
        console.log(res);
      })
    }
  }
  //点击删除按钮前必须取消处理状态（以更新库存数据）
  const handleDone = (remove, name) => {
    if (form.getFieldValue().treatments[name].done) {
      message.error('请先取消已处理状态')
    } else {
      remove(name)
    }
  }
  //———————————————————————————————————————————————————————————————————————————————以上
  return (
    <div>
      <Descriptions title={catInfo.nickname}>
        <Descriptions.Item label="年龄">{Math.floor(age / 365) + '年' + Math.floor(age % 365 / 30) + '月' + Math.floor(age % 365 % 30) + '天'}</Descriptions.Item>
        <Descriptions.Item label="主人姓名">{catInfo.catOwner}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{catInfo.phoneNumber}</Descriptions.Item>
        <Descriptions.Item label="性别">{catInfo.sex === 1 ? '公猫' : '母猫'}</Descriptions.Item>
        <Descriptions.Item label="绝育情况">{catInfo.sterilize === 1 ? '已绝育' : '未绝育'}</Descriptions.Item>
        <Descriptions.Item label="上次疫苗时间">{catInfo.vaccine === [] ? '未接种' : moment(catInfo.vaccine.sort(function (a, b) { return b - a })[0]).format('YYYY-MM-DD')}</Descriptions.Item>
        <Descriptions.Item label="上次驱虫时间">{catInfo.vermifuge === [] ? '未驱虫' : moment(catInfo.vermifuge.sort(function (a, b) { return b - a })[0]).format('YYYY-MM-DD')}</Descriptions.Item>
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
          hidden={pageState}
          rules={[
            {
              required: true,
              message: '请选择本次病历负责人!',
            },
          ]}
        >
          <Select>
            {staff.map(item => {
              //本来想分为助理和医生分别负责两种病历，但想到助理可能没有兽医资格等，基本还得转交医生处理？
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
              required: pageState,
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
              {/* 新增诊疗手段按钮 */}
              <Form.Item wrapperCol={{ offset: 3, span: 9 }}>
                <Button style={{ float: "right" }} type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  新增治疗手段
                </Button>
              </Form.Item>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key}>
                  <Form.Item wrapperCol={{ offset: 3, span: 12 }}>
                    <Space className='spaceAdd' align="baseline" >
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
                          disabled={form.getFieldValue().treatments[name] !== undefined ? form.getFieldValue().treatments[name].done : false}
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
                        <InputNumber min={1} addonBefore="数量"
                          disabled={form.getFieldValue().treatments[name] !== undefined ? form.getFieldValue().treatments[name].done : false}
                          formatter={(number) => toInt(number)} />
                      </Form.Item>
                      {/* 是否已经处理 */}
                      <Form.Item
                        {...restField}
                        name={[name, 'done']}
                        rules={[
                          {
                            required: pageState,
                            message: '处理状态？',
                          },
                          {
                            validator: checkDone,
                          }
                        ]}
                      >
                        <Select
                          // defaultValue={false}
                          onChange={(value) => doneChange(value, name)}

                          style={{
                            width: 80,
                          }}
                        >
                          <Option value={false}>未处理</Option>
                          <Option value={true}>已处理</Option>
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined style={{ marginLeft: '10px' }} onClick={() => handleDone(remove, name)} />
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

        {/* 提交负责人按钮 */}
        <Form.Item wrapperCol={{ offset: 3, span: 12 }} hidden={pageState} >
          {recordInfo ? '' : <Button htmlType="submit" onClick={handleSubmit} >
            转交负责人
          </Button>}
        </Form.Item>
        {/* 医生、助手交互按钮 */}
        <Form.Item wrapperCol={{ offset: 3, span: 12 }} hidden={!pageState} >
          <Button htmlType="submit" type='primary' onClick={() => renew()} >
            更新病历
          </Button>
          {recordInfo ? <>{recordInfo.reserve === 0 ?
            <span >
              <Space className='spaceButton'>
                <Popconfirm title="是否更新病历并转交助手处理？" onConfirm={() => renew(1)}>
                  <Button htmlType="submit" style={{ float: 'right' }}   >
                    转交助手
                  </Button>
                </Popconfirm>
                <Popconfirm title="是否结束就诊并转交前台？" onConfirm={() => { setBill(true); renew(1, 1) }}>
                  <Button htmlType="submit" danger='true' style={{ float: 'right' }}   >
                    结束就诊
                  </Button>
                </Popconfirm>
              </Space>
            </span> :
            <Popconfirm title="是否更新病历并转交医生处理？" onConfirm={() => renew(0)}>
              <Button htmlType="submit" danger='true' style={{ float: 'right' }}   >
                转交医生
              </Button>
            </Popconfirm>}
          </> : <></>}
        </Form.Item>
      </Form>
      <Modal title="请确认" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>是否将该病历提交给病历负责人</p>
      </Modal>
    </div >
  )
}
