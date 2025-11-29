import { useEffect, useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import Skeleton from 'react-loading-skeleton'
import { myColor } from 'color'
import { getErrorMessage } from 'helpers/getErrorMessage'
import { Table, Modal, InputNumber } from 'antd'
import { IFuelLog, IVehicle } from 'interface'
import moment from 'moment';
import app from 'axiosConfig'
import Empty from 'widgets/Empty'
import { Switch } from 'antd';
import { RiAddLargeFill } from "react-icons/ri";
import { set } from 'lodash'

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
    title: 'Số lít',
    dataIndex: 'liter',
    key: 'liter',
    align: 'center' as any,
    className: 'date-column',
    render: (liter:number) => {
      return <span style={{fontSize:14}}>{Intl.NumberFormat('vi-VN').format(liter)}</span>;
    },
  },
  {
    title: 'Số Km',
    dataIndex: 'odometer',
    key: 'odometer',
    align: 'center' as any,
    className: 'date-column',
    render: (odometer:number) => {
      return <span style={{fontSize:14}}>{Intl.NumberFormat('vi-VN').format(odometer)}</span>;
    },
  },
  {
    title: 'Tiền đổ',
    dataIndex: 'amount',
    key: 'amount',
    align: 'center' as any,
    className: 'date-column',
    render: (amount:number) => {
      return <span style={{fontSize:14}}>{Intl.NumberFormat('vi-VN').format(amount)}</span>;
        },
    }
];

const OdometerLine = ({vehicle,handleClose}:{vehicle:IVehicle,handleClose:()=>void}) => {
    const [fetchData,setFetchData] = useState<boolean>(false);
    const [fuelLogLines,setFuelLogLines] = useState<IFuelLog[]>([]);
    const [open,setOpen] = useState<boolean>(false);
    const [confirmLoading,setConfirmLoading] = useState<boolean>(false);
    const [value,setValue] = useState(0);
    const [odometerValue,setOdometerValue] = useState<number>(0);
    const [amountValue,setAmountValue] = useState<number>(0);
    const [isFull,setIsFull] = useState<boolean>(false);
    const [recordViewed,setRecordViewed] = useState<IFuelLog | null>(null);

    const fetchOdooMeterLines = async () => {
      try {
        setFetchData(true);
        const {data} = await app.get(`/api/get-fuel-log-list?vehicle_id=${vehicle.id}`);
        if(data.data){
            setFuelLogLines(data.data);
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
        setOdometerValue(0);
        setAmountValue(0);
        setIsFull(false);
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
        setRecordViewed(null);
        setValue(0);
        setOdometerValue(0);
        setAmountValue(0);
        setIsFull(false);
    }

    const handleAction = async () => {
      try {
        if(recordViewed){
            if(window.confirm("Bạn có chắc muốn xóa bản ghi này không ?")){
                setConfirmLoading(true);
                await app.delete(`/api/delete-vehicle-fuel-log/${recordViewed.id}`);
                await fetchOdooMeterLines();
                handleCancel();
            }
        }else{
            setConfirmLoading(true);
            await app.post('/api/add-vehicle-fuel-log',{
              vehicle_id:vehicle.id,
              liter: value,
              odometer: odometerValue,
              is_full: isFull,
              amount: amountValue,
            })
            await fetchOdooMeterLines();
            handleCancel();
        }
      } catch (error) {
        const message = getErrorMessage(error);
        alert(message);
      } finally {
        setConfirmLoading(false)
      }
    };

    const handleViewRecord = (id:number) => {
        setOpen(true);
        const record = fuelLogLines.find(item => item.id === id) ?? null;
        if(record) {
            setRecordViewed(record);
            setValue(record.liter);
            setOdometerValue(record.odometer);
            setAmountValue(record.amount);
            setIsFull(record.is_full);
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
                      rowClassName={(record) => (record.is_full ? "row-full" : "")}
                      dataSource={fuelLogLines.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                      onRow={(record) => ({
                            onClick: (event) => handleViewRecord(record.id),
                        })}
                    />
                </div>

            }
             <Modal
            title="Thông tin đổ nhiên liệu"
            open={!!open}
            okButtonProps={{style:{background:recordViewed ? "crimson" : myColor.buttonColor,}}}
            cancelText="Hủy"
            centered
            maskClosable={false}
            okText={recordViewed ? "Xóa": "Xác nhận"}
            closeIcon = {!confirmLoading}
            onOk={handleAction}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
            >
                <span>Số Km trên đồng hồ</span>
                <InputNumber 
                value={odometerValue}
                size='large'
                disabled={!!recordViewed}
                inputMode = "numeric"
                autoFocus={true}
                formatter={(value) =>
                  value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
                }
                parser={value =>
                  value ? parseInt(value.toString().replace(/\./g, ''), 10) : 0
                }
                onChange={(value:any)=>setOdometerValue(value)}
                min = {0}
                addonAfter="km" style={{marginTop:10, marginBottom:10}}/>

                <span>Tiền đổ</span>
                <InputNumber 
                value={amountValue}
                disabled={!!recordViewed}
                size='large'
                inputMode = "numeric"
                autoFocus={true}
                formatter={(value) =>
                  value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
                }
                parser={value =>
                  value ? parseInt(value.toString().replace(/\./g, ''), 10) : 0
                }
                onChange={(value:any)=>setAmountValue(value)}
                min = {0}
                addonAfter="đồng" style={{marginTop:10, marginBottom:10}}/>

                <span>Số lít đổ</span>
                <InputNumber 
                value={value}
                disabled={!!recordViewed}
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
                addonAfter="lít" style={{marginTop:10, marginBottom:10}}/>

                <span>Có đổ đầy bình ?</span>
                <div style={{margin:'10px 0'}}>
                    <Switch checked={isFull} disabled={!!recordViewed}onChange={(value) => setIsFull(value)} />
                </div>

                {
                    recordViewed && <>
                    <span style={{fontWeight:600}}>Thông tin thêm:</span>
                    <p>Người tạo: <span style={{fontWeight:500}}>{recordViewed.create_uid ? recordViewed.create_uid[1] : 'N/A'}</span></p>
                    <p>Ngày tạo: <span style={{fontWeight:500}}>{moment(recordViewed.created_at).format("DD-MM-YYYY HH:mm")}</span></p>
                    {recordViewed.write_uid && <p>Người sửa cuối: <span style={{fontWeight:500}}>{recordViewed.write_uid ? recordViewed.write_uid[1] : 'N/A'}</span></p>}
                    </>
                }
            </Modal>
    </div>
  )
}

export default OdometerLine