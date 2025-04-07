document.addEventListener("DOMContentLoaded", function(){
    // const user_token = localStorage.getItem("authorization_token");
    //     if(!user_token){
    //         window.location.href = "login.html";
    //         return;
    //     }
        let task_timers = {};

    setTimeout(() => {
        // Select all task elements created by task.js
        const taskElements = document.querySelectorAll(".bg-white.p-4.rounded.shadow");
        
        taskElements.forEach((taskElement) => {
            // Find the task ID from the start button ID
            const startButton = taskElement.querySelector(".start-timer");
            if (!startButton) return;
            
            const task_id = startButton.id.split("-")[1];
            
            // Initialize timer object for this task
            task_timers[task_id] = {
                hr: 0,
                min: 0,
                sec: 0,
                millisec: 0,
                cron: null,
                start_time: null
            };
            
            // Get timer display elements
            const hr = document.getElementById(`hr-${task_id}`);
            const min = document.getElementById(`min-${task_id}`);
            const sec = document.getElementById(`sec-${task_id}`);
            
            // Get timer control buttons
            const start_btn = document.getElementById(`start-${task_id}`);
            const pause_btn = document.getElementById(`pause-${task_id}`);
            const submit_btn = document.getElementById(`submit-${task_id}`);
            
            // Format time with leading zeros
            function formatTime(input) {
                return input >= 10 ? input : `0${input}`;
            }
            
            // Timer function to update the display
            function updateTimer(task_id) {
                const time = task_timers[task_id];
                if ((time.millisec += 10) == 1000) {
                    time.millisec = 0;
                    time.sec++;
                }
                if (time.sec == 60) {
                    time.sec = 0;
                    time.min++;
                }
                if (time.min == 60) {
                    time.min = 0;
                    time.hr++;
                }
                
                hr.innerText = formatTime(time.hr);
                min.innerText = formatTime(time.min);
                sec.innerText = formatTime(time.sec);
            }
            
            // Add event listeners to buttons
            if (start_btn) {
                start_btn.addEventListener("click", function() {
                    // Clear any existing interval first
                    if (task_timers[task_id].cron) {
                        clearInterval(task_timers[task_id].cron);
                    }
                    
                    task_timers[task_id].start_time = Date.now();
                    task_timers[task_id].cron = setInterval(() => updateTimer(task_id), 10);
                });
            }
            
            if (pause_btn) {
                pause_btn.addEventListener("click", function() {
                    clearInterval(task_timers[task_id].cron);
                });
            }
            
            if (submit_btn) {
                submit_btn.addEventListener("click", function() {
                    clearInterval(task_timers[task_id].cron);
                    const end_time = Date.now();
                    const elapsed_seconds = (end_time - task_timers[task_id].start_time) / 1000;
                    console.log(`Task ${task_id} time: ${elapsed_seconds} seconds`);
                    
                    // You can add code here to send the time to your server
                    // For example using fetch:
                    /*
                    fetch('/api/submit-time', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            task_id: task_id,
                            elapsed_time: elapsed_seconds,
                            hr: task_timers[task_id].hr,
                            min: task_timers[task_id].min,
                            sec: task_timers[task_id].sec
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                    */
                });
            }
        });
    }, 1000); // Delay to ensure tasks are loaded
});