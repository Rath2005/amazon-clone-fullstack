async function loadWishlist() {

    const response =
        await fetch("/api/wishlist");

    const data =
        await response.json();

    const container =
        document.getElementById(
            "wishlist-container"
        );

    if (data.wishlist.length === 0) {

        container.innerHTML =
            "<h2>No wishlist items</h2>";

        return;
    }

    container.innerHTML =
        data.wishlist.map(product => `
        <div class="product-card">

            <img src="${product.image}"
                 alt="${product.name}">

            <h3>${product.name}</h3>

            <p>₹${product.price}</p>

            <button
            onclick="removeWishlist('${product._id}')">
            Remove
            </button>

        </div>
    `).join("");
}

async function removeWishlist(id) {

    await fetch(
        `/api/wishlist/${id}`,
        {
            method: "DELETE"
        }
    );

    loadWishlist();
}

loadWishlist();