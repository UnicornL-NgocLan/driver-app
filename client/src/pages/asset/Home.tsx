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
import { IoCameraOutline, IoClose } from 'react-icons/io5';
import {
    DndContext, 
    closestCenter,
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
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);

    const [open, setOpen] = useState<ITransportLine | false>(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [date, setDate] = useState(dayjs(new Date()));
    const [time, setTime] = useState(dayjs(new Date()));
    const [defaultIndex,setDefaultIndex] = useState(-1);
    const [driver,setDriver] = useState<number | null>(null);
    const [vehicleList,setVehicleList] = useState<IVehicle[]>([]);
    const [warningReminders,setWarningReminders] = useState([]);

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
            if(auth){
                const {data} = await app.get(`/api/get-vehicle-list?company_id=${auth.company_id[0]}`);
                if(data?.data){
                    setVehicleList(data.data);
                }
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
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
                handleFetchAllDrivers(),
                handleFetchVehicle(),
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

    const handleFetchWarningReminders = async () => {
        try {
            setLoading(true);
            if(auth && auth.partner_id){
                const {data} = await app.get(`/api/get-all-warning-reminders?company_id=${auth.company_id[0]}`);
                if(data?.data && data?.data.length > 0){
                    setWarningReminders(data.data)
                }
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        }
    }

    const showModal = (data:ITransportLine) => {
        setOpen(data);
        setDate(dayjs(new Date()));
        setTime(dayjs(new Date()));
        setCapturedImages([]);
    };

    const handleGetDropBoxAccessToken = async () => {
        try {
            const {data} = await app.get("/api/get-dropbox-access-token");
            return data?.data
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            setFetchData(false);
        }
    }

    function generateFileName(dataUrl:string) {
        const mime = dataUrl.match(/^data:(.*?);base64,/);

        const ext = mime?.[1]?.split("/")[1] || "jpg";

        return `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}.${ext}`;
    }   

    const upLoadBase64ToDropBox = async (dataUrl:string,accessToken:string) =>{
        try {
            const base64Data = dataUrl.split(",")[1];
            const fileName = generateFileName(dataUrl);
            
            const binaryString = window.atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const buffer = bytes.buffer;
            
            const response = await fetch(
                "https://content.dropboxapi.com/2/files/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/octet-stream",
                        "Dropbox-API-Arg": JSON.stringify({
                            path: `/images/${fileName}`,
                            mode: "add",
                            autorename: true
                        })
                    },
                    body: buffer
                }
            );

            const data = await response.json();
            return data;
        } catch (error) {
            const message = getErrorMessage(error);
            alert(error);
            setFetchData(false);
        }
    }

    const handleShareLink = async (file_path:string,accessToken:string) => {
        try {
            const response = await fetch(
                "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        path: file_path,
                        settings: {
                            requested_visibility: "public"
                        }
                    })
                }
            );
            const data = await response.json();
            return data;
        } catch (error) {
            const message = getErrorMessage(error);
            alert(error);
            setFetchData(false);
        }
    }   

    const handleConfirmDeliveryTime = async () => {
        try {
            if(!date || !time){
                alert("Vui lòng chọn thời điểm giao hàng");
                return;
            }
            if(capturedImages.length === 0){
                alert("Vui lòng chụp ít nhất 1 hình ảnh đính kèm!");
                return;
            }

            setConfirmLoading(true);

            const dropBoxAccessToken = await handleGetDropBoxAccessToken();
            if(!dropBoxAccessToken){
                alert("Không lấy được access token của Dropbox ")
            }

            const list_of_images_path = await Promise.all(capturedImages.map(async (image:string) => {
                return await upLoadBase64ToDropBox(image,dropBoxAccessToken);
            }));

            const shared_links = await Promise.all(list_of_images_path.map(async (item:any) => {
                return await handleShareLink(item.path_display,dropBoxAccessToken);
            }));
            
            // Turn shared link to direct image URL
            const directImageURLs = shared_links.map((link:any) => {
                return link.url.replace("dl=0", "raw=1");
            });
    
            const dateTime = dayjs(`${date.format('YYYY-MM-DD')} ${time.format('HH:mm:ss')}`).format('YYYY-MM-DD HH:mm:ss');
            const substractedTime = moment(dateTime).subtract(7,'hours').format('YYYY-MM-DD HH:mm:ss');
            if (open) {
                setLoading(true);
                await app.patch(`/api/update-sea-transport-line`,{
                    id:open.id,
                    date_end:substractedTime,
                    images: directImageURLs
                });
                await handleFetchActiveTransportLines();
            }
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message); 
        } finally {
            setConfirmLoading(false);
            setOpen(false);
            setCapturedImages([]);
        }
    };

    const handleCancel = () => {
        setOpen(false);
        setCapturedImages([]);
    };
    
    const handleCaptureImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setCapturedImages((prev) => [...prev, base64String]);
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setCapturedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };
    
    const handleChangeIndex = async (i:number) => {
        setDefaultIndex(i);
        if(i === 0){
            setLoading(true);
            await handleFetchVehicle();
            setLoading(false);
        } else
        if(i === -1){
            setLoading(true);
            await handleFetchActiveTransportLines();
        } else if(i === 1){ 
            setLoading(true);
            await handleFetchTransport();
        } else if (i === 2){
            setLoading(true);
            await Promise.all([
                handleFetchVehicle(),
                handleFetchWarningReminders(),
            ])
            setLoading(false);
        } else {
            setLoading(true);
            await handleFetchVehicle();
            setLoading(false);
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
        try {
            const {active, over} = event;   
            if (active.id !== over.id) {
                const oldIndex = [...activeTransportLines].map(i => i.id).indexOf(active.id);
                const newIndex = [...activeTransportLines].map(i => i.id).indexOf(over.id);
                const newOrder = arrayMove([...activeTransportLines], oldIndex, newIndex);
                setActiveTransportLines(newOrder);
                await app.patch(`/api/update-sequence-sea-transport-line`,{
                    lines:[...newOrder].map((line:ITransportLine) => ({id:line.id})),
                    transportId: newOrder[0].transport_id,
                });
                await handleFetchActiveTransportLines();
            }

            setIsDragging(false);
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message); 
        }
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
            if(defaultIndex === -1 && driver && !isDragging){
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
             defaultIndex === 0 && vehicleList.length > 0
            ?
            <div style={{padding:'1rem 1rem 55px'}}>
                <List
                    itemLayout="horizontal"
                    dataSource={vehicleList}
                    renderItem={(item) => <VehicleList 
                        isForReminder = {false}
                        isFuelLog = {true}
                        handleChangeIndex = {handleChangeIndex}
                        key={item.id} data={item}/>}
                />
            </div>
            :
            defaultIndex === -1 && activeTransportLines.length > 0
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
                            data={line}
                            isDragging ={isDragging}
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
                    renderItem={(item) => <SeaTransport key={item.id} data={item}/>}
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
                    renderItem={(item) => <VehicleList 
                        isForReminder = {true}
                        handleChangeIndex = {handleChangeIndex}
                        warningReminders = {warningReminders}
                        key={item.id} data={item}/>}
                />
            </div>
            :
            defaultIndex === 3 && vehicleList.length > 0
            ?
            <div style={{padding:'1rem 1rem 55px'}}>
                <List
                    itemLayout="horizontal"
                    dataSource={vehicleList}
                    renderItem={(item) => <VehicleList 
                        isForReminder = {false}
                        handleChangeIndex = {handleChangeIndex}
                        key={item.id} data={item}/>}
                />
            </div>
            :
            <div style={{padding:'1rem 0'}}><Empty/></div>
        }
        {open && <Modal
            title="Xác nhận giao hàng"
            open={!!open}
            okButtonProps={{style:{background:myColor.buttonColor}}}
            cancelText="Hủy"
            cancelButtonProps={{disabled: confirmLoading}}
            closable={!confirmLoading}
            centered
            maskClosable={false}
            okText="Xác nhận"
            closeIcon = {!confirmLoading}
            onOk={handleConfirmDeliveryTime}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
        >
            <ConfigProvider locale={locale}>
                <div style={{display:'none', gap:10,width:'100%'}}>
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
                
                <div style={{ marginTop: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>Hình ảnh đính kèm:</span>
                        <label 
                            htmlFor="camera-input" 
                            style={{
                                display: confirmLoading ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 16px', background: myColor.buttonColor,
                                color: 'white', borderRadius: 4, cursor: 'pointer',
                                fontSize: 14, fontWeight: 500, width: 'fit-content'
                            }}
                        >
                            <IoCameraOutline style={{ fontSize: 20 }} />
                            <span>Chụp hình</span>
                        </label>
                        <input
                            id="camera-input"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleCaptureImage}
                        />
                    </div>
                    
                    {capturedImages.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                            gap: 10,
                            marginTop: 12
                        }}>
                            {capturedImages.map((img, index) => (
                                <div key={index} style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    borderRadius: 6,
                                    border: '1px solid #d9d9d9',
                                    overflow: 'hidden'
                                }}>
                                    <img 
                                        src={img} 
                                        alt={`Captured ${index}`} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div
                                        onClick={() => !confirmLoading && handleRemoveImage(index)}
                                        style={{
                                            position: 'absolute',
                                            top: 4, right: 4,
                                            width: 20, height: 20,
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            display: confirmLoading ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <IoClose style={{ fontSize: 14 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ConfigProvider>
        </Modal>}
        <BottomNavigator id={defaultIndex} handleChangeIndex = {handleChangeIndex}/>
    </div>
  )
}

export default Home


const SortableItem = ({isDragging, data, showTimePicker, handleCancelOrder }: {data:ITransportLine,showTimePicker:(i:ITransportLine)=>void,handleCancelOrder:(i:ITransportLine)=>void,isDragging:boolean}) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: data.id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      width: '100%',
    };
  
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <TransportLine 
            isDragging = {isDragging}
            key={data.id} 
            data={data} 
            showTimePicker={showTimePicker} 
            handleCancelOrder={handleCancelOrder} />
      </div>
    );
  };