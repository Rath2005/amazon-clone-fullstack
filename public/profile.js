const user =
JSON.parse(
localStorage.getItem("amazonUser")
);

if(!user){
    window.location.href="login.html";
}

document.getElementById(
"profile-info"
).innerHTML = `

<p><strong>Name:</strong>
${user.username}</p>

<p><strong>Email:</strong>
${user.email}</p>

<p><strong>Role:</strong>
${user.isAdmin ? "Admin" : "Customer"}
</p>

`;

// ===== Statistics =====

async function loadProfileStats() {

    try {

        // Orders count
        const ordersRes = await fetch("/api/orders", {
            headers: {
                Authorization:
                `Bearer ${localStorage.getItem("amazonToken")}`
            }
        });

        const ordersData =
        await ordersRes.json();

        document.getElementById(
            "orders-count"
        ).textContent =
        ordersData.orders
        ? ordersData.orders.length
        : 0;

    } catch {
        document.getElementById(
            "orders-count"
        ).textContent = 0;
    }

    try {

        // Wishlist count
        const wishlistRes =
        await fetch("/api/wishlist");

        const wishlistData =
        await wishlistRes.json();

        document.getElementById(
            "wishlist-count"
        ).textContent =
        wishlistData.products
        ? wishlistData.products.length
        : 0;

    } catch {
        document.getElementById(
            "wishlist-count"
        ).textContent = 0;
    }

    try {

        // Cart count
        const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

        document.getElementById(
            "cart-count-profile"
        ).textContent =
        cart.length;

    } catch {
        document.getElementById(
            "cart-count-profile"
        ).textContent = 0;
    }
}

loadProfileStats();

document
.getElementById("edit-name")
.value = user.username;

document
.getElementById("edit-email")
.value = user.email;

document
.getElementById("profile-form")
.addEventListener(
"submit",
async function(e){

    e.preventDefault();

    const username =
    document.getElementById(
      "edit-name"
    ).value;

    const email =
    document.getElementById(
      "edit-email"
    ).value;

    const response =
    await fetch(
      "/api/auth/profile",
      {
        method:"PUT",
        headers:{
          "Content-Type":
          "application/json",

          "Authorization":
          `Bearer ${
            localStorage.getItem(
              "amazonToken"
            )
          }`
        },

        body:JSON.stringify({
          username,
          email
        })
      }
    );

    const data =
    await response.json();

    if(data.success){

      localStorage.setItem(
        "amazonUser",
        JSON.stringify(data.user)
      );

      alert(
        "Profile Updated Successfully"
      );

      location.reload();
    }
});

document
.getElementById("password-form")
.addEventListener(
"submit",
async function(e){

    e.preventDefault();

    const currentPassword =
    document.getElementById(
      "current-password"
    ).value;

    const newPassword =
    document.getElementById(
      "new-password"
    ).value;

    const confirmPassword =
    document.getElementById(
      "confirm-password"
    ).value;

    if(
      newPassword !==
      confirmPassword
    ){
        alert(
          "Passwords do not match"
        );
        return;
    }

    const response =
    await fetch(
      "/api/auth/password",
      {
        method:"PUT",
        headers:{
          "Content-Type":
          "application/json",

          "Authorization":
          `Bearer ${
            localStorage.getItem(
              "amazonToken"
            )
          }`
        },

        body:JSON.stringify({
          currentPassword,
          newPassword
        })
      }
    );

    const data =
    await response.json();

    if(data.success){

      alert(
        "Password Updated Successfully"
      );

      document
      .getElementById(
        "password-form"
      )
      .reset();

    }else{

      alert(
        data.message
      );

    }

});