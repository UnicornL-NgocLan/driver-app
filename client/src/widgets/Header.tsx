import { myColor } from 'color';
import { useEffect,useState } from 'react';
import {Form } from 'antd';
import { FaBuilding } from "react-icons/fa";
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from 'redux/store';
import { GrLogout } from "react-icons/gr";
import { ICompany } from 'interface';
import { FaExchangeAlt } from "react-icons/fa";
import type { MenuProps } from 'antd';
import DrawerSelection from './Drawer';
import { Dropdown } from 'antd';
import { FaCaretDown } from "react-icons/fa";
import type { SelectProps } from 'antd';
import app from 'axiosConfig';
import _ from 'lodash';

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}


const Header = ({handleChangeCompany}:{handleChangeCompany:(i:number)=>void}) => {
    const dispatch = useDispatch();
    const [openDrawer, setOpenDrawer] = useState(false);
    const companies = useSelector((state: RootState) => state.companies);
    const auth = useSelector((state: RootState) => state.auth) as any;

    const [myCurrentCompanyShortName,setMyCurrentCompanyShortName] = useState<string>('');
    const [form] = Form.useForm();


    const getMyCurrentCompanyShortName = () => {
        if(companies.length>0){
            const currentOne = companies.find((com:ICompany) => com.id === auth?.company_id[0]);
            if(!currentOne) {
                setMyCurrentCompanyShortName("Không tồn tại");
            }else{
                setMyCurrentCompanyShortName(currentOne.short_name);
            }
        }else{
            const comName = auth?.company_id[1];
            setMyCurrentCompanyShortName(comName);
        }
    }

    const handleOpenCompanySelection = () => {
        setOpenDrawer(true);
    }

    const handleClose = () => {
        setOpenDrawer(false);
    };

    const handleLogout = async () => {
        if(window.confirm("Bạn có muốn đăng xuất?")){
            await app.delete("/api/logout")
            dispatch({type:"logout"});
        }
    }

    const items: MenuProps['items'] = [
      {
        label: <span style={{fontSize:14}}>Đổi công ty</span>,
        key: '1',
        icon: <FaExchangeAlt/>,
        onClick: () => handleOpenCompanySelection()
      },
      {
        label: <span style={{color:'red',fontSize:14}}>Đăng xuất</span>,
        key: '2',
        icon: <GrLogout style={{color:'red'}}/>,
        onClick: () => handleLogout()
      },
    ];

    useEffect(() => {
      getMyCurrentCompanyShortName();
    }, [auth]);

  return (
    <>
      <div style={{
        position:'sticky',top:0, zIndex:1,backgroundColor:myColor.buttonColor,width:'100%', boxShadow:'2px 2px 2px rgba(0,0,0,0.2)'}}>
          <div style = {{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:8, padding:0}}>
              <FaBuilding style={{fontSize:14,color:'white'}}/>
              <span style={{fontSize:14, color:'white',fontWeight:600}}>{myCurrentCompanyShortName}</span>
            </div>
            <Dropdown menu={{ items }} placement="bottomRight" arrow>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <span style={{color:'white',fontSize:14,fontWeight:600}}>{auth?.name}</span>
                  <FaCaretDown style={{fontSize:16,color:'white'}}/>
              </div>  
            </Dropdown>
          </div>
      </div>
      <DrawerSelection open = {openDrawer} handleClose = {handleClose} handleChangeCompany={handleChangeCompany}/>
    </>
  )
}

export default Header