const database = require("../../../../config/database");
const response_code = require("../../../../utilities/response-error-code");
const { t } = require("localizify");


class UserModel {

    async createTask(request_data,user_id) {
        try {
            const data = { 
                user_id:user_id,
                title:request_data.title,
                description:request_data.description,
                deadline:request_data.deadline,
                status:"pending",
            } ;
            
            const selectQuery = `insert into tbl_tasks set ?`
            await database.query(selectQuery, [data]);
            return {
                code: response_code.SUCCESS,
                message: "Task created successfully",
                data: data
            };

        } catch (error) {
            return {
                code: response_code.OPERATION_FAILED,
                message: t('some_error_occurred'),
                data: error.message
            };
        }
}

    async showAllTasks(request_data, user_id) {
        try {
            const getTasks = `SELECT * FROM tbl_tasks WHERE user_id=? and  is_active = 1 AND is_deleted = 0`;
            const [tasks] = await database.query(getTasks,[user_id]);
    
            if (tasks.length === 0) {
                return {
                    code: response_code.NOT_FOUND,
                    message: t('no_tasks_found')
                };
            }
    
            return {
                code: response_code.SUCCESS,
                message: t('taska_listed_successfully'),
                data: tasks
            };
    
        } catch (error) {
            return {
                code: response_code.OPERATION_FAILED,
                message: t('some_error_occurred'),
                data: error.message
            };
        }
    }

    async manageTimer(request_data,user_id){
        try{
            const {task_id , action,notes} = request_data;
            if(!task_id) {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('task_id_required')
                };
            }
            if(!action || !['start', 'pause', 'submit'].includes(action)) {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('action_required')
                };
            }
    
            const [task] = await database.query(`SELECT * FROM tbl_tasks WHERE task_id = ? and user_id=?`, [task_id,user_id]);
            if (!task || task.length === 0) {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('task_not_found')
                };
            }

            // if(task[0].status == 'completed' && (action == 'start' || action == 'pause'|| (action == 'submit'))) {
            //     return {
            //         code: response_code.OPERATION_FAILED,
            //         message: t('task_already_completed')
            //     };
            // }

            if(action === 'pause' || action === 'submit') {
                const checkActive = `SELECT * FROM tbl_timers WHERE task_id=? AND status='inprogress' ORDER BY timer_id DESC LIMIT 1`;
                const [activeTimer] = await database.query(checkActive, [task_id]);
                
                if (activeTimer.length === 0) {
                    return {
                        code: response_code.BAD_REQUEST,
                        message: t('please_start_the_task_first')
                    };
                }
            }
    
            if(action==="start"){

                const checkTimer = `SELECT tm.* 
                                    FROM tbl_timers tm
                                    JOIN tbl_tasks t ON tm.task_id = t.task_id
                                    WHERE t.user_id = ? AND t.status = 'inprogress'
                                    LIMIT 1`
                const [runningTimers] = await database.query(checkTimer, [user_id]);
                if (runningTimers.length > 0) {
                    const runningTaskId = runningTimers[0].task_id;
                
                
                if (runningTaskId != task_id) {
                    
                        const getTaskName = `SELECT title FROM tbl_tasks WHERE task_id = ?`;
                        const [taskInfo] = await database.query(getTaskName, [runningTaskId]);
                        
                        const taskName = taskInfo.length > 0 ? taskInfo[0].title : `Task #${runningTaskId}`;
                        
                        return {
                            code: response_code.BAD_REQUEST,
                            message: t('another_timer_running', { taskName: taskName }),
                            data: {
                                running_task_id: runningTaskId
                            }
                        };
                    }
                    const updateOldTimer = `UPDATE tbl_timers SET end_time = NOW(), status = 'pending' WHERE timer_id = ?`;
                    await database.query(updateOldTimer, [runningTimers[0].timer_id]);
                }

                const updateTask = `insert into tbl_timers(task_id,status,start_time) values (?,"inprogress",now())`;
                const [result]=await database.query(updateTask, [task_id]);
                
                const updateTask1 = `update tbl_tasks set status='inprogress' where task_id=?`;
                await database.query(updateTask1, [task_id]);
                
    
                return{
                    code: response_code.SUCCESS,
                    message: t('timer_started_successfully'),
                    data:{
                        timer_id:result.insertId,
                        start_time: new Date()
                    }
                };
            }
            else if(action === 'pause') {
                const getTimer = `select * from tbl_timers where task_id=? and status='inprogress' order by timer_id desc limit 1`;
                const [timer] = await database.query(getTimer, [task_id]);
                  if (!timer || timer.length === 0) {
                    return {
                         code: response_code.OPERATION_FAILED,
                         message: t('timer_not_found')
                    };
                  }
                const updateTask = `update tbl_timers set end_time = now(),status='pending' where timer_id=?`;
                await database.query(updateTask, [timer[0].timer_id]);
                return {
                    code: response_code.SUCCESS,
                    message: t('timer_paused_successfully'),
                    data: {
                        timer_id: timer[0].timer_id,
                        end_time: new Date()
                    }
                };
            }else if(action === 'submit') {
               const getTimer = `select * from tbl_timers where task_id=? and status='inprogress' order by  timer_id desc limit 1`;
               const [timer] = await database.query(getTimer, [task_id]);
               
               if(timer.length>0){
                    const updateTask = `update tbl_timers set end_time = now(),status='completed' where timer_id=?`;
                    await database.query(updateTask, [timer[0].timer_id]);
               }
               try{
                    if(notes!==null){
                        console.log("Adding note to task:", notes);
                        const updateTaskNote = `update tbl_tasks set status='completed', notes=? where task_id=?`;
                        await database.query(updateTaskNote, [notes, task_id]);
                }else {
                    const updateTask1 = `update tbl_tasks set status='completed' where task_id=?`;
                    await database.query(updateTask1, [task_id]);
                    }
               }catch(error){
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('some_error_occurred'),
                        data: error.message
                    };
               }
               
    
               const getTotalTime = 
                `SELECT 
                        SUM(TIMESTAMPDIFF(SECOND, start_time, COALESCE(end_time, NOW()))) as total_seconds
                    FROM tbl_timers 
                    WHERE task_id = ?`;
                const [totalTime] = await database.query(getTotalTime, [task_id]);
                return {
                    code: response_code.SUCCESS,
                    message: t('timer_submitted_successfully'),
                    data: {
                        task_id: task_id,
                        total_time_seconds: totalTime[0].total_seconds || 0
                    }
                };  
            }
        }catch(error){
            return {
                code: response_code.OPERATION_FAILED,
                message: t('some_error_occurred'),
                data: error.message
            };
        }
    }


    async delete(request_data, user_id) {
        try {
            console.log(user_id);
            const queries = [
                `UPDATE tbl_user SET is_deleted = 1, is_active = 0, is_login = 0 WHERE user_id =${user_id}`,
            ];

            for (const query of queries) {
                await database.query(query, [user_id]);
            }

            return {
                code: response_code.SUCCESS,
                message: "ACCOUNT DELETED SUCCESSFULLY"
            };

        } catch (error) {
            console.log(user_id);
            console.log(error);
            return {
                code: response_code.OPERATION_FAILED,
                message: error
            };
        }
    }



}
module.exports = new UserModel();
