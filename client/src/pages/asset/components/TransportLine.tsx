import { Button, List } from 'antd'
import marker from '../../../images/placeholder.png'
import box from '../../../images/box.png'
import location from '../../../images/location.png'
import partner from '../../../images/manager.png'
import pencil from '../../../images/pencil.png'
import { ITransportLine } from 'interface'
import { myColor } from 'color'


const TransportLine = ({data,showTimePicker}:{data:ITransportLine,showTimePicker:(i:ITransportLine)=>void}) => {

  return (
    <List.Item 
        style={{display:'block',background:'white',marginBottom:20,borderRadius:5, boxShadow:'2px 2px 1px rgba(0,0,0,0.2)',padding:10
        }}>
            <List.Item.Meta
            title={<span style={{margin:0, fontSize:13,fontWeight:700}}>{data.name}</span>}
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
                {data.note && <span style={{fontSize:13, display:'flex', gap:10,alignItems:'center'}}>
                    <img alt='' src={pencil} style={{height:12}}/>
                    {data.note}
                </span>}
                {data.state === 'start' && <Button 
                onClick={() => showTimePicker(data)}
                color="default" variant="solid" style={{background:myColor.buttonColor, fontWeight:500}}>
                    Giao hàng
                </Button>}
            </div>
        </List.Item>
  )
}

export default TransportLine