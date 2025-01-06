import empty from '../images/empty-box.png'

const Empty = () => {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <img src={empty} style={{width:'100px',opacity:0.4}} alt=""/>
        <span style={{fontSize:13, marginTop:10,opacity:0.5}}>Không có dữ liệu</span>
    </div>
  )
}

export default Empty