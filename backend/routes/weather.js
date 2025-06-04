// routes/weather.js (또는 controllers/weatherController.js)
console.log('Weather Router file loaded!');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment = require('moment-timezone'); // npm install moment-timezone

// .env 파일에서 API 키 불러오기
const KMA_API_KEY = process.env.KMA_API_KEY;

// 구장명 별 격자 좌표 (스프링 부트 코드에서 가져옴)
// 소문자로 통일하여 관리하는 것이 좋다.
const gridMap = {
    "sk": { nx: 54, ny: 124, name: "문학 야구장" }, 
    "lg": { nx: 62, ny: 126, name: "잠실 야구장" }, 
    "kiwoom": { nx: 58, ny: 125, name: "고척 스카이돔" },
    "samsung": { nx: 89, ny: 90, name: "대구 삼성 라이온즈 파크" },
    "lotte": { nx: 98, ny: 76, name: "부산 사직 야구장" },
    "nc": { nx: 91, ny: 77, name: "창원 NC 파크" },
    "kt": { nx: 61, ny: 121, name: "수원 KT 위즈 파크" },
    "hanwha": { nx: 67, ny: 100, name: "대전 한화생명 이글스파크" },
    "kia": { nx: 58, ny: 74, name: "광주 기아 챔피언스 필드" },
    "lg": { nx: 62, ny: 126, name: "잠실 야구장" }, 
};

// GET: /api/weather/:stadium
// 예: http://localhost:3065/api/weather/sk
router.get('/:stadium', async (req, res, next) => {
  try {
    const stadiumKey = req.params.stadium.toLowerCase(); // URL 파라미터를 소문자로 변환

    if (!gridMap.hasOwnProperty(stadiumKey)) {
      return res.status(404).json({ error: '요청한 구장 정보가 없습니다.' });
    }

    const { nx, ny, name: stadiumName } = gridMap[stadiumKey]; // 구장 이름도 가져옴

    if (!KMA_API_KEY) {
        return res.status(500).json({ message: '기상청 API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.' });
    }

    const baseDate = moment().tz("Asia/Seoul").format('YYYYMMDD');
    const baseTime = moment().tz("Asia/Seoul").subtract(40, 'minutes').format('HHmm'); // 40분 전 시간

    const apiUrl = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst'; // 초단기실황조회
    
    const params = {
      serviceKey: decodeURIComponent(KMA_API_KEY), // 키에 +나 / 같은 특수문자가 있을 수 있으니 디코딩
      pageNo: '1',
      numOfRows: '10', // 필요한 데이터 항목 수에 따라 조절
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: nx,
      ny: ny,
    };

    console.log(`[${stadiumName}] 기상청 API 요청 URL:`, apiUrl);
    console.log(`[${stadiumName}] 요청 파라미터:`, params);

    const response = await axios.get(apiUrl, { params });
    
    // API 응답 결과 코드 확인
    const resultCode = response.data.response.header.resultCode;
    if (resultCode !== '00') {
      console.error('기상청 API 에러 응답:', response.data.response.header.resultMsg);
      // 특정 에러 코드에 대한 추가 처리 (예: 데이터 없음)
      if (resultCode === '03') { // "NO DATA" 에러 코드 (API 문서 참조)
        return res.status(200).json({ // 404 대신 200으로 보내고 데이터 없음을 알림
          stadium: stadiumName,
          temperature: 'N/A',
          humidity: 'N/A',
          wind: 'N/A',
          weatherStatus: '데이터 없음',
          weatherIcon: ''
        });
      }
      return res.status(500).json({ 
        message: '날씨 정보를 가져오는 데 실패했습니다.', 
        code: resultCode,
        description: response.data.response.header.resultMsg
      });
    }

    const weatherItems = response.data.response.body.items.item;

    if (!weatherItems || weatherItems.length === 0) {
        return res.status(404).json({ message: '해당 시간의 날씨 정보를 찾을 수 없습니다.' });
    }

    let temperature = 'N/A';
    let humidity = 'N/A';
    let wind = 'N/A';
    let ptyValue = '0'; // PTY 기본값 (0: 없음)
    let skyValue = '1'; // SKY 기본값 (1: 맑음)

    weatherItems.forEach(item => {
        switch (item.category) {
            case 'T1H': // 기온
                temperature = `${item.obsrValue}℃`;
                break;
            case 'REH': // 습도
                humidity = `${item.obsrValue}%`;
                break;
            case 'WSD': // 풍속
                wind = `${item.obsrValue}m/s`;
                break;
            case 'PTY': // 강수 형태 (0: 없음, 1: 비, 2: 비/눈, 3: 눈, 5: 빗방울, 6: 빗방울눈날림, 7: 눈날림)
                ptyValue = item.obsrValue;
                break;
            case 'SKY': // 하늘 상태 (1: 맑음, 3: 구름많음, 4: 흐림)
                skyValue = item.obsrValue;
                break;
        }
    });

    let weatherStatus = '정보 없음';
    let weatherIcon = ''; // 아이콘 파일명 (예: lottiefiles.com 에서 가져온 GIF 파일명)

    // 강수 형태(PTY) 우선 적용, 없으면 하늘 상태(SKY) 적용
    switch (ptyValue) {
        case "0": // 강수 없음
            switch (skyValue) {
                case "1":
                    weatherStatus = "맑음";
                    weatherIcon = "sunny_loop2.gif";
                    break;
                case "3":
                    weatherStatus = "구름많음";
                    weatherIcon = "cloudy_loop.gif"; // 구름 많은 아이콘
                    break;
                case "4":
                    weatherStatus = "흐림";
                    weatherIcon = "overcast_loop.gif"; // 흐린 아이콘
                    break;
                default:
                    weatherStatus = "맑음";
                    weatherIcon = "sunny_loop2.gif";
            }
            break;
        case "1":
            weatherStatus = "비";
            weatherIcon = "rain_loop2.gif";
            break;
        case "2":
            weatherStatus = "비/눈";
            weatherIcon = "rain_snow_loop2.gif";
            break;
        case "3":
            weatherStatus = "눈";
            weatherIcon = "snow_loop2.gif";
            break;
        case "5": // 빗방울 (이슬비)
            weatherStatus = "이슬비";
            weatherIcon = "rain_loop2.gif"; // 비 아이콘으로 통일
            break;
        case "6": // 빗방울눈날림
            weatherStatus = "이슬비/눈날림";
            weatherIcon = "rain_snow_loop2.gif";
            break;
        case "7": // 눈날림
            weatherStatus = "눈날림";
            weatherIcon = "snow_loop2.gif";
            break;
        default:
            weatherStatus = "정보 없음";
            weatherIcon = "";
            break;
    }


    res.status(200).json({
      stadium: stadiumName, // 구장 이름
      temperature: temperature,
      humidity: humidity,
      wind: wind,
      weatherStatus: weatherStatus,
      weatherIcon: weatherIcon,
    });

  } catch (error) {
    console.error('날씨 정보를 가져오는 중 에러 발생:', error.message);
    if (error.response) {
      console.error('기상청 API 응답 에러 데이터:', error.response.data);
    }
    next(error);
  }
});

module.exports = router;