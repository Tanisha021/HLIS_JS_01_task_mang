async function fetchTask(){

    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    try{
                const userData = JSON.parse(localStorage.getItem("user"));
                const user_token = userData.user_token;
                console.log(user_token);
                if(!user_token){
                    window.location.href = "login.html";
                    return;
                }

                const myHeaders = new Headers();
                myHeaders.append("api-key", "zc4rHsogD05CxVWaDP07vw=");
                myHeaders.append("authorization_token", user_token);
                myHeaders.append("Accept-Language", "en");

                const requestOptions = {
                method: "POST",
                headers: myHeaders,
                redirect: "follow"
                };

                const response =await fetch("http://localhost:3000/v1/user/show-all-tasks", requestOptions)
                const result = await response.json();
                console.log("result",result);

                if (result.data && Array.isArray(result.data)) {
                    result.data.forEach(task => {
                        const taskElement = document.createElement("div");
                        taskElement.className = "bg-white p-4 rounded shadow";
                        taskElement.innerHTML = `
                            <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-semibold">${task.title || 'Untitled Task'}</h3>
                                <div class="flex justify-end items-center mb-2">
                                    <span class="text-gray-500">${task.deadline || 'No deadline'}</span>
                                    <span class="mx-2 text-gray-500">|</span>
                                    <span class="text-gray-500">${task.status}</span>
                                </div>
                            </div>
                            <p class="text-gray-600">${task.description || 'No description'}</p>
                            <div class="mt-2 flex gap-2">
                               <button class="start-timer px-3 py-1 bg-green-500 text-white rounded" id="start-${task.task_id}">Start</button>
                                <button class="pause-timer px-3 py-1 bg-yellow-500 text-white rounded" id="pause-${task.task_id}">Pause</button>
                                <button class="submit-timer px-3 py-1 bg-green-800 text-white rounded" id="submit-  ${task.task_id}">submit</button>
                                <span id="timer-${task.task_id}" class="ml-4 text-sm text-gray-600"></span>
                            </div>
                        `;
                        taskList.appendChild(taskElement);
                        try {
                            const timerStates = JSON.parse(localStorage.getItem("timerStates")) || {};
                            const taskTimerState = timerStates[task.task_id];
                            
                            if (taskTimerState && taskTimerState.status === "completed") {
                                const timerElement = document.getElementById(`timer-${task.task_id}`);
                                if (timerElement) {
                                    timerElement.textContent = `Task completed! Total time: ${taskTimerState.formattedTime}`;
                                    timerElement.classList.add("font-bold", "text-green-600");
                                }
                            }
                        } catch (error) {
                            console.error("Error restoring timer state:", error);
                        }
                    });
                } else {
                    taskList.innerHTML = '<p class="text-center text-gray-500">No tasks found</p>';
                }
            }catch(error){
                console.error("Error:", error);
                return;
            }
}


window.addEventListener("DOMContentLoaded", fetchTask);

