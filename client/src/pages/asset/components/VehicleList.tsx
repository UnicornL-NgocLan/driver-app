import { List, Tag } from 'antd'
import { IVehicle, IWarningReminder } from 'interface'
import notAvailable from '../../../images/not-available-circle.png'
import red from '../../../images/round.png'
import blue from '../../../images/record.png'
import yellow from '../../../images/circle.png'
import { useState } from 'react'
import ReminderList from './ReminderLine'
import OdometerLine from './OdometerLine'

const VehicleList = ({data,isForReminder,warningReminders,handleChangeIndex}:{handleChangeIndex:(i:number)=>void,data:IVehicle,isForReminder:boolean,warningReminders?:IWarningReminder[]}) => {
    const [openVehicleReminder, setOpenVehicleReminder] = useState<any>(false);

    const handleOpenVehicleReminders = () => {
        setOpenVehicleReminder(data)
    }

    const handleCloseVehicleReminders = () => {
        setOpenVehicleReminder(false);
        handleChangeIndex(isForReminder ? 2 : 3)
    }

    const handleOdooImage = (image:string) => {
        return image ? `data:image/png;base64,${image}` : notAvailable;
    }

    const checkNumberOfWarningType = (type:string) => {
        if(warningReminders && isForReminder){
            return warningReminders.filter((i)=> i.state === type && i.vehicle_id.length > 0 && i.vehicle_id[0] === data.id).length || 0
        }
    }


  return (
    <>
        <List.Item 
            onClick = {() => handleOpenVehicleReminders()}
            style={{display:'block',background:'white',marginBottom:15,borderRadius:5, boxShadow:'2px 2px 1px rgba(0,0,0,0.2)',padding:10
            }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                        <div style={{display:'flex',alignItems:'center'}}>
                            <img src={handleOdooImage(data?.image)} alt="vehicle" style={{width:60,height:60,objectFit:"contain"}}/>
                        </div>
                        <div>
                            <p style={{margin:0,fontSize:14}}>Hãng: <span style={{marginLeft:0,fontWeight:700}}>{data?.brand_id[1]}</span></p>
                            <p style={{margin:0,fontSize:14}}>Biển số: <span style={{marginLeft:0,fontWeight:700}}>{data?.license_plate}</span></p>
                            <p style={{margin:0,fontSize:14}}>Số Km: <span style={{marginLeft:0,fontWeight:700}}>{Intl.NumberFormat('vi-VN').format(data?.odometer)}</span></p>
                            <Tag color={data.is_on_mission ? "red" : "green"} style={{marginTop:3}}>{data.is_on_mission ? "Đamg chạy giao hàng" : "Khả dụng"}</Tag>
                        </div>
                    </div>
                    {isForReminder && <div>
                        {checkNumberOfWarningType('due_soon')! > 0 && <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <img src={yellow} alt="" style={{height:13,width:13}}/>
                            <span style={{fontSize:14,fontWeight:500}}>{checkNumberOfWarningType('due_soon')}</span>
                        </div>}
                        {checkNumberOfWarningType('due')! > 0 && <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <img src={blue} alt="" style={{height:13,width:13}}/>
                            <span style={{fontSize:14,fontWeight:500}}>{checkNumberOfWarningType('due')}</span>
                        </div>}
                        {checkNumberOfWarningType('overdue')! > 0 && <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <img src={red} alt="" style={{height:13,width:13}}/>
                            <span style={{fontSize:14,fontWeight:500}}>{checkNumberOfWarningType('overdue')}</span>
                        </div>}
                    </div>}
                </div>
        </List.Item>
        {
            openVehicleReminder && isForReminder && <ReminderList vehicle={data} handleClose={handleCloseVehicleReminders} /> 
        }
        {
            openVehicleReminder && !isForReminder && <OdometerLine vehicle={data} handleClose={handleCloseVehicleReminders} /> 
        }      
    </>
  )
}

export default VehicleList