const checkValidatorRules = {

    login: {
        email_id: 'required|email',
        password_: 'required|min:8',
    },   
    signup: {    
        email_id: 'required|email',
        user_name: 'required|string',
        password_: 'required|min:8',
    },

    createTask:{
        title: 'required|string',
        description: 'required|string',
        deadline: 'required|date'
    }
        
    
};

module.exports = checkValidatorRules;

