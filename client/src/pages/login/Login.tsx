import { useState } from 'react';
import type { FormProps } from 'antd';

import { Button, Form, Input, Image } from 'antd';
import {myColor} from 'color'
import {useDispatch} from 'react-redux'
import logo from 'images/seacorp-logo.png'
import { getErrorMessage } from 'helpers/getErrorMessage';
import { addAuth } from '../../redux/reducers/authReducer.tsx';
import app from 'axiosConfig.tsx';

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};


const Login = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  
  const onFinish: FormProps<FieldType>['onFinish'] = async ({username,password}) => {
    try {
      if(loading) return;
      setLoading(true);

      const {data}:any = await app.post("/api/login",{
        username,
        password
      });

      if(data.data.length>0){
        dispatch(addAuth(data.data[0]))
      }

    } catch (error:any) {
      alert(getErrorMessage(error))
    } finally {
      setLoading(false);
    }
  };
  
  
  
  return (
    <div style={{
      backgroundColor :myColor.backgroundColor,
      display:'fixed',
      height:'100vh',
      top:0,
      bottom:0,
      left:0,
      right:0,
    }}>
      <div
        style={{
          display:'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}  
      >
        <Form
          name="basic"
          style = {{width:'100%',padding:30}}
          onFinish={onFinish}
          autoComplete="on"
        >

          <div style={{display:'flex',justifyContent:'center'}}>
            <Image src = {logo} style={{maxWidth:200}} preview = {false} alt=""/>
          </div>

          <Form.Item<FieldType>
            label="Tên đăng nhập"
            name="username"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input size='large' style ={{fontSize:14}} disabled = {loading}/>
          </Form.Item>

          <Form.Item<FieldType>
            label="Mật khẩu"
            name="password"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password size='large' style ={{fontSize:14}} disabled = {loading}/>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <Button type="primary" htmlType="submit" size='large' loading = {loading}
            style = {{background: myColor.buttonColor, width:'100%', marginTop:10, fontSize:14}}>
              {loading ? 'Đang xác thực' : 'Đăng nhập'} 
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
} 

export default Login;