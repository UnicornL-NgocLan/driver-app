import { List, Modal, Spin } from 'antd'
import { ITransport, ITransportLine } from 'interface'
import { myColor } from 'color'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getErrorMessage } from 'helpers/getErrorMessage'
import app from 'axiosConfig'
import Skeleton from 'react-loading-skeleton'
import { IoArrowBack } from "react-icons/io5";
import { IoMdImages } from "react-icons/io";
import { IoChevronBack, IoChevronForward, IoClose, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import Empty from 'widgets/Empty'
import accept from '../../../images/accept.png'
import cancel from '../../../images/cancel.png'
import delivery from '../../../images/fast-delivery.png'
import moment from 'moment'

interface ITransportLineImage {
    id: number;
    name: string;
    image_url: string;
    transport_line_id: any;
    [key: string]: any;
}

const TransportLineDetail = ({transport,handleClose}:{transport:ITransport,handleClose:()=>void}) => {
    const [fetchData,setFetchData] = useState<boolean>(false);
    const [transportLineDetail,setTransportLineDetail] = useState<ITransportLine[]>([]);

    const handleGetTransportLineDetail = async () => {
        try {
            setFetchData(true);
            const {data} = await app.get(`/api/get-transport-line/?id=${transport.id}&getAll=true`);
            setTransportLineDetail(data.data);
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
        } finally {
            setFetchData(false);
        }
    }

    useEffect(() => {
        handleGetTransportLineDetail()
    },[])

  return (
    <div style={{height:'100vh',overflow:'auto',position:'fixed',width:'100vw',backgroundColor:myColor.backgroundColor,top:0,left:0,zIndex:100}}>
        <div style={{
        position:'sticky',top:0, fontWeight:600, zIndex:1,backgroundColor:myColor.buttonColor,width:'100%', boxShadow:'2px 2px 2px rgba(0,0,0,0.2)'}}>
          <div style = {{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.9rem 1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:10, padding:0}}>
              <IoArrowBack style={{fontSize:18,color:'white'}} onClick={handleClose}/>
              <span style={{fontSize:15, color:'white'}}>{transport.name}</span>
            </div>
          </div>
      </div>
        {
            fetchData
            ?
            <div style={{padding:'1rem'}}>
                <Skeleton count={4} height={150} borderRadius ={3} style={{marginBottom:6}}/>
            </div>
            :
            transportLineDetail.length === 0 
            ?
            <Empty/>
            :
            <div style={{padding:'1rem'}}>
                <List
                    itemLayout="horizontal"
                    dataSource={transportLineDetail}
                    renderItem={(item, index) => <TransportLineItem key={index} data={item}/>}
                />
            </div>

        }
    </div>
  )
}

export default TransportLineDetail



const TransportLineItem = ({data}:{data:ITransportLine}) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [images, setImages] = useState<ITransportLineImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // State cho chức năng thêm ảnh bổ sung
    const [isAddingImages, setIsAddingImages] = useState(false);
    const [newImages, setNewImages] = useState<string[]>([]); // base64 images
    const [savingImages, setSavingImages] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Kiểm tra xem thời điểm hiện tại có còn trong vòng 12 tiếng
     * kể từ date_end_actual hay không.
     * date_end_actual từ Odoo được lưu ở UTC, nên cần cộng 7 giờ
     * để chuyển về giờ Việt Nam trước khi so sánh.
     */
    const isWithin12Hours = (): boolean => {
        if (!data.date_end_actual) return false;
        // So sánh thẳng trên UTC để tránh lỗi timezone mode mismatch của moment.js
        // moment.utc().add(7,'hours') vẫn giữ UTC mode → diff với moment() local bị sai 7 tiếng
        const endActualUTC = moment.utc(data.date_end_actual);
        const nowUTC = moment.utc();
        const diffHours = nowUTC.diff(endActualUTC, 'hours', true);
        return diffHours >= 0 && diffHours <= 12;
    };

    const getColor = (state:string) => {
        switch(state){
          case 'start':
            return 'black';
          case 'done':
            return 'green';
          case 'cancel':
            return 'crimson';
          default:
            return 'black';
        }
      }
    
      const getImage = (state:string) => {
        switch(state){
          case 'start':
            return delivery;
          case 'done':
            return accept;
          case 'cancel':
            return cancel;
          default:
            return delivery;
        }
      }

    const handleOpenImages = async () => {
        setShowImageModal(true);
        setLoadingImages(true);
        setIsAddingImages(false);
        setNewImages([]);
        try {
            const {data: res} = await app.get(`/api/get-transport-line-images?transport_line_id=${data.id}`);
            setImages(res.data || []);
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
        } finally {
            setLoadingImages(false);
        }
    }

    const handleRefetchImages = async () => {
        setLoadingImages(true);
        try {
            const {data: res} = await app.get(`/api/get-transport-line-images?transport_line_id=${data.id}`);
            setImages(res.data || []);
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
        } finally {
            setLoadingImages(false);
        }
    }

    const handlePrev = useCallback(() => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
        }
    }, [lightboxIndex]);

    const handleNext = useCallback(() => {
        if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
            setLightboxIndex(lightboxIndex + 1);
        }
    }, [lightboxIndex, images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape') setLightboxIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, handlePrev, handleNext]);

    const getImageSrc = (img: ITransportLineImage) => {
        return img.image_url || '';
    }

    // --- Xử lý thêm ảnh bổ sung ---
    const handleCaptureNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setNewImages((prev) => [...prev, base64String]);
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = '';
    };

    const handleRemoveNewImage = (indexToRemove: number) => {
        setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleGetDropBoxAccessToken = async () => {
        try {
            const {data} = await app.get("/api/get-dropbox-access-token");
            return data?.data;
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
            return null;
        }
    }

    function generateFileName(dataUrl: string) {
        const mime = dataUrl.match(/^data:(.*?);base64,/);
        const ext = mime?.[1]?.split("/")[1] || "jpg";
        return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
    }

    const upLoadBase64ToDropBox = async (dataUrl: string, accessToken: string) => {
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
            const resData = await response.json();
            return resData;
        } catch (error) {
            alert(error);
            return null;
        }
    }

    const handleShareLink = async (file_path: string, accessToken: string) => {
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
            const resData = await response.json();
            return resData;
        } catch (error) {
            alert(error);
            return null;
        }
    }

    const handleSaveNewImages = async () => {
        if (newImages.length === 0) {
            alert("Vui lòng chọn ít nhất 1 hình ảnh!");
            return;
        }

        try {
            setSavingImages(true);

            // 1. Lấy Dropbox access token
            const dropBoxAccessToken = await handleGetDropBoxAccessToken();
            if (!dropBoxAccessToken) {
                alert("Không lấy được access token của Dropbox");
                return;
            }

            // 2. Upload tất cả ảnh lên Dropbox
            const list_of_images_path = await Promise.all(
                newImages.map(async (image: string) => {
                    return await upLoadBase64ToDropBox(image, dropBoxAccessToken);
                })
            );

            // 3. Tạo shared link cho mỗi ảnh
            const shared_links = await Promise.all(
                list_of_images_path
                    .filter((item: any) => item && item.path_display)
                    .map(async (item: any) => {
                        return await handleShareLink(item.path_display, dropBoxAccessToken);
                    })
            );

            // 4. Chuyển shared link thành direct image URL
            const directImageURLs = shared_links
                .filter((link: any) => link && link.url)
                .map((link: any) => {
                    return link.url.replace("dl=0", "raw=1");
                });

            if (directImageURLs.length === 0) {
                alert("Không thể upload hình ảnh lên Dropbox!");
                return;
            }

            // 5. Gửi các ảnh đến server để tạo record
            await app.post(`/api/add-transport-line-images`, {
                transport_line_id: data.id,
                images: directImageURLs,
            });

            alert("Thêm ảnh bổ sung thành công!");
            setNewImages([]);
            setIsAddingImages(false);

            // 6. Refetch lại danh sách ảnh
            await handleRefetchImages();
        } catch (error) {
            const message = getErrorMessage(error);
            alert(message);
        } finally {
            setSavingImages(false);
        }
    };

    return (
        <List.Item 
        style={{display:'block',background:'white',marginBottom:20,borderRadius:5, boxShadow:'2px 2px 1px rgba(0,0,0,0.2)',padding:10
        }}>
            <List.Item.Meta
            title={<span style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:0, fontSize:14,fontWeight:700,color:getColor(data.state)}}><span>{data.name}</span><img alt="" src={getImage(data.state)} style={{height:17}}/></span>}
            />
            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
                {data.picking_id && <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Phiếu kho: </span><span>{data.picking_id[1]}</span>
                </span>}
                {data.origin && <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Chứng từ gốc: </span><span>{data.origin}</span>
                </span>}
                {data.customer_ref && <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Khách hàng: </span><span>{data.customer_ref}</span>
                </span>}
                {data.item_type && <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Hàng hóa: </span><span>{data.item_type}</span>
                </span>}
                <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Đối tác: </span><span>{data.partner_id[1]}</span>
                </span>
                <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Từ: </span><span>{data.address_start}</span>
                </span>
                <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Đến: </span><span>{data.address_end}</span>
                </span>
                {data.note && <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Ghi chú: </span><span>{data.note}</span>
                </span>}
                {data.date_end_actual && <span style={{fontSize:14}}>
                    <span style={{fontWeight:500}}>Giao lúc: </span><span>{moment(data.date_end_actual).add(7,'hours').format('DD-MM-YYYY HH:mm:ss')}</span>
                </span>}

                {/* Nút xem ảnh */}
                <div 
                    onClick={handleOpenImages}
                    style={{
                        display:'flex',alignItems:'center',gap:6,marginTop:4,
                        cursor:'pointer',color:myColor.buttonColor,fontSize:14,fontWeight:500,
                        padding:'6px 12px',borderRadius:4,border:`1px solid ${myColor.buttonColor}`,
                        width:'fit-content',transition:'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = myColor.buttonColor;
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = myColor.buttonColor;
                    }}
                >
                    <IoMdImages style={{fontSize:16}}/>
                    <span>Xem ảnh</span>
                </div>
            </div>

            {/* Modal hiển thị ảnh dạng kanban */}
            <Modal
                title={<span style={{fontSize:16,fontWeight:600}}>Hình ảnh - {data.name}</span>}
                open={showImageModal}
                onCancel={() => { setShowImageModal(false); setImages([]); setIsAddingImages(false); setNewImages([]); }}
                footer={null}
                width="95vw"
                style={{top:20}}
                styles={{body:{maxHeight:'80vh',overflowY:'auto',padding:'16px 0'}}}
            >
                {loadingImages ? (
                    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:200}}>
                        <Spin size="large"/>
                    </div>
                ) : (
                    <>
                        {images.length === 0 && !isAddingImages ? (
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:200,color:'#999'}}>
                                <IoMdImages style={{fontSize:48,marginBottom:12,opacity:0.4}}/>
                                <span style={{fontSize:15}}>Không có hình ảnh nào</span>
                            </div>
                        ) : (
                            <div style={{
                                display:'grid',
                                gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))',
                                gap:12,
                                padding:'0 16px',
                            }}>
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        onClick={() => setLightboxIndex(index)}
                                        style={{
                                            borderRadius:8,overflow:'hidden',cursor:'pointer',
                                            border:'1px solid #e8e8e8',
                                            transition:'all 0.2s ease',
                                            boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
                                            aspectRatio:'1',
                                            position:'relative',
                                            backgroundColor:'#f5f5f5',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <img
                                            src={getImageSrc(img)}
                                            alt={img.name || `Ảnh ${index + 1}`}
                                            style={{
                                                width:'100%',height:'100%',
                                                objectFit:'cover',display:'block',
                                            }}
                                        />
                                        {img.name && (
                                            <div style={{
                                                position:'absolute',bottom:0,left:0,right:0,
                                                background:'linear-gradient(transparent, rgba(0,0,0,0.6))',
                                                color:'white',padding:'16px 8px 6px',
                                                fontSize:11,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                                            }}>
                                                {img.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Khu vực thêm ảnh bổ sung */}
                        {isAddingImages && (
                            <div style={{padding:'16px', borderTop: images.length > 0 ? '1px solid #e8e8e8' : 'none', marginTop: images.length > 0 ? 16 : 0}}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                                    <span style={{fontSize:15,fontWeight:600,color:'#333'}}>Ảnh bổ sung</span>
                                    <div style={{display:'flex',gap:8}}>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                display:'flex',alignItems:'center',gap:4,
                                                cursor:'pointer',color:myColor.buttonColor,fontSize:13,fontWeight:500,
                                                padding:'4px 10px',borderRadius:4,border:`1px solid ${myColor.buttonColor}`,
                                                transition:'all 0.2s ease',
                                            }}
                                        >
                                            <IoAddCircleOutline style={{fontSize:16}}/>
                                            <span>Chọn ảnh</span>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{display:'none'}}
                                    onChange={handleCaptureNewImage}
                                />

                                {newImages.length > 0 && (
                                    <div style={{
                                        display:'grid',
                                        gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))',
                                        gap:10,
                                        marginBottom:12,
                                    }}>
                                        {newImages.map((img, index) => (
                                            <div key={index} style={{
                                                position:'relative',borderRadius:8,overflow:'hidden',
                                                border:'2px dashed #4CAF50',
                                                aspectRatio:'1',backgroundColor:'#f5f5f5',
                                            }}>
                                                <img
                                                    src={img}
                                                    alt={`Ảnh mới ${index + 1}`}
                                                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                                                />
                                                {/* Nút xóa ảnh mới */}
                                                <div
                                                    onClick={() => handleRemoveNewImage(index)}
                                                    style={{
                                                        position:'absolute',top:4,right:4,
                                                        width:28,height:28,borderRadius:'50%',
                                                        backgroundColor:'rgba(220,53,69,0.9)',
                                                        display:'flex',alignItems:'center',justifyContent:'center',
                                                        cursor:'pointer',transition:'background-color 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220,53,69,1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(220,53,69,0.9)'}
                                                >
                                                    <IoTrashOutline style={{fontSize:14,color:'white'}}/>
                                                </div>
                                                {/* Badge "Mới" */}
                                                <div style={{
                                                    position:'absolute',top:4,left:4,
                                                    backgroundColor:'#4CAF50',color:'white',
                                                    fontSize:10,fontWeight:600,
                                                    padding:'2px 6px',borderRadius:4,
                                                }}>
                                                    Mới
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {newImages.length === 0 && (
                                    <div style={{
                                        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                                        minHeight:100,color:'#999',border:'1px dashed #d9d9d9',borderRadius:8,
                                        cursor:'pointer',
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    >
                                        <IoAddCircleOutline style={{fontSize:32,marginBottom:6,opacity:0.5}}/>
                                        <span style={{fontSize:13}}>Bấm để chọn ảnh</span>
                                    </div>
                                )}

                                <div style={{display:'flex',gap:8,marginTop:12}}>
                                    <div
                                        onClick={savingImages ? undefined : handleSaveNewImages}
                                        style={{
                                            flex:1,textAlign:'center',
                                            padding:'8px 0',borderRadius:6,
                                            backgroundColor: savingImages ? '#ccc' : myColor.buttonColor,
                                            color:'white',fontWeight:600,fontSize:14,
                                            cursor: savingImages ? 'not-allowed' : 'pointer',
                                            transition:'opacity 0.2s',
                                        }}
                                    >
                                        {savingImages ? 'Đang lưu...' : 'Lưu ảnh bổ sung'}
                                    </div>
                                    <div
                                        onClick={savingImages ? undefined : () => { setIsAddingImages(false); setNewImages([]); }}
                                        style={{
                                            padding:'8px 16px',borderRadius:6,
                                            backgroundColor:'#f5f5f5',color:'#666',fontWeight:500,fontSize:14,
                                            cursor: savingImages ? 'not-allowed' : 'pointer',
                                            border:'1px solid #d9d9d9',
                                            transition:'opacity 0.2s',
                                        }}
                                    >
                                        Hủy
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Nút "Thêm ảnh" - chỉ hiển thị nếu state là done VÀ trong vòng 12 tiếng kể từ date_end_actual */}
                        {!isAddingImages && data.state === 'done' && data.date_end_actual && isWithin12Hours() && (
                            <div style={{padding:'12px 16px 0',display:'flex',justifyContent:'center'}}>
                                <div
                                    onClick={() => setIsAddingImages(true)}
                                    style={{
                                        display:'flex',alignItems:'center',gap:6,
                                        cursor:'pointer',color:'white',fontSize:14,fontWeight:600,
                                        padding:'8px 20px',borderRadius:6,
                                        backgroundColor:myColor.buttonColor,
                                        transition:'opacity 0.2s',
                                        boxShadow:'0 2px 6px rgba(0,0,0,0.15)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    <IoAddCircleOutline style={{fontSize:18}}/>
                                    <span>Thêm ảnh</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Modal>

            {/* Lightbox viewer */}
            {lightboxIndex !== null && createPortal(
                <div
                    style={{
                        position:'fixed',top:0,left:0,right:0,bottom:0,
                        backgroundColor:'rgba(0,0,0,0.92)',
                        zIndex:100000,display:'flex',alignItems:'center',justifyContent:'center',
                    }}
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Nút đóng */}
                    <div
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
                        style={{
                            position:'absolute',top:16,right:16,
                            width:40,height:40,borderRadius:'50%',
                            backgroundColor:'rgba(255,255,255,0.15)',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            cursor:'pointer',zIndex:10001,
                            transition:'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                    >
                        <IoClose style={{fontSize:24,color:'white'}}/>
                    </div>

                    {/* Số thứ tự ảnh */}
                    <div style={{
                        position:'absolute',top:20,left:'50%',transform:'translateX(-50%)',
                        color:'rgba(255,255,255,0.7)',fontSize:14,fontWeight:500,
                    }}>
                        {lightboxIndex + 1} / {images.length}
                    </div>

                    {/* Nút trước */}
                    {lightboxIndex > 0 && (
                        <div
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            style={{
                                position:'absolute',left:12,
                                width:44,height:44,borderRadius:'50%',
                                backgroundColor:'rgba(255,255,255,0.15)',
                                display:'flex',alignItems:'center',justifyContent:'center',
                                cursor:'pointer',zIndex:10001,
                                transition:'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                        >
                            <IoChevronBack style={{fontSize:24,color:'white'}}/>
                        </div>
                    )}

                    {/* Ảnh chính */}
                    <img
                        src={getImageSrc(images[lightboxIndex])}
                        alt={images[lightboxIndex]?.name || ''}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth:'90vw',maxHeight:'85vh',
                            objectFit:'contain',borderRadius:4,
                            userSelect:'none',
                        }}
                    />

                    {/* Nút tiếp */}
                    {lightboxIndex < images.length - 1 && (
                        <div
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            style={{
                                position:'absolute',right:12,
                                width:44,height:44,borderRadius:'50%',
                                backgroundColor:'rgba(255,255,255,0.15)',
                                display:'flex',alignItems:'center',justifyContent:'center',
                                cursor:'pointer',zIndex:10001,
                                transition:'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                        >
                            <IoChevronForward style={{fontSize:24,color:'white'}}/>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </List.Item>
    )
}