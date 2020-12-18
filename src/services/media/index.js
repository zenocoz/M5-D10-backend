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

router.get(
  "/",

  async (req, res, next) => {
    try {
      console.log("reached")
    } catch (error) {
      next(error)
    }
  }
)
router.post(
  "/",
  [
    check("Title")
      .exists()
      .withMessage("You need a title for your movie")
      .isLength({ min: 1 })
      .withMessage("Could be a one char movie like P"),
    check("Year").exists().withMessage("year of production not found"),
    check("imdbID").exists().withMessage("imdbID not found"),
    check("Type").exists().withMessage("Media type not found"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const mediaArray = await readDB(mediaFilesPath)
        const newMedia = {
          ...req.body,
          createdAt: new Date(),
        }
        mediaArray.push(newMedia)
        await writeDB(mediaFilesPath, mediaArray)
        res
          .status(201)
          .send({ "created new entry for imdbID": newMedia.imdbID })
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)
router.put("/", async (req, res, next) => {})
router.delete("/", async (req, res, next) => {})

//reviews

//media image
router.post("/:id/upload", async (req, res, next) => {})

module.exports = router
