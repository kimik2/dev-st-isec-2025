import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

interface UploadImageProps {
  onFileSelect: (file: File) => void;
}

const UploadImage: React.FC<UploadImageProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isValidFileType(file)) {
      onFileSelect(file);
    } else if (file) {
      alert('지원되지 않는 파일 형식입니다. PNG, JPG 파일만 업로드 가능합니다.');
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && isValidFileType(file)) {
      onFileSelect(file);
    } else if (file) {
      alert('지원되지 않는 파일 형식입니다. PNG, JPG 파일만 업로드 가능합니다.');
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return validTypes.includes(file.type);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="panel-title">
        <h2>탐지할 이미지 파일 업로드</h2>
      </div>
      
      {/* Format Requirements */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '0px',
        width: '100%',
        height: '52px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: '0px',
          width: '100%',
          height: '52px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '16px',
            gap: '10px',
            width: '130px',
            height: '52px',
            background: '#1C2534',
            border: '1px solid #3D4B64'
          }}>
            <span style={{
              fontFamily: 'Pretendard',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.1px',
              color: '#A5ACBA'
            }}>파일 형식</span>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '16px',
            gap: '10px',
            width: '100%',
            height: '52px',
            background: '#1C2534',
            border: '1px solid #3D4B64',
            flex: 1
          }}>
            <span style={{
              fontFamily: 'Pretendard',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.1px',
              color: '#A5ACBA'
            }}>JPG, PNG</span>
          </div>
        </div>
      </div>

      <div className="upload-container" style={{ marginTop: '16px' }}>
        <div
          className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="upload-icon">
            <Plus size={20} />
          </div>
          <div className="upload-text">
            <h3>탐지할 이미지 파일을 여기에 드롭하세요</h3>
            <p>또는 컴퓨터에서 파일을 선택하세요</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
      </div>
    </>
  );
};

export default UploadImage;
