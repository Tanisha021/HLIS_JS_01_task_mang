async function createTask(event){
    const userData = JSON.parse(localStorage.getItem("user"));
    const user_token = userData.user_token;
    console.log(user_token);
    if(!user_token){
        window.location.href = "login.html";
        return;
    }
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const deadline = document.getElementById("deadline").value.trim();

    const data = {
        title,
        description,
        deadline
      };

    const myHeaders = new Headers();
    myHeaders.append("api-key", "zc4rHsogD05CxVWaDP07vw=");
    myHeaders.append("authorization_token", user_token);
    myHeaders.append("Accept-Language", "en");
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: "follow"
      };

      try {
        const response = await fetch("http://localhost:3000/v1/user/create-task", requestOptions);
        const result = await response.json();
    
        if (response.ok && result.code === 200) {
          alert("Task created successfully!");
          // setTimeout(()=>{
            window.location.href = "index.html";
          // },1000)
        } else {
          alert(result.message || "Failed to create task.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong.");
      }
}

// window.addEventListener("DOMContentLoaded",createTask);  see here i am calling the event listener just on page load due which altert
//is coming before the form submission

window.addEventListener("DOMContentLoaded",function(){
  const form = document.getElementById("taskForm");
  if(form){
    form.addEventListener("submit", createTask);
  }

})