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



};
module.exports = new User();
