import { Layout, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import SiderMenu from '../../component/SiderMenu'
import Top from '../../component/Top'
import {useSelector} from 'react-redux'
import './index.css'
const { Content } = Layout;

const Backend = () => {
    const modeReducer= useSelector(state=>state.loadingReducer)
    // console.log(modeReducer.isLoading);
    return (
        <Layout>
            <SiderMenu />
            <Layout className="site-layout">
                <Top />
                <Content className="site-layout-background" style={{ background: 'white' }}>
                    <Spin spinning={modeReducer.isLoading}>
                        <Outlet />
                    </Spin>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Backend;
