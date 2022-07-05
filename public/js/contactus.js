const name = document.getElementById("name");
const email = document.getElementById("email");
const message = document.getElementById("message");

const btnSubmit = document.getElementById("btn-submit");

function contactUs() { 
    const name = name.value; 
    const email = email.value;
    const message = message.value;

    if (!name || !email || !message ) {
        return alert("you need to fill up all the forms.");
    }
    
    let user_data = {
        name: name,
        email: email,
        message: message 
    }

    let message_data_str = JSON.stringify(message_data);

    let clientsArr = JSON.parse(localStorage.getItem('message')) || [];


    clientsArr.push(message_data);

    localStorage.setItem("message", JSON.stringify(clientsArr));
    return alert("Email Sent!");

}




btnSubmit.addEventListener("click", submit);