const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Post = require('../models/Post');
const Mailer = require('../models/Mailer')
const Tag = require('../models/Tag')

function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
}

async function sendVerificationEmail(email, token) {
  const mailOptions = {
    from: 'thinkingat12am@gmail.com',
    to: email,
    subject: 'Thinking at 12am | Email Verification',
    html: `<p>Click <a href="http://localhost:3000/verify/${token}">here</a> to verify your email.</p>`,
  };
  await transporter.sendMail(mailOptions);
}

router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Thinking at 12am",
            description: "A random thought blog"
        }

        let perPage = 5;

        const data = await Post.aggregate([ { $sort: { createdAt: -1 }}])
        .limit(perPage)
        .exec();

        const tags = await Tag.find().limit(3);

        res.render('index', { 
            locals, 
            data,
            tags,
            currentRoute: '/'
        });

    } catch (error) {
        console.log(error);
    }
});

router.get('/search/all-blogs', async (req, res) => {
    try {
        const locals = {
            title: "ta12am | all blogs",
            description: "All blog posts"
        }

        const data = await Post.find();

        res.render('all-blogs', {
            locals,
            data,
            currentRoute: '/search/all-blogs'
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/search/all-tags', async (req, res) => {
    try {
        const locals = {
            title: "ta12am | tags",
            description: "All tags"
        }

        const tags = await Tag.find();

        res.render('all-tags', {
            locals,
            tags,
            currentRoute: '/search/all-tags'
        })
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
            title: "ta12am | " + tagName,
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
        const token = generateVerificationToken();
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
