const common = require("../../../../utilities/common");
const database = require("../../../../config/database");
const response_code = require("../../../../utilities/response-error-code");
const md5 = require("md5");
const { t } = require("localizify");

class UserModel {
    
    async signup(request_data) {
        try {
            const { user_name, password_,email_id, device_type, os_version, app_version, time_zone} = request_data;
            const userToken = common.generateToken(40);
            const deviceToken = common.generateToken(40);

            const device_data = {
                device_type,
                os_version,
                app_version,
                time_zone,
                device_token: deviceToken,
                user_token: userToken,
            };

            let userData;

            const existingUser =  await common.findExistingUser(email_id);

            if (existingUser.length > 0) {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('email_already_registered')
                };
            }

                userData = {
                    user_name,
                    email_id,
                    password_: md5(password_)
                };

            const insertIntoUser = `INSERT INTO tbl_user SET ?`;
            const [insertResult] = await database.query(insertIntoUser, [userData]);
            
            device_data.user_id = insertResult.insertId;

            const insertDeviceData = `INSERT INTO tbl_device_info SET ?`;
            await database.query(insertDeviceData, device_data);

            const userFind = `SELECT user_name FROM tbl_user WHERE user_id = ? AND is_deleted = 0`;
            const [user] = await database.query(userFind, [insertResult.insertId]);

            return {
                code: response_code.SUCCESS,
                message: t('signup_success'),
                data: userToken
            };

        } catch (error) {
            return {
                code: response_code.OPERATION_FAILED,
                message: t('some_error_occurred'),
                data: error.message
            };
        }
    }

    async login(request_data) {
        try {
            if(!(await common.checkExistingUser(request_data.email_id))){
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t("user_not_found_please_register")
                }
            } else{
                const passwordHash = md5(request_data.password_);
                const selectUserWithCred = "SELECT * FROM tbl_user WHERE email_id = ? AND password_ = ?";
                const params = [request_data.email_id, passwordHash];

                const [status] = await database.query(selectUserWithCred, params);
    
                if (status.length === 0) {
                    console.log("No user found");
                    return {
                        code: response_code.NOT_FOUND,
                        message: t('no_data_found')
                    };
                }
                const user_id = status[0].user_id;
                const [data] =await database.query("Select * from tbl_user where is_login = 1 and user_id = ?", user_id);
                if(data.length > 0) {
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('user_already_logged_in')
                    };
                    }
                
                const userToken = common.generateToken(40);
                const deviceToken = common.generateToken(40);

                await database.query("UPDATE tbl_user SET is_login = 1 WHERE user_id = ?", [user_id]);

                const device_data = {
                    device_type: "Android",
                    time_zone: "UTC",
                    device_token: deviceToken,
                    user_token: userToken,
                    os_version: "23.8.8",
                    app_version: "1.2.3"
                }
                await database.query(`UPDATE tbl_device_info SET ? where user_id = ?`, [device_data, user_id]);

                const userInfo = await common.getUserDetailLogin(user_id);
                if (!userInfo) {
                    return {
                        code: response_code.NOT_FOUND,
                        message: t('no_data_found')
                    };
                }
        
                return {
                    code: response_code.SUCCESS,
                    message: t('login_success'),
                    data: userToken
                };
            }
    
        } catch (error) {
            console.error("Login error:", error);
            return {
                code: response_code.OPERATION_FAILED,
                message: error.sqlMessage || error.message
            };
        }
    }

    async logout(request_data, user_id) {
        try {
            const select_user_query = "SELECT * FROM tbl_user WHERE user_id = ? and is_login = 1";
            console.log(user_id)
            const [info] = await database.query(select_user_query, [user_id]);
            console.log(info);

            if (info.length > 0) {
                const updatedUserQuery = "update tbl_device_info set device_token = '',user_token='',updated_at = NOW() where user_id = ?"
                const updatedTokenQuery = "update tbl_user set   is_login = 0 where user_id = ?"

                await Promise.all([
                    database.query(updatedUserQuery, [user_id]),
                    database.query(updatedTokenQuery, [user_id])
                ]);

                const getUserQuery = "SELECT * FROM tbl_user WHERE user_id = ?";
                const [updatedUser] = await database.query(getUserQuery, [user_id]);

                return {
                    code: response_code.SUCCESS,
                    message: t('logout_success'),
                    data: updatedUser[0]
                };
            } else {
                return {
                    code: response_code.NOT_FOUND,
                    message: t('user_not_found_or_logged_out')
                };
            }
        } catch (error) {
            return {
                code: response_code.OPERATION_FAILED,
                message: t('some_error_occurred'),
                data: error
            };
        }
    }
}

module.exports = new UserModel();
