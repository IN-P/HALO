import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios';

const RightSidebar = () => {
    // 백엔드의 gridMap 키와 정확히 일치해야 합니다.
    const stadiumKeys = [
        "lg", // 잠실 (LG 트윈스)
        "sk", // 문학 (SSG 랜더스)
        "kiwoom", // 고척 (키움 히어로즈)
        "samsung", // 대구 (삼성 라이온즈)
        "lotte", // 사직 (롯데 자이언츠)
        "nc", // 창원 (NC 다이노스)
        "kt", // 수원 (KT 위즈)
        "hanwha", // 대전 (한화 이글스)
        "kia" // 광주 (KIA 타이거즈)
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

    // currentStadiumIndex의 최신 값을 참조하기 위한 useRef 추가
    const currentStadiumIndexRef = useRef(currentStadiumIndex);
    useEffect(() => {
        currentStadiumIndexRef.current = currentStadiumIndex; // ref에 최신 값 동기화
    }, [currentStadiumIndex]);

    const fetchWeather = async (stadiumKeyToFetch) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:3065/api/weather/${stadiumKeyToFetch}`);
            
            setWeatherInfo({
                stadium: response.data.stadium,
                temperature: response.data.temperature,
                humidity: response.data.humidity, // 습도 정보도 포함하도록 추가
                wind: response.data.wind, // 풍속 정보도 포함하도록 추가
                weatherStatus: response.data.weatherStatus,
                weatherIcon: response.data.weatherIcon,
            });
        } catch (err) {
            console.error('날씨 정보를 가져오는 데 실패:', err);
            if (err.response && err.response.data && err.response.data.error) {
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
            setLoading(false); // 로딩 상태는 항상 마지막에 변경
        }
    };

    useEffect(() => {
        // 컴포넌트 마운트 시 또는 currentStadiumIndex 변경 시 최초 한 번 호출
        fetchWeather(stadiumKeys[currentStadiumIndex]); 
        
        // setInterval 내부에서 ref를 통해 최신 currentStadiumIndex 참조
        const intervalId = setInterval(() => {
            const latestStadiumKey = stadiumKeys[currentStadiumIndexRef.current];
            fetchWeather(latestStadiumKey);
        }, 30 * 60 * 1000); // 30분마다 업데이트
        
        return () => clearInterval(intervalId); 
    }, [currentStadiumIndex]); // 의존성 배열에 currentStadiumIndex 유지

    const goToPreviousStadium = () => {
        setCurrentStadiumIndex((prevIndex) =>
            (prevIndex - 1 + stadiumKeys.length) % stadiumKeys.length // 순환 로직
        );
    };

    const goToNextStadium = () => {
        setCurrentStadiumIndex((prevIndex) =>
            (prevIndex + 1) % stadiumKeys.length // 순환 로직
        );
    };

    return (
        <div style={{
            width: 260,
            borderLeft: '1px solid #eee',
            padding: 24,
            background: '#fff',
            minHeight: '100vh',
            display: 'flex', 
            flexDirection: 'column'
        }}>
            <div style={{
                marginBottom: 24,
                padding: 16,
                border: '1px solid #ddd',
                borderRadius: 8,
                textAlign: 'center'
            }}>
                <strong>jaewon</strong>
                <div style={{ fontSize: 12, color: '#888' }}>@email</div>
            </div>

            <div style={{
                padding: 16,
                border: '1px solid #ddd',
                borderRadius: 8,
                textAlign: 'center',
                flexShrink: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '10px' 
            }}>
                <button 
                    onClick={goToPreviousStadium} 
                    style={{
                        background: 'none',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        padding: '5px 8px',
                        cursor: 'pointer',
                        fontSize: '1.2em',
                        color: '#333',
                        flexShrink: 0 
                    }}
                >
                    &lt;
                </button>

                {/* ⭐ 이 div의 스타일 변경! */}
                <div style={{ 
                    flexGrow: 1, 
                    textAlign: 'center',
                    display: 'flex', // flexbox로 변경
                    flexDirection: 'column', // 세로 방향으로 정렬
                    alignItems: 'center', // 아이콘과 텍스트 중앙 정렬
                    justifyContent: 'center', // 세로 중앙 정렬
                    gap: '5px' // 각 요소 간의 간격
                }}> 
                    {loading ? (
                        <div>날씨 정보 로딩 중...</div>
                    ) : error ? (
                        <div>{error}</div>
                    ) : (
                        <>
                            {/* 1. 날씨 아이콘 (제일 위) */}
                            {weatherInfo.weatherIcon && (
                                <img
                                    src={`/weather-icons/${weatherInfo.weatherIcon}?t=${Date.now()}`} 
                                    alt={weatherInfo.weatherStatus}
                                    style={{ width: 60, height: 60 }} // 크기 좀 키워봤어
                                />
                            )}
                            
                            {/* 2. 야구장 이름 (그 밑) */}
                            <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                                {weatherInfo.stadium}
                            </div>

                            {/* 3. 날씨 정보 (그 밑) */}
                            <div style={{ fontSize: 20, fontWeight: 'bold' }}> {/* 폰트 크기 조금 줄여서 간격 확보 */}
                                {weatherInfo.temperature} {weatherInfo.weatherStatus}
                            </div>
                            {/* 추가 정보 (선택 사항) */}
                            {weatherInfo.humidity && <div style={{ fontSize: 12, color: '#666' }}>습도: {weatherInfo.humidity}</div>}
                            {weatherInfo.wind && <div style={{ fontSize: 12, color: '#666' }}>풍속: {weatherInfo.wind}</div>}
                        </>
                    )}
                </div>

                <button 
                    onClick={goToNextStadium} 
                    style={{
                        background: 'none',
                        border: '1px solid #ccc',
                        borderRadius: '5櫃px',
                        padding: '5px 8px',
                        cursor: 'pointer',
                        fontSize: '1.2em',
                        color: '#333',
                        flexShrink: 0 
                    }}
                >
                    &gt;
                </button>
            </div>
            <div style={{ flexGrow: 1 }}> 
                {/* 여기에 다른 사이드바 내용 추가 */}
            </div>
        </div>
    );
};

export default RightSidebar;