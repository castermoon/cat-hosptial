import { Button, Carousel, Col, Row, Space,Image,Spin } from 'antd';
import { PhoneTwoTone } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import {useSelector} from 'react-redux'
import './index.css'

const contentStyle = {
  width:'600px',
  height: '360px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};

export default function Guest() {
  const modeReducer = useSelector(state=>state.loadingReducer)
  const guest = localStorage.getItem('guest')
  const location = useLocation()
  const navi = useNavigate()
  //映射表
const routeList = {
  "/guest": { width: '960px' },
  '/guest/appointment':{ width: '660px' },
  '/guest/view':{ width: '660px' },
  '/guest/register':{ width: '660px' },
}
  // console.log(location);
  return (
    <div className='page' style={routeList[location.pathname]===undefined?{ width: '960px' }:routeList[location.pathname]}>
      <Row align="middle"  >
        <Col span={8}><span><img  style={{ cursor: 'pointer'}}  onClick={()=>navi('/guest')} src="/19-cat.png" alt='logo' width="40px" /></span> </Col>
        <Col align="middle" span={8}><span className='title' >まるまる動物病院</span></Col>
        <Col align="right"  style={{ cursor: 'pointer'}} span={8}>{guest?<div className='guest' onClick={()=>{ localStorage.removeItem('guest',navi('/guest')) }} >取消登陆</div>:<div  onClick={()=>{navi('/guest/view')}} className='guest'>游客登陆</div>}</Col>
      </Row>
      <hr />

      <Row align="middle" justify='center' >
        <div style={location.pathname.includes('guest/doctor')? { width: '960px' } : routeList[location.pathname]} >
          <Spin spinning={modeReducer.isLoading} >
            <Outlet />
          </Spin>
        </div>
      </Row>
      {location.pathname === "/guest" ? <Row align="top" className='rowMiddle' >
        <Col align='top' span={8}>
          <div className='number'>诊疗时间（全年无休）</div>
          <div className='timeDiv'>
            <div>上午：9:00~12:00 (11:00停止挂号)</div>
            <div>下午：12:00~18:00 (18:00停止挂号)</div>
          </div>
          <div className='smallDiv'>如遇紧急情况请直接电话联系</div>
          <div className='number' ><PhoneTwoTone /> 132-2323-2030</div>
          <Row><Col span={7} className='spanT' >预约方式</Col><Col className='spanC'>网页或电话预约</Col></Row>
          <Row><Col span={7} className='spanT'>诊疗对象</Col><Col className='spanC'>猫</Col></Row>
          <Row><Col span={7} className='spanT'>宠物保险</Col><Col className='spanC'>阿里宠物险定点医院</Col></Row>
          <Row><Col span={7} className='spanT'>支付方式</Col><Col className='spanC'>现金、信用卡及各种支付APP</Col></Row>
          <Row><Col span={7} className='spanT'>地址</Col><Col className='spanC'>杭州市西湖区余杭塘路</Col></Row>
          <Row><Col span={7} className='spanT'>停车场</Col><Col className='spanC'>10个车位</Col></Row>

        </Col>
        <Col align="middle" span={16}>
          <Carousel autoplay>
            <div>
            <Image style={contentStyle} onClick={()=>navi('/guest/doctor/1')}
                src="https://joeschmoe.io/api/v1/random"
              />
            </div>
            <div>
            <Image style={contentStyle} onClick={()=>navi('/guest/doctor/2')}
                src="https://joeschmoe.io/api/v1/random"
              />
            </div>
            <div>
            <Image style={contentStyle} onClick={()=>navi('/guest/doctor/3')}
                src="https://joeschmoe.io/api/v1/random"
              />
            </div>
            <div>
            <Image style={contentStyle} onClick={()=>navi('/guest/doctor/4')}
                src="https://joeschmoe.io/api/v1/random"
              />
            </div>
          </Carousel>
          <Space style={{ float: 'right' }}>
            <Button onClick={() => { navi('appointment') }} >WEB预约</Button>
            <Button onClick={() => { navi('view') }} >预约查询</Button>
          </Space>
        </Col>
      </Row> : <></>}

    </div>
  )
}
