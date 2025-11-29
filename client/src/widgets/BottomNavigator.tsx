import React from 'react'
import { PiPackageFill } from "react-icons/pi";
import { GoHistory } from "react-icons/go";
import { myColor } from 'color';
import { BiSolidBellRing } from "react-icons/bi";
import { AiFillDashboard } from "react-icons/ai";
import { BsFillFuelPumpFill } from "react-icons/bs";

const BottomNavigator = ({id,handleChangeIndex}:{id:number,handleChangeIndex:(i:number)=>void}) => {
    const checkForActive = (currentId:number) => id === currentId ? true : false;
  return (
    <div style={{
        boxShadow:'0px -1px 5px rgba(0,0,0,0.1)',
        position:'fixed',bottom:0,left:0,right:0,background:'white',padding:'0.6rem 0.5rem',display:'flex',justifyContent:'space-around',alignItems:'center'}}>
        <div 
        onClick={() => handleChangeIndex(0)}
        style={{display:'flex',gap:1,flexDirection:'column',alignItems:'center',flex:1, color:`${checkForActive(0) ? myColor.buttonColor : myColor.secondaryColor}`}}>
            <BsFillFuelPumpFill style={{fontSize:20}}/>
            <span style={{fontSize:14,fontWeight:`${checkForActive(0) ? 700 : 500}`}}>Nhiên liệu</span>
        </div>
        {/* <div 
        onClick={() => handleChangeIndex(-1)}
        style={{display:'flex',gap:1,flexDirection:'column',alignItems:'center',flex:1,color:`${checkForActive(-1) ? myColor.buttonColor : myColor.secondaryColor}`}}>
            <PiPackageFill style={{fontSize:20}}/>
            <span style={{fontSize:14,fontWeight:`${checkForActive(-1) ? 700 : 500}`}}>Đơn hàng</span>
        </div>
        <div 
        onClick={() => handleChangeIndex(1)}
        style={{display:'flex',gap:1,flexDirection:'column',alignItems:'center',flex:1, color:`${checkForActive(1) ? myColor.buttonColor : myColor.secondaryColor}`}}>
            <GoHistory style={{fontSize:20}}/>
            <span style={{fontSize:14,fontWeight:`${checkForActive(1) ? 700 : 500}`}}>Lịch sử</span>
        </div> */}
        <div 
        onClick={() => handleChangeIndex(2)}
        style={{display:'flex',gap:1,flexDirection:'column',alignItems:'center',flex:1, color:`${checkForActive(2) ? myColor.buttonColor : myColor.secondaryColor}`}}>
            <BiSolidBellRing style={{fontSize:20}}/>
            <span style={{fontSize:14,fontWeight:`${checkForActive(2) ? 700 : 500}`}}>Lời nhắc</span>
        </div>
        <div 
        onClick={() => handleChangeIndex(3)}
        style={{display:'flex',gap:1,flexDirection:'column',alignItems:'center',flex:1, color:`${checkForActive(3) ? myColor.buttonColor : myColor.secondaryColor}`}}>
            <AiFillDashboard style={{fontSize:20}}/>
            <span style={{fontSize:14,fontWeight:`${checkForActive(3) ? 700 : 500}`}}>Đồng hồ</span>
        </div>
    </div>
  )
}

export default BottomNavigator