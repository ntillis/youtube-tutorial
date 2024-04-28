const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Mailer = require('../models/Mailer')
const Tag = require('../models/Tag')

router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Thinking at 12am",
            description: "A random thought blog"
        }

        let perPage = 5;
        let page = req.query.page || 1;

        const data = await Post.aggregate([ { $sort: { createdAt: -1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const tags = await Tag.find();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count/perPage);


        res.render('index', { 
            locals, 
            data,
            tags,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });

    } catch (error) {
        console.log(error);
    }
});

router.get('/post/:id', async (req, res) => {
    try {
        const locals = {
            title: "Nodejs Blog",
            description: "Simple Blog created with Nodejs"
        }

        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });
        res.render('post', { 
            locals, 
            data,
            currentRoute: '/post/:id' 
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/about', (req, res) => {
    const locals = {
        title: "ta12am | about",
        description: "A random thought blog"
    }
    res.render('about', {
        locals,
        currentRoute: '/about'
    });
});

router.get('/contact', (req, res) => {
    const locals = {
        title: "ta12am | contact",
        description: "A random thought blog"
    }
    res.render('contact', {
        locals,
        currentRoute: '/contact'
    });
});

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple Blog created with Nodejs"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
            ]
        });

        res.render("search", {
            data,
            locals,
            currentRoute: '/search'
        });

    } catch (error) {
        console.log(error);
    }
})

router.get('/search/tags/:name', async (req, res) => {
    try {
        const tagName = req.params.name;
        const locals = {
            title: tagName + " blogs",
            description: "blogs that have the corresponding tag"
        }
        const tag = await Tag.findOne({ name: tagName });

        const posts = await Post.find({ tags: tag._id });

        res.render("tag", {
            tagName,
            locals,
            posts,
            currentRoute: `/search/tags/${tag}`
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/subscribe', async (req, res) => {
    try {
        const { email, fName } = req.body;
        try {
            const user = await Mailer.create({ email, fName })
            res.redirect('/');
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'Email already in use'});
            }
            res.status(500);
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/post/:id/comment', async (req, res) => {
    try {
        const comment = {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message
        }
        
        let slug = req.params.id;
        const data = await Post.findById({_id: slug});

        data.comments.push(comment);

        await data.save();

        res.redirect(`/post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }
}); 

module.exports = router;
