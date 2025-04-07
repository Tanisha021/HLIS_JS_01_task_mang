const response_code = require("../../../../utilities/response-error-code");
const constant = require("../../../../config/constant");
const common = require("../../../../utilities/common");
const userModel = require("../models/user-model");
const authModel = require("../models/auth-model");
const { default: localizify } = require('localizify');
const validationRules = require('../../../validation_rules');
const middleware = require("../../../../middleware/validators");
const { t } = require("localizify");


class User {
    async signup(req, res) {

       const request_data = req.body;
       console.log(request_data)
        const rules = validationRules.signup;
        let message = {
            required: req.language.required,
            'email_id': t('email'),
            'password_.min': t('passwords_min'),
            'user_name': t('user_name'),
        };

        let keywords = {
            'email_id': t('email'),
            'password_.min': t('passwords_min'),
            'user_name': t('user_name'),
        };

        const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords)
        console.log("Valid", valid);
        if (!valid) return;

        const responseData = await authModel.signup(request_data);
        return common.response(res, responseData);
    }

    async login(req, res) {
        try {
            const request_data = req.body;
            const rules = validationRules.login;

            if (!request_data.password_) {
                return common.response(res, {
                    code: response_code.BAD_REQUEST,
                    message: t('rest_keywords_password')
                });
            }

            let message = {
                required: req.language.required,
                email: t('email'),
                password_: t('rest_keywords_password'),
                'password_.min': t('passwords_min')
            }

            let keywords = {
                'email_id': t('rest_keywords_email_id'),
                'password_': t('rest_keywords_password')
            }
            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords)
            console.log("Valid", valid);
            if (!valid) return;

            const responseData = await authModel.login(request_data);

            return common.response(res, responseData);
        } catch (error) {
            console.error("Error in login:", error);
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong') + error
            });
        }

    }

    async showAllTasks(req, res) {
        try {
            const request_data = req.body;

            const rules = validationRules.showAllTasks;

            const valid = middleware.checkValidationRules(req, res, request_data, rules)
            console.log("Valid", valid);
            if (!valid) return;
            const responseData = await userModel.showAllTasks(request_data, req.user_id);
            return common.response(res, responseData);

        } catch (error) {
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong') + error
            });
        }
    }

    async createTask(req, res) {
        try {
            let request_data = req.body;
            const rules = validationRules.createTask

            let message = {
                required: req.language.required,
                required: t('required'),
                user_id:t("user_id"),
                title: t('title'),
                description: t('description'),
                deadline: t('deadline')
                
            }

            let keywords = {
                user_id:t("user_id"),
                title: t('title'),
                description: t('description'),
                deadline: t('deadline')
            }

            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);

            if (!valid) return;

            const responseData = await userModel.createTask(request_data, req.user_id);

            // Send response
            return common.response(res, responseData);
        } catch (error) {
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong') + error
            });
        }
    }
    async manageTimer(req, res) {
        try {
            let request_data = req.body;
            const rules = validationRules.manageTimer

            let message = {
                required: req.language.required,
                required: t('required'),
                user_id:t("user_id"),
                task_id : t('task_id'),
                action: t('action')
                
            }

            let keywords = {
                user_id:t("user_id"),
                task_id : t('task_id'),
                action: t('action')
            }

            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);

            if (!valid) return;

            const responseData = await userModel.manageTimer(request_data, req.user_id);

            // Send response
            return common.response(res, responseData);
        } catch (error) {
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong') + error
            });
        }
    }

    async logout(req, res) {
        try {
             const request_data = req.body;
             
             console.log("Request Data after decryption:", request_data);
             console.log(request_data);
             const rules = validationRules.logout;
 
             const valid = middleware.checkValidationRules(req, res, request_data, rules)
             console.log("Valid", valid);
             if (!valid) return;
             const responseData = await authModel.logout(request_data, req.user_id);
 
             // Send response
             return common.response(res, responseData);

        } catch (error) {
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong') + error
            });
        }
    }

    async delete(req, res) {
        try {
            console.log("Request Body:", req.body, "Type:", typeof req.body);

            let request_data = {};

            // Decrypt only if req.body is not empty
            if (req.body && Object.keys(req.body).length > 0) {
                const decryptedData = common.decryptString(req.body);

                // Ensure decrypted data is a valid JSON string before parsing
                if (typeof decryptedData === "string" && decryptedData.trim() !== "") {
                    request_data = JSON.parse(decryptedData);
                } else {
                    return common.response(res, {
                        code: response_code.OPERATION_FAILED,
                        message: "Invalid decrypted data format"
                    });
                }
            }

            console.log("Request Data after decryption:", request_data);

            // Validate request data
            const rules = validationRules.delete;
            const valid = middleware.checkValidationRules(req, res, request_data, rules);
            console.log("Valid", valid);
            if (!valid) return;

            // Call the delete function
            const responseData = await userModel.delete(request_data, req.user_id);

            // Send response
            return common.response(res, responseData);

        } catch (error) {
            console.error("Error in delete:", error);
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: `Oopss... Something Went Wrong! ${error.message}`
            });
        }
    }


};
module.exports = new User();

// async forgotPassword(req, res) {
//     // {
//     //     "email_id":"ra@example.com"
//     // }
//     try {
//         const request_data = JSON.parse(common.decryptPlain(req.body));

//         const rules = validationRules.forgotPassword;
//         let message = {
//             required: req.language.required,
//             email: t('email'),
//         };

//         let keywords = {
//             'email_id': t('rest_keywords_email_id')
//         };

//         const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords)
//         console.log("Valid", valid);
//         if (!valid) return;

//         const responseData = await authModel.forgotPassword(request_data);
//         return common.response(res, responseData);

//     } catch (error) {
//         return common.response(res, {
//             code: response_code.OPERATION_FAILED,
//             message: t('rest_keywords_something_went_wrong')
//         });
//     }

// }

// async validateForgotPasswordOTP(req, res) {
//     // {
//     //     "user_id": 1,
//     //     "otp": 7652
//     //   }

//     const request_data = JSON.parse(common.decryptPlain(req.body));
//     const rules = validationRules.validateOTP;
//     let message = {
//         required: req.language.required,
//         'phone_number.regex': t('mobile_number_numeric'),
//         'otp': t('otp')
//     };

//     let keywords = {
//         'phone_number.regex': t('mobile_number_numeric'),
//         'otp': t('otp')
//     };

//     const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords)
//     console.log("Valid", valid);
//     if (!valid) return;

//     const responseData = await authModel.validateForgotPasswordOTP(request_data);
//     return common.response(res, responseData);
// }

// async resetPassword(req, res) {
//     // {
//     //     "user_id": 1,
//     //     "email_id":"ra@example.com",
//     //     "password_": "mypassword2"

//     // }

//     try {
//         const request_data = JSON.parse(common.decryptPlain(req.body));
//         const rules = validationRules.resetPassword;
//         let message = {
//             required: req.language.required,
//             email_id: t('email'),
//             'password_.min': t('passwords_min')
//         };

//         let keywords = {
//             'email_id': t('rest_keywords_email_id')
//         };

//         const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);
//         if (!valid) return;
//         const responseData = await authModel.resetPassword(request_data);

//         return common.response(res, responseData);

//     } catch (error) {
//         return common.response(res, {
//             code: response_code.OPERATION_FAILED,
//             message: t('rest_keywords_something_went_wrong')
//         });
//     }


//     // userModel.resetPassword(request_data, (_responseData) => {
//     //     common.response(res, _responseData);
//     // });
// }

// async changePassword(req, res) {
//     // {
//     //     "old_password": "mypassword2",
//     //     "new_password":"mypassword3"
//     // }

//     try {
//         // var request_data = req.body;
//         const request_data = JSON.parse(common.decryptPlain(req.body));

//         const rules = validationRules.changePassword

//         let message = {
//             required: req.language.required,
//             required: t('required'),
//             'old_password.min': t('passwords_min'),
//             'new_password.min': t('passwords_min')
//         }

//         let keywords = {
//             'new_password': t('rest_keywords_password'),
//             'old_password': t('rest_keywords_password')
//         }

//         const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);

//         if (!valid) return;

//         const responseData = await authModel.changePassword(request_data, req.user_id);

//         // Send response
//         return common.response(res, responseData);
//     } catch (error) {
//         return common.response(res, {
//             code: response_code.OPERATION_FAILED,
//             message: t('rest_keywords_something_went_wrong')
//         });
//     }
// }