document.addEventListener("DOMContentLoaded", function () {

    let taskTimers = {};
    try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const user_token = userData.user_token;

        if (!user_token) {
            window.location.href = "login.html";
            return;
        }

        loadTimerStates();

        setTimeout(() => {
            document.querySelectorAll('[id^="start-"]').forEach(button => {
                const task_id = button.id.split('-')[1];
                button.addEventListener("click", function () {
                    startTimer(task_id);
                    sendTimerAction(task_id, "start");
                });
            });

            document.querySelectorAll('[id^="pause-"]').forEach(button => {
                const task_id = button.id.split('-')[1];
                button.addEventListener("click", function () {
                    pauseTimer(task_id);
                    sendTimerAction(task_id, "pause");
                });
            });
            document.querySelectorAll('[id^="submit-"]').forEach(button => {
                const task_id = button.id.split('-')[1].trim();
                button.addEventListener("click", function () {
                    showNote(task_id);
                });
            });
            disableCompletedTaskButtons();
        }, 1000);

        function startTimer(task_id) {
            if (taskTimers[task_id]) {
                clearInterval(taskTimers[task_id].interval);
            }
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

            const timerElement = document.getElementById(`timer-${task_id}`);
            if (timerElement) {
                timerElement.textContent = formatTime(timerStates[task_id].hours, timerStates[task_id].minutes, timerStates[task_id].seconds);
                timerElement.classList.add("font-bold", "text-blue-600");
            }
            taskTimers[task_id] = {
                interval: setInterval(() => {

                    const currentState = JSON.parse(localStorage.getItem("timerState")) || {};
                    const taskState = currentState[task_id];

                    if (taskState && taskState.isRunning) {
                        taskState.seconds++;

                        if (taskState.seconds >= 60) {
                            taskState.seconds = 0;
                            taskState.minutes++;

                            if (taskState.minutes >= 60) {
                                taskState.minutes = 0;
                                taskState.hours++;
                            }
                        }

                        currentState[task_id] = taskState;
                        localStorage.setItem("timerState", JSON.stringify(currentState));

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

            for (const task_id in completedTimers) {
                if (completedTimers[task_id].status === "completed") {
                    const timerElement = document.getElementById(`timer-${task_id}`);
                    if (timerElement) {
                        timerElement.textContent = `Task completed! Total time: ${completedTimers[task_id].formattedTime}`;
                        timerElement.classList.add("font-bold", "text-green-600");
                    }
                }
            }

            for (const task_id in timerStates) {
                if (timerStates[task_id].isRunning) {
                    startTimer(task_id);
                } else {
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

        function sendTimerAction(task_id, action, notes = null) {
            const myHeaders = new Headers();
            myHeaders.append("api-key", "zc4rHsogD05CxVWaDP07vw=");
            myHeaders.append("authorization_token", user_token);
            myHeaders.append("Accept-Language", "en");
            myHeaders.append("Content-Type", "application/json");

            const requestData = {
                "task_id": task_id,
                "action": action
            };

            if (notes !== null) {
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
                    if (result) {
                        console.log(`Task ${task_id} ${action} action successful`);

                        if (action === "submit" && result.data && result.data.total_time_seconds) {
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

                            const formattedTime = formatTotalTime(result.data.total_time_seconds);

                            saveTimerState(task_id, "completed", formattedTime);

                            const timerElement = document.getElementById(`timer-${task_id}`);
                            if (timerElement) {
                                timerElement.textContent = `Task completed! Total time: ${formattedTime}`;
                                timerElement.classList.add("font-bold", "text-green-600");
                            }
                            disableTaskButtons(task_id);

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
function disableTaskButtons(task_id) {
    const startButton = document.getElementById(`start-${task_id}`);
    const pauseButton = document.getElementById(`pause-${task_id}`);
    const submitButton = document.getElementById(`submit-${task_id}`);

    if (startButton) {
        startButton.disabled = true;
        startButton.classList.remove('bg-green-500');
        startButton.classList.add('bg-gray-400', 'cursor-not-allowed');
    }

    if (pauseButton) {
        pauseButton.disabled = true;
        pauseButton.classList.remove('bg-yellow-500');
        pauseButton.classList.add('bg-gray-400', 'cursor-not-allowed');
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.remove('bg-green-800');
        submitButton.classList.add('bg-gray-400', 'cursor-not-allowed');
    }
}
function disableCompletedTaskButtons() {
    const completedTimers = JSON.parse(localStorage.getItem("timerStates")) || {};

    for (const task_id in completedTimers) {
        if (completedTimers[task_id].status === "completed") {
            disableTaskButtons(task_id);
        }
    }
}
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