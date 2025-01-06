import { List } from 'antd'
import marker from '../../../images/placeholder.png'
import box from '../../../images/box.png'
import location from '../../../images/location.png'
import partner from '../../../images/manager.png'
import { ITransport, ITransportLine } from 'interface'
import { myColor } from 'color'
import { useEffect, useState } from 'react'
import { getErrorMessage } from 'helpers/getErrorMessage'
import app from 'axiosConfig'
import Skeleton from 'react-loading-skeleton'
import { IoArrowBack } from "react-icons/io5";
import Empty from 'widgets/Empty'
import accept from '../../../images/accept.png'
import cancel from '../../../images/cancel.png'
import delivery from '../../../images/fast-delivery.png'
import clock from '../../../images/clock.png'
import pencil from '../../../images/pencil.png'
import moment from 'moment'


const TransportLineDetail = ({transport,handleClose}:{transport:ITransport,handleClose:()=>void}) => {
    const [fetchData,setFetchData] = useState<boolean>(false);
    const [transportLineDetail,setTransportLineDetail] = useState<ITransportLine[]>([]);

    const handleGetTransportLineDetail = async () => {
        try {
            setFetchData(true);
            const {data} = await app.get(`/api/get-transport-line/?id=${transport.id}&getAll=true`);
            setTransportLineDetail(data.data);
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
        } finally {
            setFetchData(false);
        }
    }

    useEffect(() => {
        handleGetTransportLineDetail()
    },[])

  return (
    <div style={{height:'100vh',overflow:'auto',position:'fixed',width:'100vw',backgroundColor:myColor.backgroundColor,top:0,left:0,zIndex:100}}>
        <div style={{
        position:'sticky',top:0, fontWeight:600, zIndex:1,backgroundColor:myColor.buttonColor,width:'100%', boxShadow:'2px 2px 2px rgba(0,0,0,0.2)'}}>
          <div style = {{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:8, padding:0}}>
              <IoArrowBack style={{fontSize:19,color:'white'}} onClick={handleClose}/>
              <span style={{fontSize:13, color:'white'}}>{transport.name}</span>
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
                <List
                    itemLayout="horizontal"
                    dataSource={transportLineDetail}
                    renderItem={(item, index) => <TransportLineItem key={index} data={item}/>}
                />
            </div>

        }
    </div>
  )
}

export default TransportLineDetail



const TransportLineItem = ({data}:{data:ITransportLine}) => {
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
        <List.Item 
        style={{display:'block',background:'white',marginBottom:20,borderRadius:5, boxShadow:'2px 2px 1px rgba(0,0,0,0.2)',padding:10
        }}>
            <List.Item.Meta
            title={<span style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:0, fontSize:13,fontWeight:700,color:getColor(data.state)}}><span>{data.name}</span><img alt="" src={getImage(data.state)} style={{height:17}}/></span>}
            />
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {data.item_type && <span style={{fontSize:13, display:'flex', gap:10,alignItems:'center'}}>
                    <img alt='' src={box} style={{height:14}}/>
                    {data.item_type}
                </span>}
                <span style={{fontSize:13, display:'flex', gap:10,alignItems:'center'}}>
                    <img alt='' src={partner} style={{height:14}}/>
                    {data.partner_id[1]}
                </span>
                <span style={{fontSize:13, display:'flex', gap:10,alignItems:'center'}}>
                    <img alt='' src={location} style={{height:14}}/>
                    {data.address_start}
                </span>
                <span style={{fontSize:13, display:'flex', gap:10,alignItems:'center'}}>
                    <img alt='' src={marker} style={{height:14}}/>
                    {data.address_end}
                </span>
                {data.date_end_actual && <span style={{fontSize:14, display:'flex', gap:10,alignItems:'center'}}>
                    <img alt='' src={clock} style={{height:14}}/>
                    {moment(data.date_end_actual).add(7,'hours').format('DD-MM-YYYY HH:mm:ss')}
                </span>}
                {data.note && <span style={{fontSize:13, display:'flex', gap:10,alignItems:'center'}}>
                    <img alt='' src={pencil} style={{height:12}}/>
                    {data.note}
                </span>}
            </div>
        </List.Item>
    )
}