const router = require("express").Router();

router.use('/failed-messages', require('./failed-messages-routes'));


router.get("/", (req, res) => {
    res.json({
        status: "This is the Shipments Service Failed Messages Monitoring 1.0.0",
    });
});

module.exports = router;
