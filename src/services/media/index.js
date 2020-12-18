//Tools and Middleware
const express = require("express")
const { join } = require("path")
const uniqid = require("uniqid")
const { readDB, writeDB } = require("../../lib/utilities")
const { check, validationResult, matchedData } = require("express-validator")

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
      res.status(204).send(`medium with imdbID ${req.params.id} deleted`)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//reviews
//Add a review
router.post(
  "/:id/reviews",
  [
    check("review").exists().withMessage("Review not existing"),
    check("rate")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating should be between 1-5"),
    check("imdbId").exists().withMessage("Medium Id not entered"),
  ],
  async (req, res, next) => {
    try {
      const mediaDB = await readDB(mediaFilesPath)
      const mediumIndex = mediaDB.findIndex(
        (medium) => medium.imdbID === req.params.id
      )

      if (mediumIndex !== -1) {
        const newReview = {
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        }

        if (!mediaDB[mediumIndex].hasOwnProperty("reviews")) {
          mediaDB[mediumIndex].reviews = []
          mediaDB[mediumIndex].reviews.push(newReview)
        } else {
          mediaDB[mediumIndex].reviews.push(newReview)
        }
        await writeDB(mediaFilesPath, mediaDB)
        res.status(201).send({ "review created with Id:": newReview._id })
      } else {
        const err = new Error("movid Imdb not found")
        err.httpStatusCode = 404
        next(err)
      }
    } catch (error) {
      next(error)
    }
  }
)

//Get all the reviews for the medium
router.get("/:id/reviews", async (req, res, next) => {
  try {
    const mediaDB = await readDB(mediaFilesPath)
    const mediumIndex = mediaDB.findIndex(
      (medium) => medium.imdbID === req.params.id
    )
    if (mediumIndex !== -1) {
      if (
        !mediaDB[mediumIndex].hasOwnProperty("reviews") ||
        mediaDB[mediumIndex].reviews.length === 0
      ) {
        const err = new Error("there are no reviews for this medium")
        err.httpStatusCode = 404
        next(err)
      } else {
        res.status(201).send(mediaDB[mediumIndex].reviews)
      }
    } else {
      const err = new Error("medium imdbId not found")
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    next(error)
  }
})

//modify review
router.put(
  "/:id/reviews/:reviewId",
  [
    check("review").exists().withMessage("Review not existing"),
    check("rate")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating should be between 1-5"),
    check("imdbId").exists().withMessage("Medium Id not entered"),
  ],
  async (req, res, next) => {
    try {
      const validateData = matchedData(req)
      const mediaDB = await readDB(mediaFilesPath)
      const medium = mediaDB.find((medium) => medium.imdbID === req.params.id)
      if (medium.hasOwnProperty("reviews")) {
        const reviewIndex = medium.reviews.findIndex(
          (review) => review._id === req.params.reviewId
        )
        if (reviewIndex !== -1) {
          medium.reviews = [
            ...medium.reviews.slice(0, reviewIndex),
            {
              ...medium.reviews[reviewIndex],
              ...validateData,
              modifiedAt: new Date(),
            },
            ...medium.reviews.slice(reviewIndex + 1),
          ]
          await writeDB(mediaFilesPath, mediaDB)
          res
            .status(203)
            .send({ "modified review with the following data": validateData })
        }
      } else {
        const err = new Error("medium not found")
        err.httpStatusCode = 404
        next(err)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

// //delete single review
router.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const mediaDB = await readDB(mediaFilesPath)
    const medium = mediaDB.find((medium) => medium.imdbID === req.params.id)
    if (medium && medium.hasOwnProperty("reviews")) {
      const foundReview = medium.reviews.find(
        (review) => review._id === req.params.reviewId
      )
      if (foundReview) {
        medium.reviews = medium.reviews.filter(
          (review) => review._id !== req.params.reviewId
        )
        await writeDB(mediaFilesPath, mediaDB)
        res.status(204) //TODO check why not get a response
      } else {
        const error = new Error("review not found")
        error.httpStatusCode = 404
        next(error)
      }
    } else {
      const error = new Error("medium or medium property not found")
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
