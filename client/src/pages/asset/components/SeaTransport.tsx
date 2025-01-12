import { List, Tag } from 'antd'
import { ITransport } from 'interface'
import moment from 'moment'
import { useSelector } from 'react-redux'
import accept from '../../../images/accept.png'
import cancel from '../../../images/cancel.png'
import delivery from '../../../images/fast-delivery.png'
import { useState } from 'react'
import TransportLineDetail from './TransportLineDetail'


const SeaTransport = ({data}:{data:ITransport}) => {
  const drivers = useSelector((state:any) => state.drivers) as any[];
  const [openDetail,setOpenDetail] = useState<number | false>(false);

  const handleShowDrivers = (idList:number[]) => {
    if(idList.length === 0) return <></>
    const officeList = [...idList].map((id)=>{
        const transportDrivers = drivers.find((item: {id:number,name:string}) => item.id === id);
        if(!transportDrivers) return <></>
        return <Tag style={{margin:0,fontSize:13,marginRight:5}} key={transportDrivers.id}>{transportDrivers?.name}</Tag>
    })

    return officeList
  }

  const handleClose = () => {
    setOpenDetail(false);
  }

  const getColor = (state:string) => {
    switch(state){
      case 'start':
        return 'black';
      case 'done':
        return 'green';
      case 'cancel':
        return 'crimson';
      default:
        return 'black';
    }
  }

  const getImage = (state:string) => {
    switch(state){
      case 'start':
        return delivery;
      case 'done':
        return accept;
      case 'cancel':
        return cancel;
      default:
        return delivery;
    }
  }

  return (
    <>
      <List.Item 
        onClick = {() => setOpenDetail(data.id)}
        style={{display:'block',background:'white',marginBottom:20,borderRadius:5, boxShadow:'2px 2px 1px rgba(0,0,0,0.2)',padding:10
        }}>
            <List.Item.Meta
            title={<span style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:0, fontSize:14,fontWeight:700,color:getColor(data.state)}}><span>{data.name}</span><img alt="" src={getImage(data.state)} style={{height:18}}/></span>}
            />
            <div style={{display:'flex',flexDirection:'column',gap:8}}> 
              <span style={{fontSize:14}}>
                    <span style={{fontWeight:600}}>Tài xế: </span> {handleShowDrivers(data.sea_driver_id)}
                </span>
                <span style={{fontSize:14}}>
                    <span style={{fontWeight:600}}>Phương tiện: </span>{data.vehicle_id[1]}
                </span>
                <span style={{fontSize:14}}>
                    <span style={{fontWeight:600}}>Khởi hành lúc: </span>{moment(data.date_start_actual).add(7,'hours').format('DD-MM-YYYY HH:mm:ss')}
                </span>
            </div>
      </List.Item>
      {
        openDetail && <TransportLineDetail transport={data} handleClose={handleClose}/>
      }
    </>
  )
}

export default SeaTransport