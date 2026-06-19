const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const reviewFile = path.join(
    __dirname,
    "../data/reviews.json"
);

// Get reviews for product
router.get("/:productId", (req, res) => {

    const reviews = JSON.parse(
        fs.readFileSync(reviewFile, "utf8")
    );

    const productReviews =
        reviews.filter(
            r => r.productId === req.params.productId
        );

    res.json({
        success: true,
        reviews: productReviews
    });
});

// Add review
router.post("/", (req, res) => {

    const {
        productId,
        username,
        rating,
        comment
    } = req.body;

    const reviews = JSON.parse(
        fs.readFileSync(reviewFile, "utf8")
    );

    reviews.push({
        id: Date.now().toString(),
        productId,
        username,
        rating,
        comment,
        createdAt: new Date()
    });

    fs.writeFileSync(
        reviewFile,
        JSON.stringify(reviews, null, 2)
    );

    res.json({
        success: true
    });
});

module.exports = router;