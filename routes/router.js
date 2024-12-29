const express = require('express');
const router = express.Router()
const upload = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const User = require('../models/UserFileUploader');

router.get("/", (req, res) => {
    let login = req.session.login
    if(login){
        let userID = req.session.user.id
        User.findById(userID).exec()
        .then((doc) => {
            res.render("index", {userID:userID, file:doc.files, login:login})
        })
    }
    else{
        res.redirect("/login")
    }
})

router.get("/login", (req, res) => {
    let login = req.session.login
    if(login){
        res.redirect("/")
    }
    else{
        res.render("login", {login:login})
    }
})

router.get("/register", (req, res) => {
    let login = req.session.login
    if(login){
        res.redirect("/")
    }
    else{
        res.render("register", {login:login})
    }
})

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        res.redirect("/")
    })
    
})

router.post('/upload/:userId', upload.single('file'), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const resource = await cloudinary.api.resource(result.public_id);

        const newFile = {
            originalName: req.file.originalname,
            fileLink: result.secure_url,
            publicId: result.public_id,
            assetMetadata: resource,
            uploadDate: new Date().toISOString(),
        };

        user.files.push(newFile);

        await user.save();

        res.status(200)
        console.log('File uploaded successfully');
        res.redirect("/")
    } catch (err) {
        console.error(err);
        res.status(500)
    }
});


  router.get('/download/:userId/:fileId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const file = user.files.id(req.params.fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const fileUrl = file.fileLink;

        res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(file.originalName));
        res.redirect(fileUrl);
    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).send("Error downloading file");
    }
});

module.exports = router