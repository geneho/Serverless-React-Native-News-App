const initialState = {
  userData: 'User',
  emailData: ''
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        emailData: action.payload[0][1],
        userData: action.payload[0][0]
      };
    default:
      return state;
  }
};

export default user;
