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

router.get("/", async (req, res, next) => {
  try {
    const mediaDB = await readDB(mediaFilesPath)
    res.status(200).send(mediaDB)
  } catch (error) {
    console.log(error)
    next(error)
  }
})
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
        const mediaDB = await readDB(mediaFilesPath)
        const newMedia = {
          ...req.body,
          createdAt: new Date(),
        }
        mediaDB.push(newMedia)
        await writeDB(mediaFilesPath, mediaDB)
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
router.put(
  "/:id",
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
        let mediaDB = await readDB(mediaFilesPath)

        mediaDB = mediaDB.map((medium) =>
          medium.imdbID == req.params.id
            ? { ...req.body, modifiedAt: new Date() }
            : medium
        )
        // mediaDB = mediaDB.filter((media) => {
        //   console.log(media.imdbID, req.params.id)
        //   console.log(media)
        //   return media.imdbID !== req.params.id
        // })
        //console.log(mediaDB)

        // const modifiedMedium = { ...req.body, modifiedAt: new Date() }
        // newMediaDB.push(modifiedMedium)
        await writeDB(mediaFilesPath, mediaDB)
        res.status(203).send({ "modified media with imdbId:": req.params.id })
      }
    } catch (errors) {
      console.log(errors)
      next(errors)
    }
  }
)
router.delete("/:id", async (req, res, next) => {
  try {
    const mediaDB = await readDB(mediaFilesPath)
    const checkIdIsCorrect = mediaDB.find(
      (medium) => medium.imdbID === req.params.id
    )
    if (!checkIdIsCorrect) {
      const err = new Error()
      err.message = "Medium not found"
      err.httpStatusCode = 404
      next(err)
    } else {
      const newMediaDB = mediaDB.filter(
        (medium) => medium.imdbID !== req.params.id
      )
      await writeDB(mediaFilesPath, newMediaDB)
      res.status(204).send(`mediuma with imdbID ${req.params.id} deleted`)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//reviews

//media image
router.post("/:id/upload", async (req, res, next) => {})

module.exports = router
