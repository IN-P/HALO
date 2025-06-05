import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3065'; // 백엔드 API 주소

export default axios;
