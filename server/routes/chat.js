const express = require('express')
const router = express.Router()
const { chat } = require('../controllers/chat.js')

router.post('/', chat)

module.exports = router