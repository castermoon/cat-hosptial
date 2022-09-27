import React, { useState } from 'react'
import { useEffect } from "react";

import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, ContentState, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import './index.css';



export default function DraftEdit(props) {
    //需要从props中传入一个setState方法来改变父组件的状态 props.setContent
    //另外还可以接收一个参数来设置props的初始值 props.content

    //将content作为初始值引入
    useEffect(() => {        //html=> Raw

        const contentBlock = htmlToDraft(props.content);
        // console.log(props.content);
        if (contentBlock) {
            //Raw => content
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setEditorState(editorState)
        }
    }, [props.content])
    //创建内容的状态
    const [editorState, setEditorState] = useState()
    //受控组件，根据输入set内容
    const onEditorStateChange = (editorState) => {
        setEditorState(editorState)
    }
    return (
        <Editor
            //富文本框内容
            editorState={editorState}
            //工具栏的类名
            toolbarClassName="toolbarClassName"
            //整个编辑器的类名
            wrapperClassName="wrapperClassName"
            //编辑框的类名
            editorClassName="editorClassName"
            //当编辑框内容改变之后将内容set到editorState中
            onEditorStateChange={onEditorStateChange}
            //当失去焦点后，通过父组件回调函数将数据交由父组件处理
            onBlur={() => {
                //content => Raw => Html
                props.setContent(draftToHtml(convertToRaw(editorState.getCurrentContent())))
            }}
        />
    )
}
