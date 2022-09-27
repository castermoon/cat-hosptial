import { Tree } from 'antd';
import React, {useEffect, useState} from 'react';
import axios from "axios";
const treeData = [
	{
		title: 'parent 1',
		key: '0-0',
		children: [
			{
				title: 'parent 1-0',
				key: '0-0-0',
				children: [
					{
						title: 'leaf',
						key: '0-0-0-0',
					},
					{
						title: 'leaf',
						key: '0-0-0-1',
					},
				],
			},
			{
				title: 'parent 1-1',
				key: '0-0-1',
				children: [
					{
						title: (
							<span
								style={{
									color: '#1890ff',
								}}
							>
                sss
              </span>
						),
						key: '0-0-1-0',
					},
				],
			},
		],
	},
];

const Test = () => {
	const [data,setData] = useState([])
	const [defaultSelectData,setDefaultSelectData] = useState([])
	useEffect(() => {
		axios.get('http://localhost:8001/roles?_expand=rights').then(res => {
				setData(res.data)
			}
		)
	}, [])

	const onSelect = (selectedKeys, info) => {
		console.log('selected', selectedKeys, info);
	};

	const onCheck = (checkedKeys, info) => {
		console.log('onCheck', checkedKeys, info);
	};


	useEffect(() => {
		if(data.length){
			const res = []
			for(let i = 0;i < data.length;i++){
				const item = data[i]
				const de = []
				for(let j = 0;j < item.length;j++){
					console.log(item[j])
				}
			}
		}

		// 		data.forEach(i => {
		// 			i.rights.children.forEach((item) => {
		// 				const de = []
		// 				if(item.right === 1){
		// 					item.children.forEach((item2) => {
		// 						if(item2.right === 1){
		// 							res.push(item2.key)
		// 						}
		// 					})
		// 				}
		// 				res.push(de)
		// 			})
		// 		})
		//
		// setDefaultSelectData(res)
	}, [data])

	console.log(defaultSelectData)
	console.log(data)

	return (
		<div>
			{
				data.length && defaultSelectData.length &&	<Tree
					checkable
					defaultCheckedKeys={defaultSelectData}
					onSelect={onSelect}
					onCheck={onCheck}
					treeData={data.length && data[0].rights.children}
				/>
			}
			{/*<Tree*/}
			{/*	checkable*/}
			{/*	// defaultSelectedKeys={['0-0-0-0', '0-0-1']}*/}
			{/*	defaultCheckedKeys={['0-0-0-0', '0-0-1']}*/}
			{/*	onSelect={onSelect}*/}
			{/*	onCheck={onCheck}*/}
			{/*	treeData={treeData}*/}
			{/*/>*/}
		</div>

	);
};

export default Test;
