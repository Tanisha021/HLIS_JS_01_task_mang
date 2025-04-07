document.addEventListener("DOMContentLoaded", function(){
    // Object to track timers for different tasks
    let taskTimers = {};
    
    try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const user_token = userData.user_token;
        
        if(!user_token){
            window.location.href = "login.html";
            return;
        }

        loadTimerStates();

        setTimeout(() => {
            document.querySelectorAll('[id^="start-"]').forEach(button => {
                const task_id = button.id.split('-')[1];
                button.addEventListener("click", function() {
                    startTimer(task_id);
                    sendTimerAction(task_id, "start");
                });
            });
            
            document.querySelectorAll('[id^="pause-"]').forEach(button => {
                const task_id = button.id.split('-')[1];
                button.addEventListener("click", function() {
                    pauseTimer(task_id);
                    sendTimerAction(task_id, "pause");
                });
            });
            
            document.querySelectorAll('[id^="submit-"]').forEach(button => {
                const task_id = button.id.split('-')[1].trim();
                button.addEventListener("click", function() {
                    showNote(task_id);
                });
            });
        }, 1000); 

        function startTimer(task_id) {
            // Stop the timer if it's already running
            if (taskTimers[task_id]) {
                clearInterval(taskTimers[task_id].interval);
            }
            
            // Get timer state from localStorage or create new
            const timerStates = JSON.parse(localStorage.getItem("timerState")) || {};
            
            if (!timerStates[task_id]) {
                timerStates[task_id] = {
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isRunning: true
                };
            } else {
                timerStates[task_id].isRunning = true;
            }
            
            localStorage.setItem("timerState", JSON.stringify(timerStates));
            
            // Update display
            const timerElement = document.getElementById(`timer-${task_id}`);
            if (timerElement) {
                timerElement.textContent = formatTime(timerStates[task_id].hours, timerStates[task_id].minutes, timerStates[task_id].seconds);
                timerElement.classList.add("font-bold", "text-blue-600");
            }
            
            // Start the interval
            taskTimers[task_id] = {
                interval: setInterval(() => {
                    // Get current state
                    const currentState = JSON.parse(localStorage.getItem("timerState")) || {};
                    const taskState = currentState[task_id];
                    
                    if (taskState && taskState.isRunning) {
                        taskState.seconds++;
                        
                        // Handle minute and hour rollovers
                        if (taskState.seconds >= 60) {
                            taskState.seconds = 0;
                            taskState.minutes++;
                            
                            if (taskState.minutes >= 60) {
                                taskState.minutes = 0;
                                taskState.hours++;
                            }
                        }
                        
                        // Update localStorage
                        currentState[task_id] = taskState;
                        localStorage.setItem("timerState", JSON.stringify(currentState));
                        
                        // Update display
                        if (timerElement) {
                            timerElement.textContent = formatTime(taskState.hours, taskState.minutes, taskState.seconds);
                        }
                    }
                }, 1000)
            };
        }
        
        function pauseTimer(task_id) {
            if (taskTimers[task_id]) {
                clearInterval(taskTimers[task_id].interval);
                delete taskTimers[task_id];
                
                // Update isRunning state
                const timerStates = JSON.parse(localStorage.getItem("timerState")) || {};
                if (timerStates[task_id]) {
                    timerStates[task_id].isRunning = false;
                    localStorage.setItem("timerState", JSON.stringify(timerStates));
                }
            }
        }
        
        function formatTime(hours, minutes, seconds) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        
        function loadTimerStates() {
            const timerStates = JSON.parse(localStorage.getItem("timerState")) || {};
            const completedTimers = JSON.parse(localStorage.getItem("timerStates")) || {};
            
            // Check for completed tasks first
            for (const task_id in completedTimers) {
                if (completedTimers[task_id].status === "completed") {
                    const timerElement = document.getElementById(`timer-${task_id}`);
                    if (timerElement) {
                        timerElement.textContent = `Task completed! Total time: ${completedTimers[task_id].formattedTime}`;
                        timerElement.classList.add("font-bold", "text-green-600");
                    }
                }
            }
            
            // Restore running timers
            for (const task_id in timerStates) {
                if (timerStates[task_id].isRunning) {
                    startTimer(task_id);
                } else {
                    // Just update display for paused timers
                    const timerElement = document.getElementById(`timer-${task_id}`);
                    if (timerElement) {
                        timerElement.textContent = formatTime(
                            timerStates[task_id].hours,
                            timerStates[task_id].minutes,
                            timerStates[task_id].seconds
                        );
                        timerElement.classList.add("font-bold", "text-blue-600");
                    }
                }
            }
        }

        function showNote(task_id) {
            const timerStates = JSON.parse(localStorage.getItem("timerStates")) || {};
            if (timerStates[task_id] && timerStates[task_id].status === "completed") {
                alert('This task is already completed.');
                return;
            }
            
            // Pause the timer
            pauseTimer(task_id);
            
            Swal.fire({
                title: 'Add a note',
                input: 'textarea',
                inputPlaceholder: 'Enter your note for this task...',
                showCancelButton: false,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (notes) => {
                    return sendTimerAction(task_id, "submit", notes);
                }
            });
        }
        
        function sendTimerAction(task_id, action, notes=null) {
            const myHeaders = new Headers();
            myHeaders.append("api-key", "zc4rHsogD05CxVWaDP07vw=");
            myHeaders.append("authorization_token", user_token);
            myHeaders.append("Accept-Language", "en");
            myHeaders.append("Content-Type", "application/json");

            const requestData = {
                "task_id": task_id,
                "action": action
            };

            if(notes !== null){
                requestData.notes = notes;
            }

            const raw = JSON.stringify(requestData);

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            fetch("http://localhost:3000/v1/user/manage-timer", requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    if(result) {
                        console.log(`Task ${task_id} ${action} action successful`);
                        
                        if(action === "submit" && result.data && result.data.total_time_seconds) {
                            // Get current time state
                            const timerState = JSON.parse(localStorage.getItem("timerState")) || {};
                            
                            // Clean up this task from the running/paused timers
                            if (timerState[task_id]) {
                                delete timerState[task_id];
                                localStorage.setItem("timerState", JSON.stringify(timerState));
                            }
                            
                            // Clear any active intervals
                            if (taskTimers[task_id]) {
                                clearInterval(taskTimers[task_id].interval);
                                delete taskTimers[task_id];
                            }
                            
                            // Format time from API
                            const formattedTime = formatTotalTime(result.data.total_time_seconds);
                            
                            // Save as completed
                            saveTimerState(task_id, "completed", formattedTime);
                            
                            // Update display
                            const timerElement = document.getElementById(`timer-${task_id}`);
                            if (timerElement) {
                                timerElement.textContent = `Task completed! Total time: ${formattedTime}`;
                                timerElement.classList.add("font-bold", "text-green-600");
                            }
                            
                            // Show success message
                            Swal.fire({ 
                                title: 'Task Completed!',
                                text: `Total time: ${formattedTime}`,
                                icon: 'success',
                                confirmButtonText: 'Awesome!'
                            });
                        } else if (result.message) {
                            alert(result.message);
                        }
                    } else {
                        alert(result.message || "Operation failed");
                    }
                })
                .catch((error) => console.error(error));
        }
        
        function formatTotalTime(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
    } catch (error) {
        console.error("Error accessing user data:", error);
        window.location.href = "login.html";
    }
});

function saveTimerState(task_id, status, formattedTime) {
    try {
        const timerStates = JSON.parse(localStorage.getItem("timerStates")) || {};
        timerStates[task_id] = {
            status: status,
            formattedTime: formattedTime
        };
        localStorage.setItem("timerStates", JSON.stringify(timerStates));
    } catch (error) {
        console.error("Error saving timer state:", error);
    }
}