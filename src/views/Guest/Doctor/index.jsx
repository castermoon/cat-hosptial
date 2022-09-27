import {  Col, Row, Image } from 'antd';
import {  useLocation } from 'react-router-dom';
import React from 'react';
import './index.css'
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Doctor() {
    const location = useLocation()
    const [doctor, setDoctor] = useState([])
    useEffect(() => {
        axios.get(`http://localhost:8001/staff/${location.pathname.split('/')[3]}`).then(res => {
            setDoctor(res.data);
        })
    }, [location.pathname])
    const contentStyle = {
        width: '610px',
        height: '380px',
        color: '#fff',
        lineHeight: '160px',
        textAlign: 'center',
        background: '#364d79',
    };
    return (
        <div>
            <Row align="top" className='rowMiddle' >
                <Col align='top' span={8}>
                    <div dangerouslySetInnerHTML={{ __html: doctor.length !== 0 ? doctor.intro : '' }} style={{ overflow: 'auto' }} ></div>
                </Col>
                <Col  align="middle" span={16}>
                    <div>
                        <Image style={contentStyle}
                            src="https://joeschmoe.io/api/v1/random"
                        />
                        <div className='name' >{doctor.length !== 0 ? doctor.name : '' }</div>
                    </div>
                </Col>
            </Row>
        </div>
    )
}
