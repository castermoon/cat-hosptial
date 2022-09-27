import { Modal, Space, Table, Button, Tooltip, Popconfirm, Tag, Typography, message, Switch } from 'antd';
import { DeleteOutlined, MedicineBoxTwoTone, DollarTwoTone } from '@ant-design/icons';

import { useState, useEffect } from 'react';
import moment from "moment";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const { Text } = Typography;
export default function TodoList(props) {
    const columnsBill = [
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: '单价',
            dataIndex: 'sellPrice',
        },
        {
            title: '用量',
            dataIndex: 'useage',
        },
        {
            title: '单项总价',
            dataIndex: 'itemPrice',
            render: (_, record) => { return record.sellPrice * record.useage }
        }
    ];

    // console.log(props);
    const [data, setData] = useState([])
    const [bill, setBill] = useState([])
    // 正在结账的项
    const [editId, setEditid] = useState()

    const [isModalVisible, setIsModalVisible] = useState(false);
    const navi = useNavigate()
    // 查看病历进行跳转
    const naviRecord = (record) => {
        // console.log(record);
        navi('/archives/addrecord', { state: { record: record, cat: record.cat } })
    }
    //删除病历
    const deleteRecord = (id) => {
        console.log(id);
        axios.delete(`http://localhost:8001/records/${id}`).then(
            setData(data.filter(res => {
                return res.id !== id
            }))
        )
    }
    //结账
    const checkOut = (record) => {
        setEditid(record.id);
        axios.get('http://localhost:8001/inStocks').then(res => {
            // 根据用量生成相应的账单
            setBill(record.treatments.map(item => {
                let useItem = res.data.filter(itemRes => {
                    return itemRes.id === item.inStockId
                })
                return {
                    id: item.inStockId,
                    key: item.inStockId,
                    name: useItem[0].name,
                    sellPrice: useItem[0].sellPrice,
                    useage: item.useage
                }
            }))
            console.log(bill);
        })
        setIsModalVisible(true);
    }
    //是否显示所有数据
    const switchChange = (item) => {
        // 当天0点开始往后24小时
        if (item) {
            setData(props.data.filter(item => {
                return item.date < (Date.now() - Date.now() % (24 * 3600 * 1000) + 33 * 3600 * 1000)
            }))
        }else{
            setData(props.data)
        }
        console.log(item);
    }

    const columns = [
        {
            title: '宠物昵称',
            dataIndex: 'cat',
            render: (cat) => (cat.nickname)
        },
        {
            title: '主人姓名',
            dataIndex: 'cat',
            render: (cat) => (cat.catOwner)
        },
        {
            title: '主人电话',
            dataIndex: 'cat',
            render: (cat) => (cat.phoneNumber)
        },
        {
            title: <div>预约时间<Switch onChange={switchChange} defaultChecked="true" checkedChildren="now" unCheckedChildren="all" style={{ float: 'right' }} ></Switch></div>,
            dataIndex: 'date',
            render: (date, record) => (<Tag color={record.bill ? 'success' : "pink"} >{moment(date).format("MM月DD日 HH:mm")}</Tag>)
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="查看病历">
                        <Button shape='circle' onClick={() => naviRecord(record)} icon={<MedicineBoxTwoTone />} />
                    </Tooltip>
                    <Popconfirm title="是否确定删除?" onConfirm={() => deleteRecord(record.id)}>
                        <Button danger='true' icon={<DeleteOutlined />} shape='circle' />
                    </Popconfirm>
                    {record.bill ? <Button onClick={() => checkOut(record)} icon={<DollarTwoTone />} shape='circle' /> : <></>}
                </Space>
            ),
        },
    ];
    useEffect(() => {
        if (props.data) {
            setData(props.data.filter(item => {
                return item.date < (Date.now() - Date.now() % (24 * 3600 * 1000) + 33 * 3600 * 1000)
            }))
        }
    }, [props.data])
    //对话框
    const handleOk = () => {
        axios.patch(`http://localhost:8001/records/${editId}`, { bill: 2, billList: bill }).then(res => {
            message.success('提交成功，正在跳转病历档案页面')
            setTimeout(() => {
                navi('/archives/records')
            }, 1000);

        })
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };


    return (
        <div>
            <Table rowKey={data => data.id} columns={columns} dataSource={data} />
            <Modal title="请确认金额并收款" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Table
                    columns={columnsBill}
                    dataSource={bill}
                    pagination={false}

                    bordered
                    summary={(pageData) => {
                        let totalRepayment = 0;
                        pageData.forEach(({ sellPrice, useage }) => {
                            totalRepayment += sellPrice * useage;
                        });
                        return (
                            <>
                                <Table.Summary.Row >
                                    <Table.Summary.Cell index={0}>总价</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} colSpan={3}>
                                        <Text strong='true' type="danger"><div style={{ float: 'right', marginRight: '75px' }}>{totalRepayment}</div></Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row >
                            </>
                        );
                    }}
                />
            </Modal>
        </div>
    )
}
