import { message, Table, Button, Modal, Tabs, Input } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

import { useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment';
import './index.css'
const { TabPane } = Tabs;
// 日期、时间映射表
const weekList = ['(月)', '(火)', '(水)', '(木)', '(金)', '(土)', '(日)', '(月)', '(火)', '(水)', '(木)', '(金)', '(土)']
const timeList = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const forMap = [0, 1, 2, 3, 4, 5, 6]
//获取现在伦敦时间
const timeEng = Date.now()
const token = localStorage.getItem('token')

//当天是星期几
const dayWeek = Math.floor((timeEng / (1000 * 3600 * 24) +3 + 9 / 24) % 7 )
// console.log(dayWeek);

export default function TodoReserve(props) {
  //当天日本时间早上9:00的毫秒值(日本东9区，伦敦0点)
  const [time, setTime] = useState(timeEng - timeEng % (1000 * 3600 * 24) )
  const [data, setData] = useState([])
  const [doctorList, setDoctorList] = useState([])
  const [doctor, setDoctor] = useState(1)
  const [appointment, setAppointment] = useState()
  const [dataCats, setDataCats] = useState([])
  const [tempDataCats, setTempDataCats] = useState([])
  const [cat, setCat] = useState([])
  const [value, setValue] = useState()

  useEffect(() => {
    //初始化一个数组，
    let arrtemp = new Array(10)
    for (let i = 0; i < 10; i++) {
      arrtemp[i] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, key: i, }
    }
    //当天超过时间，不显示可预约
    if ((timeEng - time) > 0) {
      // console.log((timeEng - time) / (1000 * 3600));
      let hour = Math.ceil((timeEng - time) / (1000 * 3600))
      if (hour > 9& hour<=15) {
        for (let i = 0; i < 10; i++) {
          arrtemp[i][0] = 1
        }
      } else if(hour<= 9){
        for (let i = 0; i < hour; i++) {
          arrtemp[i][0] = 1
        }
      }
    }
    //拿到time时间点起一周内所有病历数据，加载到预约数组中
    axios.get(`http://localhost:8001/records?date_gte=${time}&date_lte=${time + 1000 * 3600 * 24 * 7}&staffId=${doctor}`).then(res => {
      // console.log(res.data);
      res.data.forEach(item => {
        let a = Math.floor((item.date - time) / (1000 * 3600 * 24))
        let b = Math.floor(item.date % (1000 * 3600 * 24) / (1000 * 3600))
        arrtemp[b][a] = 1

      })
      // console.log(doctor);
      setData(arrtemp)
      console.log(data)
    })
  }, [time, doctor])
  useEffect(()=>{
    //拿到所有医生的数据
    axios.get(`http://localhost:8001/staff?rolesId=1&rolesId=2`).then(res => {
      setDoctorList(res.data);
    })
  },[])
  //——————————————————————————————————————————————————————————预约表中展示的内容
  //预约表中展示的按钮
  const handleBefore = () => {
    if (Math.abs(time - Date.now()) < 1000 * 3600 * 24) {
      message.warn('已经是本周');
    } else {
      setTime(time - 7 * 24 * 3600 * 1000)
    }
  }
  const handleAfter = () => {
    setTime(time + 7 * 24 * 3600 * 1000)
  }
  //表格内容
  const children = forMap.map(item => {
    //处理点击预约的回调
    const handleClick = (item, record) => {
      // console.log(item, record);
      if(token!==null){
        setAppointment(moment(time + item * 1000 * 3600 * 24 + (record.key + 0.1) * 1000 * 3600).valueOf()) //时间戳
        axios.get(`http://localhost:8001/cats`).then(res => {      //获取猫的信息
          setDataCats(res.data)
          setTempDataCats(res.data)
        })
        setIsModalVisible(true)
        // console.log(appointment);
      }else{
        //当从游客页面进入时
        props.setDoctor(doctorList.filter(item=>{
          return item.id === doctor*1
        }))
        props.setAppointment(moment(time + item * 1000 * 3600 * 24 + (record.key + 0.1) * 1000 * 3600).valueOf())
        props.setIsModalVisible(true)
      }
    }
    return {
      title: <div > <div>{moment(time + item * 1000 * 3600 * 24 + timeEng % (1000 * 3600 * 24) ).format('M/DD')}</div><div>{weekList[dayWeek + item]}</div></div>,
      dataIndex: item,
      align: 'center',
      render: (value, record) => (value === 0 ? <div className='divmaru' onClick={() => handleClick(item, record)}  >◎</div> : <div>ー</div>)
    }
  })
  const columns = [
    {
      title: <div><div>{moment(Date.now()).format('HH:mm')}</div><div>现在</div></div>,
      dataIndex: 'key',
      key: 'name',
      render: (key) => (timeList[key]),
      align: 'center',

    },
    {
      title: <div  >
        <Button onClick={handleBefore} className='divButton' size='small' ghost='true' type='primary' style={{ float: 'left' }} >前七天</Button>
        <Button onClick={handleAfter} className='divButton' size='small' ghost='true' type='primary' style={{ float: 'right' }} >后七天</Button>
      </div>,
      align: 'center',
      children: children
    },
  ];

  //——————————————————————————————————————————————————————————对话框内容
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleOk = () => {
    console.log(cat, appointment, doctor);
    axios.post(`http://localhost:8001/records`, {
      "catId": cat[0].id,
      "date": appointment,
      "staffId": doctor,
      "weight": '未称重',
      "treatments": [],
      "diagnosis": "<p></p>",
      "reserve": 0,
      "bill": 0
    }).then(res => {
      let arrtemp = [...data]                                //根据预约日期的时间戳获取到该日期在表格中的位置，将其设置为不可预约。
      let a = Math.floor((appointment - time) / (1000 * 3600 * 24))
      let b = Math.floor(appointment % (1000 * 3600 * 24) / (1000 * 3600))
      arrtemp[b][a] = 1
      setData(arrtemp)
      message.success(`已经成功为${cat[0].nickname}创建${moment(appointment).format('M月DD日HH时')}的预约`)
    })
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  //查询宠物猫档案——input框值变化
  const handleChange = (e) => {
    const phone = e.target.value
    setValue(phone)
    if (phone) {
      setDataCats(tempDataCats.filter(item => {
        return item.phoneNumber.includes(phone)
      }));
    } else {
      setDataCats(tempDataCats)
    }
  };
  //表格显示的内容
  const columnsModal = [
    {
      title: '猫咪名字',
      dataIndex: 'nickname',
    },
    {
      title: '主人姓名',
      dataIndex: 'catOwner',
    },
    {
      title: '联系电话',
      dataIndex: 'phoneNumber',
    }
  ];
  //选择变化时候的回调
  const catSelect = (_, item) => {
    setCat(item);
  }
  //——————————————————————————————————————————————————————————标签框内容
  const onChange = (key) => {
    // console.log(key);
    setDoctor(key)
  };

  return (
    <div>
      <Tabs defaultActiveKey="1" onChange={onChange}>
        {doctorList.map((item) => {
          return (<TabPane tab={item.name} key={item.id} >
          </TabPane>)
        })}
      </Tabs>
      <Table
        className='table'
        columns={columns}
        dataSource={data}
        pagination={false}
        footer={() => {
          return (<div className='footer'>
            <Button onClick={handleBefore} className='divFT-Button' size='small' ghost='true' type='primary' style={{ float: 'left' }} >前七天</Button>
            <Button onClick={handleAfter} className='divFT-Button' size='small' ghost='true' type='primary' style={{ float: 'right' }} >后七天</Button>
          </div>)
        }}
        bordered
        size="small"
      />
      <Modal title="请选择需要为哪只宠物猫预约" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Input allowClear='true' className='input' value={value} onChange={(e) => handleChange(e)} addonBefore={<PhoneOutlined />}></Input>
        <Table
          size='small'
          columns={columnsModal}
          dataSource={dataCats}
          rowSelection={{ type: 'radio', onChange: (_, item) => { catSelect(_, item) } }}
        />
      </Modal>
    </div>
  )
}
