import { useEffect, useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import Skeleton from 'react-loading-skeleton'
import { myColor } from 'color'
import { getErrorMessage } from 'helpers/getErrorMessage'
import axios from 'axios'
import { Button, Table, Tag } from 'antd'
import { IVehicle } from 'interface'
import { FaCheck } from "react-icons/fa";

const taskData = [
  {
    key: '1',
    name: 'Oil Change - Truck 1',
    currentOdometer: 3000000,
    dueOdometer: 5000000,
    state: 'due',
  },
  {
    key: '2',
    name: 'Tire Rotation - Truck 2',
    currentOdometer: 3000000,
    dueOdometer: 3200000,
    state: 'due_soon',
  },
  {
    key: '3',
    name: 'Brake Inspection - Truck 3',
    currentOdometer: 3000000,
    dueOdometer: 900000,
    state: 'overdue',
  },
  {
    key: '4',
    name: 'Brake Inspection - Truck 4',
    currentOdometer: 3000000,
    dueOdometer: 900000,
    state: 'cancel',
  },
  {
    key: '5',
    name: 'Brake Inspection - Truck 5',
    currentOdometer: 3000000,
    dueOdometer: 900000,
    state: 'active',
  },
];

const columns = [
  {
    title: 'Tên công việc',
    dataIndex: 'name',
    key: 'name',
    width:200,
    render: (name:string) => {
      return <span style={{fontSize:14}}>{name}</span>;
    },
  },
  {
    title: 'Số Km đến hạn',
    dataIndex: 'dueOdometer',
    key: 'dueOdometer',
    align: 'center' as any,
    render: (dueOdometer:number) => {
      return <span style={{fontSize:14}}>{Intl.NumberFormat('vi-VN').format(dueOdometer)}</span>;
    },
  },
  {
    title: 'Trạng thái',
    dataIndex: 'state',
    key: 'state',
    align: 'center' as any,
    render: (state:string) => {
      let color = 'green';
      if (state === 'overdue') color = 'red';
      else if (state === 'due_soon') color = 'orange';  
      else if (state === 'due') color = 'blue';
      else if (state === 'cancel') color = 'gray';
      return <Tag color={color}>{state === 'overdue' ? 'Quá hạn' : state === 'due' ? 'Đến hạn' : state === 'due_soon' ? 'Sắp đến hạn' : state === 'cancel' ? 'Bị hủy' : 'Bình thường'}</Tag>;
    },
  },
];

const filterOptions = ['all', 'due_soon', 'due', 'overdue', 'cancel', 'active'];

const ReminderList = ({vehicle,handleClose}:{vehicle:IVehicle,handleClose:()=>void}) => {
    const [fetchData,setFetchData] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");

    const onSelectChange = (newSelectedRowKeys:any, selectedRows:any) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(selectedRows);
    };

    const fetchReminderLines = async () => {
      try {
        setFetchData(true);
        // const {data} = await axios.get(`https://api.example.com/reminder-lines?vehicle_id=${vehicle.id}`);
        // if(data.data){
        //   setReminderLines(data.data);
        // }

      } catch (error) {
        const message = getErrorMessage(error);
        alert(message);
      } finally {
        setFetchData(false);
      }
    }


    const handleAction = () => {
      console.log("Selected Tasks:", selectedRows);
      // Example action - replace this with your actual action
      alert(`You selected ${selectedRows.length} task(s).`);
    };

    // Count items by state
    const getCount = (state:string) => {
      if (state === "all") return taskData.length;
      return taskData.filter((task) => task.state === state).length;
    };

    const filteredTasks =
    activeFilter === "all"
      ? taskData
      : taskData.filter((task) => task.state === activeFilter);

    useEffect(() => {
      fetchReminderLines();
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
                {selectedRows.length > 0 && <FaCheck style={{fontSize:20,color:'white'}} onClick={handleAction}/>}
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
                    <div
                      style={{
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        paddingBottom: 8,
                        marginBottom: 8,
                        display:'flex',
                        gap:8,
                        scrollbarWidth: 'none',       // Firefox
                        msOverflowStyle: 'none',   
                      }}
                    >
                      {filterOptions.map((option) => (
                        <Button
                          key={option}
                          style={{borderRadius:10,display:'flex',alignItems:'center',gap:5,backgroundColor:activeFilter === option ? myColor.buttonColor : 'white',color:activeFilter === option ? 'white' : myColor.buttonColor}}
                          type={activeFilter === option ? "primary" : "default"}
                          onClick={() => setActiveFilter(option)}
                        >
                          {
                            option === 'all' ? 'Tất cả' 
                            : option === 'due_soon' ? 'Sắp đến hạn' 
                            : option === 'due' ? 'Đến hạn' 
                            : option === 'overdue' ? 'Quá hạn' 
                            : option === 'cancel' ? 'Bị hủy' 
                            : 'Bình thường'
                          } ({getCount(option)})
                        </Button>
                      ))}
                    </div>

                    <Table
                      rowSelection={{selectedRowKeys,onChange: onSelectChange}}
                      columns={columns}
                      dataSource={filteredTasks}
                      className="reminder-table"
                      pagination={false}
                    />
                </div>

            }
    </div>
  )
}

export default ReminderList