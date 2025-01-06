import React from 'react'
import { Drawer } from 'antd';
import { RootState } from 'redux/store';
import { useSelector } from 'react-redux';

import { Typography } from 'antd';
import { ICompany } from 'interface';

const { Text} = Typography;


const DrawerSelection = ({open,handleClose,handleChangeCompany}:{open:boolean,handleClose:()=>void,handleChangeCompany:(i:number)=>void}) => {
    const companies = useSelector((state: RootState) => state.companies) as ICompany[];
    const auth = useSelector((state: RootState) => state.auth) as any;
    
    const isCurrentCompany = (id:number)  => {
        return auth?.company_id[0] === id ? true : false
    }

  return (
    <Drawer
        title="Thay đổi công ty"
        placement="bottom"
        closable={false}
        onClose={handleClose}
        open={open}
        key = "bottom"
      >
        {companies.map((company: ICompany, index) => {
            return (
                <div key={index} onClick={() => handleChangeCompany(company.id)} style={{padding:'0.5rem 0',display:'flex',justifyContent:'center'}}>
                    <Text style={{color: `${isCurrentCompany(company.id) && 'crimson'}`, fontWeight:`${isCurrentCompany(company.id) && '600'}`}}>{company.short_name}</Text>   
                </div>
            );
        })}
      </Drawer>
  )
}

export default DrawerSelection