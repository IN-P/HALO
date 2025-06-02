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

export const toggleSearchModal = () => ({
  type: 'TOGGLE_SEARCH_MODAL',
});

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
      return { ...state, showSearchModal: !state.showSearchModal };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_NEW_MSG_ALERT':
      return { ...state, showNewMsgAlert: action.payload };
    default:
      return state;
  }
};

export default chatReducer;
