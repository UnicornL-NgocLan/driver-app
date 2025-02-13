import { Button, List } from 'antd'
import { ITransportLine } from 'interface'
import { myColor } from 'color'


const TransportLine = ({data,showTimePicker,handleCancelOrder}:{data:ITransportLine,showTimePicker:(i:ITransportLine)=>void,handleCancelOrder:(i:ITransportLine)=>void}) => {

  return (
    <List.Item 
        style={{display:'block',background:'white',marginBottom:20,borderRadius:5, boxShadow:'2px 2px 1px rgba(0,0,0,0.2)',padding:10
        }}>
            <List.Item.Meta
            title={<span style={{margin:0, fontSize:14,fontWeight:700}}>{data.name}</span>}
            />
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {data.item_type && <span style={{fontSize:14}}>
                    {/* <img alt='' src={box} style={{height:14}}/> */}
                    <span style={{fontWeight:500}}>Hàng hóa: </span><span>{data.item_type}</span>
                </span>}
                <span style={{fontSize:14}}>
                    {/* <img alt='' src={partner} style={{height:14}}/> */}
                    <span style={{fontWeight:500}}>Đối tác: </span><span>{data.partner_id[1]}</span>
                </span>
                <span style={{fontSize:14}}>
                    {/* <img alt='' src={location} style={{height:14}}/> */}
                    <span style={{fontWeight:500}}>Từ: </span><span>{data.address_start}</span>
                </span>
                <span style={{fontSize:14}}>
                    {/* <img alt='' src={marker} style={{height:14}}/> */}
                    <span style={{fontWeight:500}}>Đến: </span><span>{data.address_end}</span>
                </span>
                {data.note && <span style={{fontSize:14}}>
                    {/* <img alt='' src={pencil} style={{height:12}}/> */}
                    <span style={{fontWeight:500}}>Ghi chú: </span><span>{data.note}</span>
                </span>}
                {data.state === 'start' && <Button 
                onClick={() => showTimePicker(data)}
                color="default" variant="solid" style={{background:myColor.buttonColor, fontWeight:500}}>
                    Giao hàng
                </Button>}
                {data.state === 'ready' && <Button 
                onClick={() => handleCancelOrder(data)}
                color="default" variant="solid" style={{background:myColor.dangerColor, fontWeight:500}}>
                    Hủy đơn
                </Button>}
            </div>
        </List.Item>
  )
}

export default TransportLine