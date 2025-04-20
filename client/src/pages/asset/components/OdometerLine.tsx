import { useEffect, useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import Skeleton from 'react-loading-skeleton'
import { myColor } from 'color'
import { getErrorMessage } from 'helpers/getErrorMessage'
import { Table, Modal, InputNumber } from 'antd'
import { IOdometerLine, IVehicle } from 'interface'
import moment from 'moment';
import app from 'axiosConfig'
import Empty from 'widgets/Empty'
import { RiAddLargeFill } from "react-icons/ri";

const columns = [
  {
    title: 'Ngày',
    dataIndex: 'date',
    key: 'date',
    align: 'center' as any,
    className: 'date-column',
    render: (date:string) => {
      return <span style={{fontSize:14}}>{moment(date).format("DD-MM-YYYY")}</span>;
    },
  },
  {
    title: 'Giá trị nhập',
    dataIndex: 'value',
    key: 'value',
    align: 'center' as any,
    className: 'date-column',
    render: (value:number) => {
      return <span style={{fontSize:14}}>{Intl.NumberFormat('vi-VN').format(value)}</span>;
    },
  },
  {
    title: 'Người nhập',
    dataIndex: 'create_uid',
    key: 'create_uid',
    align: 'center' as any,
    className: 'date-column',
    render: (create_uid:[number,string]) => {
      return <span style={{fontSize:14}}>{create_uid[1]}</span>;
    },
  },
];

const OdometerLine = ({vehicle,handleClose}:{vehicle:IVehicle,handleClose:()=>void}) => {
    const [fetchData,setFetchData] = useState<boolean>(false);
    const [odometerLines,setOdometerLines] = useState<IOdometerLine[]>([]);
    const [open,setOpen] = useState<boolean>(false);
    const [confirmLoading,setConfirmLoading] = useState<boolean>(false);
    const [value,setValue] = useState(0);

    const fetchOdooMeterLines = async () => {
      try {
        setFetchData(true);
        const {data} = await app.get(`/api/get-vehicle-odometer-value?vehicle_id=${vehicle.id}`);
        if(data.data){
            setOdometerLines(data.data);
        }

      } catch (error) {
        const message = getErrorMessage(error);
        alert(message);
      } finally {
        setFetchData(false);
      }
    }

    const openModal = () => {
        setValue(0);
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false); 
    }

    const handleAction = async () => {
      try {
        setConfirmLoading(true);
        await app.post('/api/add-vehicle-odometer-value',{
          vehicle_id:vehicle.id,
          odometer_value:value,
          date: moment(new Date()).format("YYYY-MM-DD"),
        })
        await fetchOdooMeterLines();
        handleCancel();
      } catch (error) {
        const message = getErrorMessage(error);
        alert(message);
      } finally {
        setConfirmLoading(false)
      }
    };
    
    useEffect(() => {
      fetchOdooMeterLines();
    }, []);
  return (
    <div style={{height:'100vh',overflow:'auto',position:'fixed',width:'100vw',backgroundColor:myColor.backgroundColor,top:0,left:0,zIndex:100}}>
            <div style={{
            position:'sticky',top:0, fontWeight:600, zIndex:1,backgroundColor:myColor.buttonColor,width:'100%', boxShadow:'2px 2px 2px rgba(0,0,0,0.2)'}}>
              <div style = {{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.9rem 1rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:10, padding:0}}>
                  <IoArrowBack style={{fontSize:18,color:'white'}} onClick={handleClose}/>
                  <span style={{fontSize:15, color:'white'}}>{vehicle.brand_id[1]} / {vehicle.license_plate}</span>
                </div>
                <RiAddLargeFill style={{fontSize:20,fontWeight:700,color:'white'}} onClick={openModal}/>
              </div>
          </div>
            {
                fetchData
                ?
                <div style={{padding:'1rem'}}>
                    <Skeleton count={4} height={150} borderRadius ={3} style={{marginBottom:6}}/>
                </div>
                :
                <div style={{padding:'1rem'}}>
                    <Table
                      columns={columns}
                      bordered
                      rowKey={record => record.id ?? 'default-key'}
                      locale = {{ emptyText: <Empty/> }}
                      size = "small"
                      dataSource={odometerLines}
                      pagination={false}
                    />
                </div>

            }
             <Modal
            title="Nhập số Km hiện tại của phương tiện"
            open={!!open}
            okButtonProps={{style:{background:myColor.buttonColor}}}
            cancelText="Hủy"
            centered
            maskClosable={false}
            okText="Xác nhận"
            closeIcon = {!confirmLoading}
            onOk={handleAction}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
            >
                <InputNumber 
                value={value}
                size='large'
                inputMode = "numeric"
                autoFocus={true}
                formatter={(value) =>
                  value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
                }
                parser={value =>
                  value ? parseInt(value.toString().replace(/\./g, ''), 10) : 0
                }
                onChange={(value:any)=>setValue(value)}
                min = {0}
                addonAfter="km" style={{marginTop:10, marginBottom:10}}/>
            </Modal>
    </div>
  )
}

export default OdometerLine