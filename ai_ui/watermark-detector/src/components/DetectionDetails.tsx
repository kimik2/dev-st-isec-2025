import React from 'react';
import { Clock, CheckCircle, XCircle, User, Briefcase, Users, AtSign, Phone, Monitor, Info, Globe, Watch, Hourglass, X } from 'lucide-react';
import { DetectionResult, ProcessingState } from '../App';

interface DetectionDetailsProps {
  processingState: ProcessingState;
  detectionResult: DetectionResult | null;
  onRestart?: () => void;
}

const DetectionDetails: React.FC<DetectionDetailsProps> = ({
  processingState,
  detectionResult,
  onRestart,
}) => {
  const renderStatusIcon = () => {
    switch (processingState) {
      case 'in_queue':
        return <Clock className="status-icon in-queue" />;
      case 'in_progress':
        return (
          <div className="spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        );
      case 'completed':
        if (detectionResult?.status === 'detected') {
          return <CheckCircle className="status-icon detected" />;
        } else {
          return <XCircle className="status-icon not-detected" />;
        }
      default:
        return null;
    }
  };

  const renderStatusBadge = () => {
    let badgeClass = 'status-badge';
    let text = '';
    
    switch (processingState) {
      case 'in_queue':
        badgeClass += ' in-queue';
        text = '대기 중';
        break;
      case 'in_progress':
        badgeClass += ' in-progress';
        text = '진행 중';
        break;
      case 'completed':
        if (detectionResult?.status === 'detected') {
          badgeClass += ' detected';
          text = '검출됨';
        } else {
          badgeClass += ' not-detected';
          text = '검출되지 않음';
        }
        break;
      default:
        return null;
    }

    return (
      <div className={badgeClass}>
        {processingState === 'in_queue' && <Clock size={16} color="#FFFFFF" />}
        {processingState === 'in_progress' && <Hourglass size={16} className="hourglass-rotating" />}
        {processingState === 'completed' && detectionResult?.status === 'detected' && <CheckCircle size={18} />}
        {processingState === 'completed' && detectionResult?.status === 'not_detected' && <X size={16} color="#FFFFFF" />}
        <span>{text}</span>
      </div>
    );
  };

  const renderContent = () => {
    // upload 상태에서는 이 컴포넌트가 렌더링되지 않음
    if (processingState === 'completed' && detectionResult) {
      if (detectionResult.status === 'detected') {
        return (
          <div className="detection-panel">
            <div className="detection-title-section">
              <div className="detection-title-left">
                <h2>탐지 세부정보</h2>
                {renderStatusBadge()}
              </div>
              <div style={{
                fontFamily: 'Pretendard',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '13px',
                lineHeight: '18px',
                letterSpacing: '-0.1px',
                color: '#A5ACBA',
                marginLeft: '16px', // 캡션과 버튼 사이 간격 추가
                whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
                flexShrink: 0 // 텍스트가 줄어들지 않도록 설정
              }}>
                {detectionResult.time}
              </div>
            </div>
            
            {/* <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              padding: '16px 0px', 
              gap: '8px', 
              width: '100%', 
              height: '108px' 
            }}>
             
            </div> */}

            <div className="info-grid">
               <div className="leaker-info-title">
                <User size={14} style={{ color: '#A5ACBA' }} />
                <span>유출자 정보</span>
              </div>
              
                <div className="leaker-profile">
                <div className="leaker-avatar">
                  <User size={16} style={{ color: '#A5ACBA' }} />
                </div>
                <span className="leaker-name">{detectionResult.leaker_info?.name || '알 수 없음'}</span>
              </div>

              {detectionResult.company && (
                <div className="info-item">
                  <div className="info-label-section">
                    <Briefcase size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">회사</span>
                  </div>
                  <span className="info-value">{detectionResult.company}</span>
                </div>
              )}
              
              {detectionResult.team && (
                <div className="info-item">
                  <div className="info-label-section">
                    <Users size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">팀</span>
                  </div>
                  <span className="info-value">{detectionResult.team}</span>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '2px 8px',
                    gap: '4px',
                    width: '39px',
                    height: '22px',
                    background: '#273245',
                    borderRadius: '5px'
                  }}>
                    <span style={{
                      fontFamily: 'Pretendard',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      fontSize: '13px',
                      lineHeight: '18px',
                      letterSpacing: '-0.1px',
                      color: '#FFFFFF'
                    }}>팀장</span>
                  </div>
                </div>
              )}
              
              {detectionResult.email && (
                <div className="info-item">
                  <div className="info-label-section">
                    <AtSign size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">이메일</span>
                  </div>
                  <span className="info-value">{detectionResult.email}</span>
                </div>
              )}
              
              {detectionResult.contact && (
                <div className="info-item">
                  <div className="info-label-section">
                    <Phone size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">연락처</span>
                  </div>
                  <span className="info-value">{detectionResult.contact}</span>
                </div>
              )}
              
              {detectionResult.device && (
                <div className="info-item">
                  <div className="info-label-section">
                    <Monitor size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">장치</span>
                  </div>
                  <span className="info-value">{detectionResult.device}</span>
                </div>
              )}
              
              {detectionResult.serial && (
                <div className="info-item">
                  <div className="info-label-section">
                    <Info size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">일련번호</span>
                  </div>
                  <span className="info-value">{detectionResult.serial}</span>
                </div>
              )}
              
              {detectionResult.ip && (
                <div className="info-item">
                  <div className="info-label-section">
                    <Globe size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">IP</span>
                  </div>
                  <span className="info-value">{detectionResult.ip}</span>
                </div>
              )}
              
              {detectionResult.gps?.location && (
                <div className="info-item">
                  <div className="info-label-section">
                    <Globe size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">GPS</span>
                  </div>
                  <span className="info-value">{detectionResult.gps.location}</span>
                </div>
              )}
              
              {detectionResult.time && (
                <div className="info-item">
                  <div className="info-label-section">
                    <Watch size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">시간</span>
                  </div>
                  <span className="info-value">{detectionResult.time}</span>
                </div>
              )}

              {detectionResult.ext && (
                <div className="info-item">
                    <div className="info-label-section">
                    <Info size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">워터마크 정보</span>
                    </div>
                  <span>
                    {(() => {
                    try {
                      const parsed = JSON.parse(detectionResult.ext);
                      return parsed.message || detectionResult.ext;
                    } catch {
                      return detectionResult.ext;
                    }
                  })()}</span>
                </div>
              )}
                {detectionResult.outFileName && (
                <div className="info-item">
                    <div className="info-label-section">
                    <Info size={14} style={{ color: '#A5ACBA' }} />
                    <span className="info-label">출력 파일 이름</span>
                    </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="info-value">{detectionResult.outFileName}</span>
                    <button
                    className="view-file-btn"
                    onClick={() => {
                    const fileUrl = `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080'}/ai?filename=${detectionResult.outFileName}`;
                    window.open(fileUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no,status=no');
                    }}
                    style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#273245',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                    }}
                    >
                    보정된 이미지 파일 보기
                    </button>
                  </div>
                </div>
                )}
            </div>
          </div>
        );
      } else {
        return (
          <div className="detection-panel">
            <div className="detection-title-section">
              <div className="detection-title-left">
                <h2>탐지 세부정보</h2>
                {renderStatusBadge()}
              </div>
            </div>
            <div className="detection-details">
              {renderStatusIcon()}
              <div className="not-detected-message">
                워터마크가 검출되지 않았습니다.
              </div>
              {onRestart && (
                <button 
                  className="restart-detection-btn"
                  onClick={onRestart}
                >
                  탐지 재시작
                </button>
              )}
            </div>
          </div>
        );
      }
    }

    // in_queue 또는 in_progress 상태
    return (
      <div className="detection-panel">
        <div className="detection-title-section">
          <div className="detection-title-left">
            <h2>탐지 세부정보</h2>
            {renderStatusBadge()}
          </div>
        </div>
        <div className="detection-details">
          {renderStatusIcon()}
          {processingState === 'in_progress' && (
            <div style={{ color: '#A5ACBA', fontSize: '14px', textAlign: 'center' }}>
              잠시만 기다려 주세요.
              <br />
              탐지에는 최대 24시간이 소요될 수 있습니다.
            </div>
          )}
        </div>
      </div>
    );
  };

  return renderContent();
};

export default DetectionDetails;
