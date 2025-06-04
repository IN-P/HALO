const initialState = {
  me: 1,
  selectedUser: null,
  log: [],
  showNewMsgAlert: false,
  showSearchModal: false,
  searchTerm: '',
  message: '', 
  chatRooms: [],
};


export const setMe = (payload) => ({ type: 'SET_ME', payload });
export const setSelectedUser = (payload) => ({ type: 'SET_SELECTED_USER', payload }); 
export const addLog = (payload) => ({ type: 'ADD_LOG', payload }); 
export const clearLog = () => ({ type: 'CLEAR_LOG' });
export const toggleSearchModal = (payload) => ({ 
  type: 'TOGGLE_SEARCH_MODAL',
  payload: payload !== undefined ? payload : null 
});
export const setSearchTerm = (payload) => ({ type: 'SET_SEARCH_TERM', payload });
export const setMessage = (payload) => ({ type: 'SET_MESSAGE', payload }); 
export const setShowNewMsgAlert = (payload) => ({ type: 'SET_NEW_MSG_ALERT', payload });


const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ME':
      return { ...state, me: action.payload };
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    case 'ADD_LOG': 
      return { ...state, log: [...state.log, action.payload] };
    case 'CLEAR_LOG':
      return { ...state, log: [] };
    case 'TOGGLE_SEARCH_MODAL':
      return { ...state, showSearchModal: action.payload !== null ? action.payload : !state.showSearchModal };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_MESSAGE': 
      return { ...state, message: action.payload };
    case 'SET_NEW_MSG_ALERT': 
      return { ...state, showNewMsgAlert: action.payload };
    default:
      return state;
  }
};

export default chatReducer;