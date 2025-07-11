import React, { useState, useEffect, useRef } from 'react'; 
import { useSelector } from 'react-redux';
import axios from 'axios';

const RightSidebar = () => {
    const stadiumKeys = [
        "lg", "sk", "kiwoom", "samsung", "lotte", "nc", "kt", "hanwha", "kia"
    ];
    const [currentStadiumIndex, setCurrentStadiumIndex] = useState(0); 

    const [weatherInfo, setWeatherInfo] = useState({
        stadium: '잠실 야구장', 
        temperature: '...',
        weatherStatus: '날씨 정보 불러오는 중...',
        weatherIcon: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentStadiumIndexRef = useRef(currentStadiumIndex);
    useEffect(() => {
        currentStadiumIndexRef.current = currentStadiumIndex;
    }, [currentStadiumIndex]);

    const fetchWeather = async (stadiumKeyToFetch) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:3065/api/weather/${stadiumKeyToFetch}`);
            setWeatherInfo({
                stadium: response.data.stadium,
                temperature: response.data.temperature,
                humidity: response.data.humidity,
                wind: response.data.wind,
                weatherStatus: response.data.weatherStatus,
                weatherIcon: response.data.weatherIcon,
            });
        } catch (err) {
            console.error('날씨 정보를 가져오는 데 실패:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('날씨 정보 불러오기 실패');
            }
            setWeatherInfo({ 
                stadium: '정보 없음',
                temperature: 'N/A',
                humidity: 'N/A',
                wind: 'N/A',
                weatherStatus: '날씨 정보 없음',
                weatherIcon: '',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather(stadiumKeys[currentStadiumIndex]); 
        const intervalId = setInterval(() => {
            const latestStadiumKey = stadiumKeys[currentStadiumIndexRef.current];
            fetchWeather(latestStadiumKey);
        }, 30 * 60 * 1000);
        return () => clearInterval(intervalId); 
    }, [currentStadiumIndex]);

    const goToPreviousStadium = () => {
        setCurrentStadiumIndex((prevIndex) =>
            (prevIndex - 1 + stadiumKeys.length) % stadiumKeys.length
        );
    };

    const goToNextStadium = () => {
        setCurrentStadiumIndex((prevIndex) =>
            (prevIndex + 1) % stadiumKeys.length
        );
    };

    const { user } = useSelector((state) => state.user_YG);

    // 관리자 전용 뷰 매핑 
    // 링크 본인이 직접 연결해야함!!!!
    const adminViews = {
        2: { label: '광고 관리', path: '/admin/ads' },
        3: { label: '신고 관리', path: '/admin/report/report'},
        4: { label: '문의 관리', path: '/admin/inquiry/inquiry' },
        5: { label: '유저 관리', path: '/admin/users' },
        6: { label: '보안 로그', path: '/admin/logs' },
        7: { label: '커스텀 관리', path: '/admin/custom/badge' }, // 뱃지 연결
        8: { label: '업적 관리', path: '/admin/achievements' },
        9: { label: '채팅 관리', path: '/admin/chat' },
        10: { label: '포스트 관리', path: '/admin/post/posts' },
        11: { label: '분석 리포트', path: '/admin/analytics/analytics' },
        12: { label: '이벤트 관리', path: '/admin/event/roulette' },
        13: { label: '상점 관리', path: '/admin/player'},
    };

    return (
        <div 
        className="weather-box" 
        style={{
            width: 340,
            borderLeft: '1px solid #eee',
            padding: 24,
            //background: '#fff',
            minHeight: '100vh',
            display: 'flex', 
            flexDirection: 'column'
        }}>
            {/*미니 프로필 영역*/}
            <div 
            className="mini-profile-card"
            onClick={() => window.location.href = `http://localhost:3000/profile/${user?.id}`} 
            style={{
                marginBottom: 24,
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                //backgroundColor: '#fafafa',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
            }}
            >
                        {/* 프로필 이미지 */}
            <div 
            className="user-profile-circle"
            style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            }}>
            {user?.profile_img ? (
                <img 
                src={`http://localhost:3065${user?.profile_img}`} 
                alt="프로필 이미지"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                />
            ) : (
                <div style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: '#555',
                }}>
                {user?.nickname?.charAt(0) || 'U'}
                </div>
            )}
            </div>
                {/* 닉네임*/}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: 16 }}>{user?.nickname}</span>
                </div>
            </div>

            {/* 일반회원: 날씨 / 관리자: 버튼 */}
            {user?.role === 0 ? (
                <div 
                className="weather-box"
                style={{
                    marginTop: 250, // ✅ 위쪽 여백 추가
                    marginBottom: 32, // ✅ 아래쪽도 여유
                    padding: 16,
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    textAlign: 'center',
                    flexShrink: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '10px',
                    //backgroundColor: '#F5F9FF'
                }}>
                    <button onClick={goToPreviousStadium} 
                    className="weather-nav-btn"
                    style={{
                        background: 'none',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        padding: '5px 8px',
                        cursor: 'pointer',
                        fontSize: '1.2em',
                        flexShrink: 0 
                    }}>&lt;</button>

                    <div style={{ 
                        flexGrow: 1, 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                    }}> 
                        {loading ? (
                            <div style={{ fontSize: 14, color: '#888' }}>⏳ 날씨 정보 로딩 중...</div>
                        ) : error ? (
                            <div style={{ fontSize: 14, color: 'red' }}>⚠️ {error}</div>
                        ) : (
                            <>
                                {weatherInfo.weatherIcon && (
                                    <img
                                        src={`/weather-icons/${weatherInfo.weatherIcon}?t=${Date.now()}`} 
                                        alt={weatherInfo.weatherStatus}
                                        style={{ width: 80, height: 80 }}
                                    />
                                )}
                                <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                                    {weatherInfo.stadium}
                                </div>
                                <div className="weather-status-main">
                                    {weatherInfo.temperature} {weatherInfo.weatherStatus}
                                    <div className="weather-status-sub">
                                    {weatherInfo.weatherStatus}
                                    </div>
                                </div>
                                {weatherInfo.humidity && <div className="weather-detail">💧습도: {weatherInfo.humidity}</div>}
                                {weatherInfo.wind && <div className="weather-detail">🌬️풍속: {weatherInfo.wind}</div>}
                            </>
                        )}
                    </div>

                    <button onClick={goToNextStadium} 
                    className="weather-nav-btn"
                    style={{
                        background: 'none',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        padding: '5px 8px',
                        cursor: 'pointer',
                        fontSize: '1.2em',
                        flexShrink: 0 
                    }}>&gt;</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {user?.role === 1 ? (
                        Object.entries(adminViews).map(([code, { label, path }]) => (
                            <button
                                key={code}
                                onClick={() => window.location.href = path}
                                style={{
                                    padding: 12,
                                    backgroundColor: '#FFF3E0',
                                    color: '#D84315',
                                    border: '1px solid #FFB74D',
                                    borderRadius: 8,
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                🛠 {label}
                            </button>
                        ))
                    ) : (
                        adminViews[user?.role] && (
                            <button
                                onClick={() => window.location.href = adminViews[user.role].path}
                                style={{
                                    padding: 12,
                                    backgroundColor: '#FFF3E0',
                                    color: '#D84315',
                                    border: '1px solid #FFB74D',
                                    borderRadius: 8,
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                🛠 {adminViews[user.role].label}
                            </button>
                        )
                    )}
                </div>
            )}

            <div style={{ flexGrow: 1 }}>
                {/* 여기에 다른 사이드바 내용 추가 */}
            </div>
        </div>
    );
};

export default RightSidebar;
