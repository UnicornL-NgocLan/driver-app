import { myColor } from 'color'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getErrorMessage } from 'helpers/getErrorMessage'
import { getCompanies } from '../../redux/reducers/companyReducer'
import PageLoading from 'widgets/PageLoading.tsx'
import { addAuth, addDriver } from '../../redux/reducers/authReducer'
import app from 'axiosConfig'
import Header from '../../widgets/Header'

import red from '../../images/round.png'
import blue from '../../images/record.png'
import yellow from '../../images/circle.png'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import Empty from 'widgets/Empty'
import { ConfigProvider, DatePicker, List, Modal, TimePicker } from 'antd'
import TransportLine from './components/TransportLine'
import { ITransport, ITransportLine, IVehicle } from 'interface'
import locale from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    TouchSensor,
    MouseSensor,
  } from '@dnd-kit/core';
  import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
  } from '@dnd-kit/sortable';
  import { CSS } from "@dnd-kit/utilities";
  import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import BottomNavigator from '../../widgets/BottomNavigator'
import SeaTransport from './components/SeaTransport'
import { getDrivers } from '../../redux/reducers/driverReducer'
import moment from 'moment'
import VehicleList from './components/VehicleList'


const Home = () => {
    const dispatch = useDispatch();
    const [fetchData,setFetchData] = useState(true);
    const [loading,setLoading] = useState(false);
    const [activeTransportLines, setActiveTransportLines] = useState<ITransportLine[]>([]);
    const [historyTransport,setHistoryTransport] = useState<ITransport[]>([]);
    const companies = useSelector((state) => (state as any).companies);
    const auth = useSelector((state) => (state as any).auth);
    const [items, setItems] = useState<any>([]);
    const [isDragging, setIsDragging] = useState(false);

    const [open, setOpen] = useState<ITransportLine | false>(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [date, setDate] = useState(dayjs(new Date()));
    const [time, setTime] = useState(dayjs(new Date()));
    const [defaultIndex,setDefaultIndex] = useState(0);
    const [driver,setDriver] = useState<number | null>(null);
    const [vehicleList,setVehicleList] = useState<IVehicle[]>([]);

    dayjs.locale('vi');

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require the mouse to move by 10 pixels before activating
            activationConstraint: {
              distance: 10,
            },
          }),
          useSensor(TouchSensor, {
            // Press delay of 250ms, with tolerance of 5px of movement
            activationConstraint: {
              delay: 250,
              tolerance: 5,
            },
          }),
      );

    const fetchCompanies = async () => {
        try {
            const {data} = await app.get("/api/get-companies");
            if(data?.data){
                dispatch(getCompanies(data?.data))
            }
        } catch (error:any) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        }
    }

    const handleChangeCompany = async (id:number) => {
        try {
            setFetchData(true);
            setActiveTransportLines([])
            await app.patch("/api/change-company",{companyId:id})
            await fetchAllNecessaryData();
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        }
    }

    const handleFetchUserData = async () => {
        try {
            const {data} = await app.get("/api/get-user");
            dispatch(addAuth(data?.data))
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        }
    }

    const handleFetchActiveTransportLines = async (driver_id?:number) => {
        try {
            if(auth && auth.partner_id){
                const {data} = await app.get(`/api/get-active-transport?id=${auth.driver || driver_id}&company_id=${auth.company_id[0]}`);
                if(data?.data && data?.data.length > 0){
                    const transportLines = (data?.data as {[key:string]:any} []).map(line => line.id).map(async (id:number) => {
                        return app.get(`/api/get-transport-line?id=${id}`)
                    })
                    const results = await Promise.all([...transportLines]);
                    setActiveTransportLines(results[0]?.data?.data);
                }else {
                    setActiveTransportLines([]);
                }
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        } finally {
            setLoading(false);
        }
    }

    const handleFetchAllDrivers = async () => {
        try {
            const {data} = await app.get(`/api/get-all-sea-driver?company_id=${auth.company_id[0]}`);
            if(data?.data){
                dispatch(getDrivers(data?.data))
            }
        } catch (error:any) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        }
    }

    const handleFetchTransport = async () => {
        try {
            setHistoryTransport([]);
            if(auth && auth.driver){
                const {data} = await app.get(`/api/get-active-transport?history=${true}&id=${auth.driver}&company_id=${auth.company_id[0]}`);
                setHistoryTransport(data.data.sort((a:ITransport,b:ITransport) => dayjs(b.date_start_actual).unix() - dayjs(a.date_start_actual).unix()));
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        } finally {
            setLoading(false);
        }
    }

    const handleFetchVehicle = async () => {
        try {
            setVehicleList([]);
            if(auth && auth.driver){
                const {data} = await app.get(`/api/get-vehicle-list?company_id=${auth.company_id[0]}`);
                if(data?.data){
                    setVehicleList(data.data);
                }
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        } finally {
            setLoading(false);
        }
    }

    const handleGetSeaDriver = async () => {
        try {
            if(auth && auth.partner_id){
                const {data} = await app.get(`/api/get-sea-driver?id=${auth.partner_id[0]}&company_id=${auth.company_id[0]}`);
                if(data?.data && data?.data.length > 0){
                    dispatch(addDriver(data?.data[0].id))
                    return data?.data[0].id
                }
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        }
    }
    
    const fetchAllNecessaryData = async () => {
        try {
            setFetchData(true);
            await Promise.all([
                fetchCompanies(),
                handleFetchUserData(),
                handleFetchAllDrivers()
            ])
            const driver_id = await handleGetSeaDriver();
            setDriver(driver_id);
            await handleFetchActiveTransportLines(driver_id);
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
        } finally {
            setFetchData(false);
        }
    }

    const showModal = (data:ITransportLine) => {
        setOpen(data);
        setDate(dayjs(new Date()));
        setTime(dayjs(new Date()));
    };

    const handleConfirmDeliveryTime = async () => {
        try {
            if(!date || !time){
                alert("Vui lòng chọn thời điểm giao hàng");
                return;
            }
    
            const dateTime = dayjs(`${date.format('YYYY-MM-DD')} ${time.format('HH:mm:ss')}`).format('YYYY-MM-DD HH:mm:ss');
            const substractedTime = moment(dateTime).subtract(7,'hours').format('YYYY-MM-DD HH:mm:ss');
            setConfirmLoading(true);
            if (open) {
                await app.patch(`/api/update-sea-transport-line`,{id:open.id,date_end:substractedTime});
                setLoading(true);
                await handleFetchActiveTransportLines();
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message); 
        } finally {
            setConfirmLoading(false);
            setOpen(false);
        }
    };

    const handleCancel = () => {
        setOpen(false);
    };
    
    const handleChangeIndex = async (i:number) => {
        setDefaultIndex(i);
        if(i === 0){
            setLoading(true);
            await handleFetchActiveTransportLines();
        } else if(i === 1){ 
            setLoading(true);
            await handleFetchTransport();
        } else {
            setLoading(true);
            await handleFetchVehicle();
        }
    }

    const handleCancelOrder = async (data:ITransportLine) => {
        try {
            if(window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")){
                setLoading(true);
                await app.patch(`/api/cancel-sea-transport-line`,{id:data.id});
                await handleFetchActiveTransportLines();
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message); 
        } finally {
            setLoading(false);
        }
    }

    const handleDragEnd = async (event:any) => {
        const {active, over} = event;   
        if (active.id !== over.id) {
            const oldIndex = [...activeTransportLines].map(i => i.id).indexOf(active.id);
            const newIndex = [...activeTransportLines].map(i => i.id).indexOf(over.id);
            const newOrder = arrayMove([...activeTransportLines], oldIndex, newIndex);
            setActiveTransportLines(newOrder);
        }
        setIsDragging(false);
        await handleFetchActiveTransportLines();
    }

    useEffect(()=>{
        if(companies.length > 0){
            const timemout = setTimeout(() => {
                setFetchData(false);
            },300)

            return () => clearTimeout(timemout)
        };
        fetchAllNecessaryData();
    },[]);

    useEffect(()=>{
        let interval = setInterval(() => {
            if(defaultIndex === 0 && driver && !isDragging){
                handleFetchActiveTransportLines(driver);
            }
        },1000 * 60)

        return () => clearInterval(interval)
    },[defaultIndex,driver])
     
    if(fetchData){
        return <PageLoading/>
    }

  return (
    <div style = {{backgroundColor:myColor.backgroundColor, height:'100vh',overflow:'auto',width:'100vw'}}>
        <Header handleChangeCompany={handleChangeCompany}/>
        {
            loading
            ?
            <div style={{padding:'1rem'}}>
                <Skeleton count={3} height={150} borderRadius ={5} style={{marginBottom:6}}/>
            </div>
            :
            defaultIndex === 0 && activeTransportLines.length > 0
            ?
            <div style={{padding:'1rem 1rem 55px'}}>
                <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={() => setIsDragging(true)}
                modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                    items={activeTransportLines.map((item:ITransportLine) => item.id)}
                    strategy={verticalListSortingStrategy}
                    >
                    {activeTransportLines.map((line:ITransportLine) => {
                        return (
                        <SortableItem
                            key={line.id}
                            id={line.id}
                            data={line}
                            showTimePicker={showModal}
                            handleCancelOrder={handleCancelOrder}
                        />
                        );
                    })}
                    </SortableContext>
                </DndContext>
            </div>
            :
            defaultIndex === 1 && historyTransport.length > 0 
            ?
            <div style={{padding:'1rem 1rem 55px'}}>
                <List
                    itemLayout="horizontal"
                    dataSource={historyTransport}
                    renderItem={(item, index) => <SeaTransport key={item.id} data={item}/>}
                />
            </div>
            :
            defaultIndex === 2 && vehicleList.length > 0
            ?
            <div style={{padding:'1rem 1rem 55px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:10,paddingTop:0,paddingBottom:15}}>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <img src={yellow} alt="" style={{height:12,width:12}}/>
                        <span style={{fontSize:14}}>Sắp đến hạn</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <img src={blue} alt="" style={{height:12,width:12}}/>
                        <span style={{fontSize:14}}>Đến hạn</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <img src={red} alt="" style={{height:12,width:12}}/>
                        <span style={{fontSize:14}}>Quá hạn</span>
                    </div>
                </div>
                <List
                    itemLayout="horizontal"
                    dataSource={vehicleList}
                    renderItem={(item, index) => <VehicleList key={item.id} data={item}/>}
                />
            </div>
            :
            <div style={{padding:'1rem 0'}}><Empty/></div>
        }
        {open && <Modal
            title="Xác nhận thời điểm giao hàng"
            open={!!open}
            okButtonProps={{style:{background:myColor.buttonColor}}}
            cancelText="Hủy"
            centered
            maskClosable={false}
            okText="Xác nhận"
            closeIcon = {!confirmLoading}
            onOk={handleConfirmDeliveryTime}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
        >
            <ConfigProvider locale={locale}>
                <div style={{display:'flex', gap:10,width:'100%'}}>
                    <DatePicker
                    style={{width:'100%',margin:'1rem 0',flex:1}}	
                    format="DD-MM-YYYY"
                    value={date}
                    disabled
                    allowClear={false}
                    defaultPickerValue={dayjs(new Date())}
                    onChange={(value) => {
                        setDate(dayjs(value, 'DD-MM-YYYY'))
                    }}
                    />
                    <TimePicker 
                    style={{width:'100%',margin:'1rem 0',flex:1}}
                    value={time}
                    disabled
                    allowClear={false}
                    defaultPickerValue={dayjs(new Date())}
                    onChange={(value) => {
                        setTime(dayjs(value, 'hh:mm:ss'))
                    }}
                    />
                </div>
            </ConfigProvider>
        </Modal>}
        <BottomNavigator id={defaultIndex} handleChangeIndex = {handleChangeIndex}/>
    </div>
  )
}

export default Home


const SortableItem = ({ id, data, showTimePicker, handleCancelOrder }: any) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      width: '100%',
    };
  
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <TransportLine key={data.id} data={data} showTimePicker={showTimePicker} handleCancelOrder={handleCancelOrder} />
      </div>
    );
  };