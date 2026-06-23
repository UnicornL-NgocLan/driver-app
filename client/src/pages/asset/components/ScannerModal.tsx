import React, { useRef } from 'react';
import { Modal } from 'antd';
import QrScanner from 'qr-scanner';

interface ScannerModalProps {
    open: boolean;
    onCancel: () => void;
    onScan: (result: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ open, onCancel, onScan }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
            scannerRef.current = null;
        }
    };

    const startScanner = () => {
        if (!videoRef.current) return;

        scannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
                if (result && result.data) {
                    stopScanner();
                    onScan(result.data);
                }
            },
            {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                preferredCamera: 'environment',
            }
        );

        scannerRef.current.start().catch((err) => {
            console.error("Lỗi khi mở camera:", err);
        });
    };

    const handleAfterOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            startScanner();
        } else {
            stopScanner();
        }
    };

    return (
        <Modal
            title="Quét mã QR đơn hàng"
            open={open}
            onCancel={() => {
                stopScanner();
                onCancel();
            }}
            footer={null}
            destroyOnClose
            centered
            afterOpenChange={handleAfterOpenChange}
        >
            <div style={{ width: '100%', overflow: 'hidden', borderRadius: 8 }}>
                <video ref={videoRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
        </Modal>
    );
};

export default ScannerModal;
