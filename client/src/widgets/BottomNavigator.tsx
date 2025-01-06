import React from 'react'
import { PiPackageFill } from "react-icons/pi";
import { GoHistory } from "react-icons/go";
import { myColor } from 'color';

const BottomNavigator = ({id,handleChangeIndex}:{id:number,handleChangeIndex:(i:number)=>void}) => {
    const checkForActive = (currentId:number) => id === currentId ? true : false;
  return (
    <div style={{
        boxShadow:'0px -1px 5px rgba(0,0,0,0.1)',
        position:'fixed',bottom:0,left:0,right:0,background:'white',padding:'0.6rem 0.5rem',display:'flex',justifyContent:'space-around',alignItems:'center'}}>
        <div 
        onClick={() => handleChangeIndex(0)}
        style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,color:`${checkForActive(0) ? myColor.buttonColor : myColor.secondaryColor}`}}>
            <PiPackageFill />
            <span style={{fontSize:13,fontWeight:`${checkForActive(0) ? 600 : 400}`}}>Đơn hàng</span>
        </div>
        <div 
        onClick={() => handleChangeIndex(1)}
        style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1, color:`${checkForActive(1) ? myColor.buttonColor : myColor.secondaryColor}`}}>
            <GoHistory />
            <span style={{fontSize:13,fontWeight:`${checkForActive(1) ? 600 : 400}`}}>Lịch sử</span>
        </div>
    </div>
  )
}

export default BottomNavigator