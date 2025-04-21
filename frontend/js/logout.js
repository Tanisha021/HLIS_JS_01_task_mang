document.addEventListener("DOMContentLoaded", function () {
    const userData = JSON.parse(localStorage.getItem("user"));
    const user_token = userData.user_token;
    console.log(user_token);
    if(!user_token){
        window.location.href = "login.html";
        return;
    }
    const logoutBtn = document.getElementById("logoutBtn");
    let messageElement = document.createElement("p");
    messageElement.className = "mt-4 text-center";

    logoutBtn.addEventListener("click", async function () {
        messageElement.textContent = "Logging out...";
        messageElement.style.color = "blue";
        document.body.appendChild(messageElement);

        const myHeaders = new Headers();
        myHeaders.append("authorization_token", user_token);
        myHeaders.append("api-key", "zc4rHsogD05CxVWaDP07vw=");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: "",
        };

        try {
            const response = await fetch("http://localhost:3000/v1/user/logout", requestOptions);
            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = "Logout successful!";
                messageElement.style.color = "green";
                localStorage.removeItem("user");

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            } else {
                messageElement.textContent = result.message || "Logout failed. Try again.";
                messageElement.style.color = "red";
            }
        } catch (error) {
            console.error("Error:", error);
            messageElement.textContent = "Network error. Please try again.";
            messageElement.style.color = "red";
        }
    });
});
