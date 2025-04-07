const User = require('../controller/user');  

const customerRoute = (app) => {
    //authentication
    app.post("/v1/user/signup", User.signup); 
    app.post("/v1/user/login", User.login);

    app.post("/v1/user/create-task", User.createTask);
    app.post("/v1/user/show-all-tasks", User.showAllTasks);
    app.post("/v1/user/manage-timer", User.manageTimer);
    
    app.post("/v1/user/logout", User.logout);
    app.post("/v1/user/delete", User.delete);

};

module.exports = customerRoute;



