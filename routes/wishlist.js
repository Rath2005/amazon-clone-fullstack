const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const wishlistFile = path.join(__dirname, "../data/wishlist.json");

// Get wishlist
router.get("/", (req, res) => {
    const wishlist = JSON.parse(
        fs.readFileSync(wishlistFile, "utf8")
    );

    res.json({
        success: true,
        wishlist
    });
});

// Add product to wishlist
router.post("/", (req, res) => {
    const product = req.body;

    let wishlist = JSON.parse(
        fs.readFileSync(wishlistFile, "utf8")
    );

    const exists = wishlist.find(
        p => p._id === product._id
    );

    if (!exists) {
        wishlist.push(product);

        fs.writeFileSync(
            wishlistFile,
            JSON.stringify(wishlist, null, 2)
        );
    }

    res.json({
        success: true,
        message: "Added to wishlist"
    });
});

// Remove product
router.delete("/:id", (req, res) => {
    let wishlist = JSON.parse(
        fs.readFileSync(wishlistFile, "utf8")
    );

    wishlist = wishlist.filter(
        p => p._id !== req.params.id
    );

    fs.writeFileSync(
        wishlistFile,
        JSON.stringify(wishlist, null, 2)
    );

    res.json({
        success: true
    });
});

module.exports = router;