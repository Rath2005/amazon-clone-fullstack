function addCart(){

    let message = "Product successfully added 🛒";

    alert(message);
}

function logout(){

    let confirmLogout = confirm("Are you sure you want to logout?");

    if(confirmLogout){

        localStorage.removeItem("amazonUser");

        window.location.href = "login.html";
    }
}