const express = require("express");
const bodyParser = require("body-parser");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");
const favoriteRouter = express.Router();

const User = require("../models/user");

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favoriteDoc) => {
        res.statusCode = 200;
        res.setHeader("Content-type", "application/json");
        res.json(favoriteDoc);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favoriteDoc) => {
        if (favoriteDoc) {
          req.body.forEach((campsiteId) => {
            if (!favoriteDoc.campsites.includes(campsiteId)) {
              favoriteDoc.campsites.push(campsiteId);
            }
          });
          favoriteDoc
            .save()
            .then((favoriteDoc) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favoriteDoc);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body }).then(
            (favoriteDoc) => {
              favoriteDoc
                .save()
                .then((favoriteDoc) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favoriteDoc);
                })
                .catch((err) => next(err));
            }
          );
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favoriteDoc) => {
      if (favoriteDoc) {
        favoriteDoc
          .remove()
          .then(() => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.send("Successfully deleted the favorite.");
          })
          .catch((err) => next(err));
      }
    });
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.favoriteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id })
      .then((favoriteDoc) => {
        if (favoriteDoc) {
          if (favoriteDoc.campsites.includes(req.params.campsiteId)) {
            res.send("This campsite is already a favorite!");
          } else {
            favoriteDoc.campsites.push(req.params.campsiteId);
            favoriteDoc
              .save()
              .then((favoriteDoc) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favoriteDoc);
              })
              .catch((err) => next(err));
          }
        } else {
          Favorite.create({
            user: req.user._id,
            campsites: [req.params.campsiteId],
          })
            .then((favoriteDoc) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favoriteDoc);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favoriteDoc) => {
        favoriteDoc.campsites = favoriteDoc.campsites.filter(
          (item) => !item.equals(req.params.campsiteId)
        );
        favoriteDoc
          .save()
          .then((favoriteDoc) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favoriteDoc);
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
