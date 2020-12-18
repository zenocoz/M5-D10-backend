//Tools and Middleware
const express = require("express")
const { join } = require("path")
const uniquid = require("uniqid")
const { readDB, writeDB } = require("../../lib/utilities")
const { check, validationResult } = require("express-validator")

//Middleware Instances
const router = express.Router()

//Paths
const mediaFilesPath = join(__dirname, "media.json")

router.get("/", async (req, res, next) => {})
router.post("/", async (req, res, next) => {})
router.put("/", async (req, res, next) => {})
router.delete("/", async (req, res, next) => {})

//media image
router.post("/:id/upload", async (req, res, next) => {})

module.exports = router
