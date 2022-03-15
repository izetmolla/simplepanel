const express = require("express")

const app = express()


app.get("/", (req, res) => {
    return res.json({
        hello: 1
    })
})


app.listen(8083)