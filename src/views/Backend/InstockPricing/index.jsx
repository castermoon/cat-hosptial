import { ScissorOutlined, ExperimentOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Popconfirm, Table, Tag } from 'antd';
import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import './index.css'
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default function InstockPricing() {
  useEffect(() => {
    axios.get(`http://localhost:8001/inStocks`).then(res => {
      console.log(res.data);
      setDataSource(res.data)
    })
  }, [])
  const [dataSource, setDataSource] = useState([]);

  const handleDelete = (id) => {
    console.log(id);
    axios.delete(`http://localhost:8001/inStocks/${id}`).then(res =>{
      const newData = dataSource.filter((item) => item.id !== id)
      setDataSource(newData)
    })
  };

  //表格需要显示的内容
  const defaultColumns = [
    {
      title: 'ID',
      dataIndex: 'id',

      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '类型',
      dataIndex: 'type',

      sorter: (a, b) => a.type - b.type,
      render: (type) => {
        return type ? <Tag icon={<ExperimentOutlined />} color="geekblue">消耗药品</Tag> : <Tag icon={<ScissorOutlined />} color="green">医师操作</Tag>
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      editable: true,
    },
    {
      title: '零售价',
      dataIndex: 'sellPrice',
      editable: true,
    },
    {
      title: '总销量',
      dataIndex: 'consumed',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm title="是否确定删除?销量数据也将被删除" onConfirm={() => handleDelete(record.id)}>
            <Button danger='true' icon={<DeleteOutlined />} shape='circle' />
          </Popconfirm>
        ) : null,
    },
  ];
  //点击新增项目时
  const handleAdd = () => {
    const newData = {
      key: Date.now(),
      "type": 0,
      "name": "请输入医生操作",
      "consumed": 0,
      "sellPrice": 0,
    };
    axios.post(`http://localhost:8001/inStocks`,newData).then(res=>{
      console.log(res.data);
      setDataSource([res.data,...dataSource]);
    })
  };
  //修改某个表格中的项之后执行的操作，row参数是修改后的值
  const handleSave = (row) => {
    console.log(row);
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

    // 判断用户输入价格的是否是一个数字，如果是数字就更新到后台
    if (!isNaN(row.sellPrice * 1)) {
      axios.patch(`http://localhost:8001/inStocks/${row.id}`, { name: row.name, sellPrice: row.sellPrice * 1 })
    } else {
      message.error("更新失败，输入的价格不是数字，请重新输入");
    }
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  //ANTD：将表格中需要动态修改的项重新渲染
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <div>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        新增医师操作
      </Button>
      <Table
      size='small'
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
      />
    </div>
  );
};
