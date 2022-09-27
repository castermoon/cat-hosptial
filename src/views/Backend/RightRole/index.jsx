import { SettingOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag, Tooltip, Modal, Tree, message } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
//表格需要展示的内容


export default function RightRole() {
  //表格数据
  const [data, setData] = useState()
  //需要回传到json的数据
  const [rightEdit, setRightEdit] = useState()
  //对话框显示状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  //对话框对应的id值
  const [idEdit, setIdEdit] = useState()
  //树形控件
  const [treeData, setTreeData] = useState();
  const [expandedKeys, setExpandedKeys] = useState([]);
  // const [checkedKeys, setCheckedKeys] = useState([]);
  //增加选中和半选中
  const [allCheckedKeys, setAllCheckedKeys] = useState([]);
  const [halfCheckedKeys, setHalfCheckedKeys] = useState([]);

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const color = ['', 'red', 'geekblue', 'green','']

  useEffect(() => {
    axios.get('http://localhost:8001/roles?_expand=rights').then(res => {
        // console.log(res.data);
        setData(res.data)
      }
    )
  }, [])


  //表格展示内容
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',

    },
    {
      title: '角色名称',
      dataIndex: 'katagaki',
      render: (dataIndex, record) => {
        return (
          <Tag color={color[record.rightsId]} key={dataIndex}>
            {dataIndex}
          </Tag>
        )
      }
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="修改权限">
            <Button shape="circle" onClick={() => handleClick(record)} icon={<SettingOutlined />}></Button>
          </Tooltip>
        </Space>
      ),
    },
  ];
  //点击按钮
  const handleClick = (item) => {
    //储存当前正在处理的权限的id
    setIdEdit(item.rightsId)
    //复选框选中状态从json读取
    axios.get(`http://localhost:8001/rights/${item.rightsId}`).then(res => {
      let arr = []
      res.data.children.forEach(child => {
        child.children.forEach(item => {
          if (item.right === 1) {
            return arr.push(item.key)
          }
        })
      });
      //储存请求到的数据用于对话框组件点击确定后，通过put请求将json中的数据替换
      setRightEdit(res.data)
      //非最低级子节点的复选框，树形控件都会自动处理，所以这里只处理最低一级的子节点权限
      setAllCheckedKeys(arr)
    })
    setIsModalVisible(true);
    //树形控件结构直接从传来的数据读取
    setTreeData(item.rights.children)
  };

  //modal对话框点击
  const handleOk = () => {
    setIsModalVisible(false)
    // console.log(allCheckedKeys);
    let arr = rightEdit
    arr.children.forEach(child => {
      if (allCheckedKeys.includes(child.key)) {
        child.right = 1;
        child.children.forEach(item => {
          if (allCheckedKeys.includes(item.key)) {
            item.right = 1;
          } else {
            item.right = 0;
          }
        })
      } else {
        child.right = 0;
        child.children.forEach(item => {
          if (allCheckedKeys.includes(item.key)) {
            item.right = 1;
            child.right = 1;
          } else {
            item.right = 0;
          }
        })
      }
    })
    axios.put(`http://localhost:8001/rights/${idEdit}`, arr).then(res => {
      // console.log(res);//增加提示信息
      if(res.status===200){
        message.success('已经成功更新用户权限')
      }else{
        message.error('error:'+res.statusText);
      }
    })
  }
  const handleCancel = () => {
    setIsModalVisible(false)
  }

  //树形控件 antd复制
  const onExpand = (expandedKeysValue) => {
    // console.log('onExpand', expandedKeysValue);
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };
  //antd复制**修改**为可以获取半选中
  const onCheck = (checkedKeysValue, e) => {
    setHalfCheckedKeys(e.halfCheckedKeys)
    // console.log('half' + e.halfCheckedKeys);
    setAllCheckedKeys(checkedKeysValue)
    // console.log(checkedKeysValue);
  };
  //antd复制**修改**为选中也会变更checkBox
  const onSelect = (selectedKeysValue, info) => {
    //   console.log('onSelect', info);
    if (info.node.rank === 2) {
      if (info.node.checked) {
        setAllCheckedKeys(allCheckedKeys.filter(item => {
          return !info.node.key.includes(item)
        }
        ))
        // console.log(allCheckedKeys);
      } else {
        setAllCheckedKeys([...allCheckedKeys, info.node.key])
      }
    } else {
      if (info.node.checked) {//如果是选中状态，则取消所有选中
        let arr = allCheckedKeys
        arr = arr.filter(item => {
          return item !== info.node.key
        })
        info.node.children.forEach(child => {
          arr = arr.filter(item => {
            return item !== child.key
          })
        })
        setAllCheckedKeys(arr)
      } else {//如果是非选中状态，则选择所有
        let arr = allCheckedKeys
        info.node.children.forEach(child => {
          if (!arr.includes(child.key)) {
            arr.push(child.key)
          }
        })
        setAllCheckedKeys(arr)
      }
    }
    setSelectedKeys(selectedKeysValue);
  };

  return (
    <div>
      <Table columns={columns} dataSource={data} />
      <Modal title="请选择需要修改的权限" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Tree
          checkable
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={{ checked: allCheckedKeys, halfChecked: halfCheckedKeys }}
          onSelect={onSelect}
          selectedKeys={selectedKeys}
          treeData={treeData}
        />
      </Modal>
    </div>
  )
}



