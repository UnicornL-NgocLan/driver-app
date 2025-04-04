import { List, Tag } from 'antd'
import { ITransport } from 'interface'
import moment from 'moment'
import { useSelector } from 'react-redux'
import accept from '../../../images/accept.png'
import cancel from '../../../images/cancel.png'
import delivery from '../../../images/fast-delivery.png'
import { useState } from 'react'
import TransportLineDetail from './TransportLineDetail'
import { IoArrowBack } from 'react-icons/io5'
import Skeleton from 'react-loading-skeleton'
import Empty from 'widgets/Empty'
import { myColor } from 'color'


const ReminderLine = ({vehicle,handleClose}:{vehicle:any,handleClose:()=>void}) => {
  const [fetchData,setFetchData] = useState<boolean>(false);
      const [transportLineDetail,setTransportLineDetail] = useState<any[]>([]);
  return (
    <div style={{height:'100vh',overflow:'auto',position:'fixed',width:'100vw',backgroundColor:myColor.backgroundColor,top:0,left:0,zIndex:100}}>
            <div style={{
            position:'sticky',top:0, fontWeight:600, zIndex:1,backgroundColor:myColor.buttonColor,width:'100%', boxShadow:'2px 2px 2px rgba(0,0,0,0.2)'}}>
              <div style = {{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.9rem 1rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:10, padding:0}}>
                  <IoArrowBack style={{fontSize:18,color:'white'}} onClick={handleClose}/>
                  <span style={{fontSize:15, color:'white'}}>{vehicle.name}</span>
                </div>
              </div>
          </div>
            {
                fetchData
                ?
                <div style={{padding:'1rem'}}>
                    <Skeleton count={4} height={150} borderRadius ={3} style={{marginBottom:6}}/>
                </div>
                :
                transportLineDetail.length === 0 
                ?
                <Empty/>
                :
                <div style={{padding:'1rem'}}>
                    
                </div>

            }
    </div>
  )
}

export default ReminderLine