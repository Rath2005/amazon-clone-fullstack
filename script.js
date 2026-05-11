function addCart(){
  alert("Item Added to Cart");
}
function logout(){

    localStorage.removeItem("user");

    window.location.href = "login.html";
}