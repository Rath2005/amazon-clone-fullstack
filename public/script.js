// Global State
// Authentication check

// Authentication check
let token = localStorage.getItem("amazonToken");

// Only protect pages other than login/register
const page = window.location.pathname;

if (
    !token &&
    !page.includes("login.html") &&
    !page.includes("register.html")
) {
    window.location.href = "/login.html";
}

let currentUser = null;
let cartItems = [];
let activeCategory = "All";
let searchKeyword = "";

let allProducts = [];

try {
  const userStr = localStorage.getItem("amazonUser");
  if (userStr) {
    currentUser = JSON.parse(userStr);
  }
} catch (e) {
  console.error("Error parsing user data", e);
}

// Authentication Check on startup
document.addEventListener("DOMContentLoaded", () => {
  // Update navbar user details
  updateUserNavbar();
  
  // Load initial products and cart
  fetchProducts();
  fetchCart();
});

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Update UI headers with user name
function updateUserNavbar() {
  const userGreet = document.getElementById("nav-user-greet");
  const logoutBtn = document.getElementById("logout-btn");
  const userLocation = document.getElementById("user-location");
  const accountDropdown = document.getElementById("account-dropdown");

  if (currentUser) {
    userGreet.textContent = `Hello, ${currentUser.username}`;
    logoutBtn.style.display = "flex";
    userLocation.textContent = currentUser.username;
    const adminLink = document.getElementById("admin-nav-link");
    if (adminLink) {
      adminLink.style.display = currentUser.isAdmin ? "flex" : "none";
    }
    if (accountDropdown) {
      accountDropdown.style.cursor = "default";
      accountDropdown.onclick = null;
    }
  } else {
    userGreet.textContent = "Hello, Sign in";
    logoutBtn.style.display = "none";
    userLocation.textContent = "Campus";
    if (accountDropdown) {
      accountDropdown.style.cursor = "pointer";
      accountDropdown.onclick = () => {
        window.location.href = "login.html";
      };
    }
  }
}

// Logout Handler
function handleLogout() {
  const confirmLogout = confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    localStorage.removeItem("amazonToken");
    localStorage.removeItem("amazonUser");
    window.location.href = "login.html";
  }
}

// Fetch products from server
async function fetchProducts() {
  const grid = document.getElementById("products-grid");
  const resultsCount = document.getElementById("results-count");
  
  grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">Loading products...</div>`;

  let url = `/api/products?category=${activeCategory}`;
  if (searchKeyword) {
    url += `&keyword=${encodeURIComponent(searchKeyword)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {

    allProducts = data.products;

    renderProducts(allProducts);
      if (searchKeyword) {
        resultsCount.textContent = `${data.products.length} results for "${searchKeyword}"`;
      } else {
        resultsCount.textContent = "";
      }
    } else {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-danger); padding: 40px;">Failed to load products.</div>`;
    }
  } catch (error) {
    console.error("Fetch products error:", error);
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-danger); padding: 40px;">Server connection error.</div>`;
  }
}

// Render products cards in grid
function renderProducts(products) {
  const grid = document.getElementById("products-grid");

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border: 1px solid var(--color-border); border-radius: var(--border-radius-md);">
        <h3 style="margin-bottom: 8px;">No results found</h3>
        <p style="color: var(--color-text-muted);">Try checking your spelling or search for another keyword.</p>
      </div>
    `;
    return;
  }

  let html = "";
  products.forEach(product => {
    // Determine stock notification details
    let stockHtml = "";
    if (product.stock === 0) {
      stockHtml = `<span class="product-stock stock-out">Out of Stock</span>`;
    } else if (product.stock <= 5) {
      stockHtml = `<span class="product-stock stock-low">Only ${product.stock} left in stock - order soon.</span>`;
    } else {
      stockHtml = `<span class="product-stock stock-in">In Stock</span>`;
    }

    // Build star rating
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    let starsHtml = "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);

    // Bestseller badge if rating is high
    const badgeHtml = product.rating >= 4.7 ? `<div class="product-badge">Top Pick</div>` : "";

    html += `
  <div class="product-card"
       onclick="window.location.href='product.html?id=${product._id}'">
        ${badgeHtml}
        <div class="product-image-wrapper">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <span class="product-category">${product.category}</span>
        <h3 class="product-name" title="${product.name}">${product.name}</h3>
        
        <div class="product-rating">
          <span class="stars" title="${product.rating} out of 5 stars">${starsHtml}</span>
          <span class="rating-count">${product.numReviews.toLocaleString()}</span>
        </div>

        <div class="product-price-row">
          <span class="price-symbol">₹</span>
          <span class="price-val">${product.price.toLocaleString('en-IN')}</span>
        </div>

        ${stockHtml}

        <button 
          class="add-to-cart-btn" 
          onclick="addProductToCart(this, '${product._id}')"
          ${product.stock === 0 ? "disabled" : ""}
        >
          ${product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
        <button class="wishlist-btn"
onclick="addToWishlist('${product._id}')">
❤️ Wishlist
</button>
      </div>
    `;
  });

  grid.innerHTML = html;
}

// Category selection
function filterByCategory(category) {
  activeCategory = category;
  
  // Update select dropdown
  const selectDropdown = document.getElementById("search-category");
  if (selectDropdown) {
    selectDropdown.value = category;
  }

  // Update tabs visual state
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    if (tab.id === `tab-${category}`) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Update section title
  const categoryTitle = document.getElementById("category-title");
  if (categoryTitle) {
    categoryTitle.textContent = category === "All" ? "Popular on Campus" : `${category} Essentials`;
  }

  // Load products
  fetchProducts();
}

// Search triggers
function handleSearchKeyUp(e) {
  if (e.key === "Enter") {
    executeSearch();
  }
}

function executeSearch() {
  const searchInput = document.getElementById("search-input");
  searchKeyword = searchInput.value.trim();
  
  // Perform search
  fetchProducts();
}

// Scroll page to products section
function scrollToProducts() {
  const element = document.getElementById("shop-now");
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Toggle Cart Drawer
function toggleCartDrawer(open) {
  const overlay = document.getElementById("cart-drawer-overlay");
  const drawer = document.getElementById("cart-drawer");
  
  if (open) {
    overlay.classList.add("open");
    drawer.classList.add("open");
    renderCartItems();
  } else {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
  }
}

// Fetch user's cart from API
async function fetchCart() {
  if (!token) return;

  try {
    const response = await fetch("/api/cart", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();

    if (data.success) {
      cartItems = data.cart;
      updateCartBadge();
    }
  } catch (error) {
    console.error("Fetch cart error:", error);
  }
}

// Update cart counter badge in navbar
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  badge.textContent = totalCount;
}

// Add item to cart API call
async function addProductToCart(button, productId) {
  // Stop event from bubbling to the card's onclick
  event.stopPropagation();

  if (!token) {
    showToast("Please sign in to add items.", "error");
    window.location.href = "login.html";
    return;
  }

  // Disable button to prevent double-clicks
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Adding...";

  try {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    const data = await response.json();

    if (data.success) {
      cartItems = data.cart;
      updateCartBadge();
      showToast("Added to cart! 🛒", "success");
      
      // Animate button success state
      button.classList.add("added");
      button.textContent = "Added ✔";
      
      setTimeout(() => {
        button.classList.remove("added");
        button.disabled = false;
        button.textContent = originalText;
      }, 1500);
    } else {
      showToast(data.message || "Failed to add product.", "error");
      button.disabled = false;
      button.textContent = originalText;
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    showToast("Error adding product to cart.", "error");
    button.disabled = false;
    button.textContent = originalText;
  }
}

// Render items list inside side cart drawer
function renderCartItems() {
  const listContainer = document.getElementById("cart-drawer-items");
  const subtotalVal = document.getElementById("cart-subtotal-val");
  const checkoutBtnLink = document.getElementById("checkout-btn-link");

  if (!listContainer) return;

  if (cartItems.length === 0) {
    listContainer.innerHTML = `<div class="empty-cart-message">Your Cart is empty.</div>`;
    subtotalVal.textContent = "₹0";
    if (checkoutBtnLink) {
      checkoutBtnLink.style.pointerEvents = "none";
      checkoutBtnLink.style.opacity = "0.5";
    }
    return;
  }

  if (checkoutBtnLink) {
    checkoutBtnLink.style.pointerEvents = "auto";
    checkoutBtnLink.style.opacity = "1";
  }

  let html = "";
  let subtotalPrice = 0;

  cartItems.forEach(item => {
    const product = item.product;
    if (!product) return;

    const itemTotal = product.price * item.quantity;
    subtotalPrice += itemTotal;

    html += `
      <div class="cart-item">
        <img src="${product.image}" class="cart-item-img" alt="${product.name}">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${product.name}</h4>
          <p class="cart-item-price">₹${product.price.toLocaleString('en-IN')}</p>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="adjustCartQty('${product._id}', ${item.quantity - 1})">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="adjustCartQty('${product._id}', ${item.quantity + 1})">+</button>
            <button class="remove-item-btn" onclick="removeCartItem('${product._id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;
  subtotalVal.textContent = `₹${subtotalPrice.toLocaleString('en-IN')}`;
}

// Edit item quantity in cart
async function adjustCartQty(productId, newQty) {
  if (newQty < 1) {
    // If quantity is adjusted below 1, we remove it
    removeCartItem(productId);
    return;
  }

  try {
    const response = await fetch("/api/cart/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: newQty })
    });
    const data = await response.json();

    if (data.success) {
      cartItems = data.cart;
      updateCartBadge();
      renderCartItems();
    } else {
      showToast(data.message || "Failed to adjust quantity.", "error");
    }
  } catch (error) {
    console.error("Cart adjustment error:", error);
    showToast("Error updating cart quantity.", "error");
  }
}

function logout() {
    localStorage.removeItem("amazonToken");
    localStorage.removeItem("amazonUser");
    window.location.href = "login.html";
}

// Remove item from cart
async function removeCartItem(productId) {
  try {
    const response = await fetch("/api/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    const data = await response.json();

    if (data.success) {
      cartItems = data.cart;
      updateCartBadge();
      renderCartItems();
      showToast("Item removed from cart.", "success");
    } else {
      showToast(data.message || "Failed to remove item.", "error");
    }
  } catch (error) {
    console.error("Cart item removal error:", error);
    showToast("Error removing item.", "error");
  }
}

function sortProducts(sortType){

    let sortedProducts =
    [...allProducts];

    if(sortType === "low-high"){

        sortedProducts.sort(
            (a,b)=>a.price-b.price
        );

    }

    else if(sortType === "high-low"){

        sortedProducts.sort(
            (a,b)=>b.price-a.price
        );

    }

    else if(sortType === "rating"){

        sortedProducts.sort(
            (a,b)=>b.rating-a.rating
        );

    }

    else if(sortType === "newest"){

        sortedProducts.sort(
            (a,b)=>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

    }

    renderProducts(
        sortedProducts
    );
}

async function addToWishlist(productId) {
    event.stopPropagation();
    try {

        const response = await fetch(
            `/api/products/${productId}`
        );

        const data = await response.json();

        if (!data.success) {
            alert("Product not found");
            return;
        }

        await fetch("/api/wishlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data.product)
        });

        showToast("Added to wishlist ❤️", "success");

    } catch (error) {
        console.error(error);
    }
}

function toggleDarkMode(){

    document.body.classList.toggle(
        "dark-mode"
    );

    const isDark =
    document.body.classList.contains(
        "dark-mode"
    );

    localStorage.setItem(
        "darkMode",
        isDark
    );
}

if(
localStorage.getItem(
"darkMode"
) === "true"
){
    document.body.classList.add(
        "dark-mode"
    );
}