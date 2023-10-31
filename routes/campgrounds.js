const express = require('express');
/* We don't need { mergeParams: true } here,
because all the "/:id"s already here in this file or route
They are not passing/coming form the parent! */
const router = express.Router();

// MVC Controllers
const campgrounds = require('../controllers/campgrounds');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// This will help parsing the "enctype="multipart/form-data"" for image uploading part
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

router.route('/')
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
    .post(upload.array('image'), (req, res) => {
        console.log(req.body, req.files);
        res.send("IT WORKED")
    })

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEdit));

module.exports = router;