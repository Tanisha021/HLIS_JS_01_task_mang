document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    let messageElement = document.createElement("p");
    messageElement.className = "mt-4 text-center";

    loginBtn.addEventListener("click", async function () {
        const email_id = document.getElementById("email_id").value.trim();
        const password_ = document.getElementById("password_").value.trim();
        messageElement.textContent = "";


        if (!email_id || !password_) {
            messageElement.textContent = "All fields are required!";
            messageElement.style.color = "red";
            document.body.appendChild(messageElement);
            return;
        }

        if (password_.length < 8) {
            messageElement.textContent = "Password must be at least 8 characters long!";
            messageElement.style.color = "red";
            document.body.appendChild(messageElement);
            return;
        }

        const myHeaders = new Headers();
        myHeaders.append("api-key", "zc4rHsogD05CxVWaDP07vw=");
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({ email_id, password_ });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw
        };

        messageElement.textContent = "Processing...";
        messageElement.style.color = "blue";

        try {
            const response = await fetch("http://localhost:3000/v1/user/login", requestOptions);
            const result = await response.json();
            console.log("===========")
            console.log(result);
            if (response.ok) {
                const userToken = result.data
                console.log("--------------")
                console.log(userToken);
                localStorage.setItem("user", JSON.stringify({
                    email_id: email_id,
                    user_token: userToken
                }));
                messageElement.textContent = "Login successful!";
                messageElement.style.color = "green";

                window.location.href = "index.html"; 
            } else {
                messageElement.textContent = result.message || "Login failed. Try again.";
                messageElement.style.color = "red";
            }
        } catch (error) {
            console.error("Error:", error);
            messageElement.textContent = "Network error. Please try again.";
            messageElement.style.color = "red";
        }
    });
});