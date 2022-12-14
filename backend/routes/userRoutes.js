const express = require("express");
const User = require("../schema/user");
const People = require("../schema/peopleChat");

const router = express.Router();
// const browserHistory=require('react-router').browserHistory;

let baseURL = require("../index");
baseURL = baseURL.baseURL;

//image upload
const path = require("path");
const fs = require("fs");

const multer = require('multer');
const { response } = require("express");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/profilePics/')
    },
    filename: function (req, file, cb) {
        req.body.fileType = path.extname(file.originalname);
        cb(null, req.body.username + req.body.fileType) //Appending extension
    }
});

const upload = multer({ storage: storage });

//session 



/**
 * This function would log the user into the website.
 * Authentication function
 */
router.post("/login", (req, res) => {
    // find a user from the database
    // console.log(req);
    var email_ = 'x';
    var profilePic_ = 'x';
    var name_ = 'x';
    User.findOne({
        username: req.body.username,
    }).then((data) => {
        // console.log("data in login"+ data);
        email_ = data ? data.email : 'x';
        profilePic_ = data ? data.profilePic.name : 'x';
        name_ = data ? data.name : 'x';
        isLoggedIn = false;
        // console.log(data);
        // if either username is incorrect
        if (data == {} || data == null) {
            data = "User not found! Create an account if you don't have one.";
            isLoggedIn = false;
        }
        // or the passwords don't match
        else if (data.password != req.body.password) {
            data = "Invalid username or password supplied.";
            isLoggedIn = false;
        }
        // user authenticated
        else {
            data = "Logged in successfully!";
            isLoggedIn = true;

            // create session for the current user
            // req.session.username=req.body.username;
            // console.log(req.session);
            // ...
        }
        const user = {
            "data": data,
            "isLoggedIn": isLoggedIn,
            "username": req.body.username,
            "profilePic": profilePic_,
            "name": name_,
            "email": email_
        };
        // send the response back to the user
        // console.log("user"+user);
        res.json(user);

    }).catch(err => {
        res.json({ "err": err });
        console.log(err);
    });
});

router.post("/register", (req, res) => {
    var error = {};
    var isRegistered = false;

    // console.log(req.body);

    User.find({
        $or: [{ username: req.body.username }, { email: req.body.email }]
    }).then((data) => {
        if (data.length) {
            var matched_data = "email";
            if (data.username == req.body.username) {
                matched_data = "username";
            }
            error.error = matched_data + " already exists!";
            res.json({ "data": error, "isRegistered": false, "username": req.body.username });
        }
        else {
            var location = {
                country: req.body.country,
                state: req.body.state,
                city: req.body.city
            }

            var user = new User({
                'name': req.body.name,
                'username': req.body.username,
                'mobileNumber': req.body.mobileNumber,
                'location': req.body.location,
                'dob': req.body.dob,
                'password': req.body.password,
                'email': req.body.email,
                'bio': req.body.bio,
            });

            user.save((err, resp) => {
                if (err) {
                    console.log(err);
                    isRegistered = false;
                    res.json({ "isRegistered": false });
                } else {
                    // console.log(resp);
                    isRegistered = true;
                    res.json({ "isRegistered": true, "username": req.body.username, "profilePic": req.body.profilePic, "name": req.body.name });
                }
            });
        }
    });
});

router.post("/register/profilePic", upload.single("profilePic"), (req, res) => {
    if (fs.existsSync(`${baseURL}/images/profilePics/${req.body.username}${req.body.fileType}`)) {
        User.findOne({
            username: req.body.username,
        }).then((data) => {
            if (data == {})
                res.json({ isUploaded: false });
            else {
                let user = new User(data);

                user.profilePic = { "name": req.body.username + req.body.fileType };

                // console.log(user);

                user.save((err, msg) => {
                    if (err) {
                        console.log(err);
                        res.json({ isUploaded: false });
                    } else {
                        console.log(msg);
                    }
                });
            }
        });

        res.json({ isUploaded: true });
    }
    else
        res.json({ isUploaded: false });
});


/**
 * This request is for getting the current logged in user
 */
router.get("/current", (req, res) => {
    // console.log("current user...");
});

/**
 * This request is for getting any other user
 */

router.get("/getUser/:username", (req, res) => {

    let isFound = false;

    User.findOne({
        "username": req.params.username
    }, { password: false }).then((data) => {
        // if the user is not found
        if (data == null || data == {}) {
            isFound = false;
            res.json({ "isFound": isFound });
        }
        // else if the user is found, send the details
        else {
            isFound = true;
            res.json({ isFound: isFound, user: data });
        }
    });

});

router.post('/follow', (req, res) => {
    // console.log("in follow");
    const email_ = req.body.email;
    User.findOne({ email: email_ }).then(
        (data) => {
            if (data.followers.indexOf(req.body.email_session) != -1) {
                // console.log(data.followers);
                console.log("already present");
            } else {
                data.followers.push(req.body.email_session);
                // console.log(data.followers);
                User.updateOne({ email: email_ }, { $set: { followers: data.followers } })
                    .then(msg => console.log(msg))
                    .catch(err => console.log(err));
            }
        }
    );
    // console.log("email " + req.body.email_session);
    User.findOne({ email: req.body.email_session }).then(
        (data) => {
            if (data.following.indexOf(req.body.email) != -1) {
                console.log("already present");
            } else {
                // console.log("data"+data);
                data.following.push(email_);
                // console.log(data.following);
                User.updateOne({ email: req.body.email_session }, { $set: { following: data.following } })
                    .then(msg => console.log(msg))
                    .catch(err => console.log(err));
            }
        }
    );

    res.json({ "status": "true" });
});

router.post('/unfollow', (req, res) => {
    var personToBeUnfollowed = req.body.person;
    var user = req.body.user;

    // console.log(personToBeUnfollowed);
    // console.log(user);

    User.findOne({ email: user }).then(
        (data) => {
            let index = data.following.findIndex((val) => val === personToBeUnfollowed);
            if (index === -1) {
                console.log("not in following");
            }
            else {
                data.following.splice(index, 1);
                User.updateOne({ email: user }, { $set: { following: data.following } }).then();
            }
        }
    );

    User.findOne({ email: personToBeUnfollowed }).then(
        (data) => {
            let index = data.followers.findIndex((val) => val === user);
            if (index === -1) {
                console.log("not in followers");
            }
            else {
                data.followers.splice(index, 1);
                User.updateOne({ email: personToBeUnfollowed }, { $set: { followers: data.followers } }).then();
            }
        }
    )

    res.json({ "status": "true" });
})

router.post('/getRandomPeople', async (req, res) => {

    let array = [];
    let followings = [];

    await User.findOne({email : req.body.email}).then((data)=>{
        following= data.following;
    });

    await User.find({ email : { $nin : following }}).limit(5).then((data) => {
        const default_ = 'default_.png';
        for (var i of data) {
            if (i.email == req.body.email)
                continue;
            // console.log(i);
            if (i.profilePic.name === undefined) {
                i.profilePic.name = default_;
            }
            array.push({
                name: i.name,
                profilePic: i.profilePic.name,
                email: i.email,
                subtitle: i.bio,
                username : i.username,
                isFollowed : followings.includes(i.email)
            })
        }
        res.json({ "people": array });
    });
});

router.post("/getFollowers", async (req, res) => {
    let followers = [], result = [];
    await User.findOne({ email: req.body.email }).then(
        (data) => {
            followers = data.followers;
        }
    );

    for (let i of followers) {
        await User.findOne({ email: i }).then(
            (data) => {
                result.push({
                    username: data.username,
                    name: data.name,
                    profilePic: (data.profilePic.name ? data.profilePic.name : 'default_.png'),
                });
            }
        );
    }

    res.json({ "followers": result });
});

router.post("/getFollowing", async (req, res) => {
    let following = [], result = [];
    await User.findOne({ email: req.body.email }).then(
        (data) => {
            following = data.following;
        }
    );

    for (let i of following) {
        await User.findOne({ email: i }).then(
            (data) => {
                result.push({
                    username: data.username,
                    name: data.name,
                    profilePic: (data.profilePic.name ? data.profilePic.name : 'default_.png'),
                });
            }
        );
    }

    res.json({ "following": result });
});

router.post('/getFollowersFollowing', async (req, res) => {
    var followers_ = [], following_ = [], commonEmail_ = [], result_ = [], result_name = [];
    await User.findOne({ email: req.body.emailSession }).then(
        (data) => {
            followers_ = data.followers;
            following_ = data.following;

            commonEmail_ = followers_.filter(value => following_.includes(value));
        }
    )
    for (var i of commonEmail_) {
        await User.findOne({ email: i }).then((data) => {

            result_.push({
                username: data.username,
                name: data.name,
                profilePic: (data.profilePic.name ? data.profilePic.name : 'default_.png')
            })
            // result_name.push(data.name);
        })
    }
    // console.log('insidde' + result_);
    res.json({ result: result_ });
})

router.get('/searchedUser/:text', (req, res) => {
    // console.log(req.params.text);
    var result = [];
    User.find({ $or: [{ username: new RegExp('^' + req.params.text, 'ig') }, { name: new RegExp('^' + req.params.text, 'ig') }] }).then(
        (data) => {
            for (var i of data) {
                let u = {
                    profilePic: i.profilePic.name ? i.profilePic.name : 'default_.png',
                    name: i.name,
                    username: i.username
                };
                // console.log(u);
                result.push(u);
            }
            res.json({ 'result': result });
        }
    )

})

router.get('/usernameAvailable/:username', (req, res) => {
    
    User.find({username : req.params.username}).then(
        (data)=>{
            if(data.length === 0){
                res.json({flag : true});
            }
            else{
                res.json({flag : false});
            }
        }
    )

})

router.post('/updateUser',async (req,res) => {

    var arrayEmail = [];
    var arrayUsername = [];
    const pic = req.body.user.profilePic;
    const name = req.body.user.name;
    var username;
    var flag = false; 

    await User.findOne({ email : req.body.email}).then(
        (data) => {
            username = data.username;
            if(pic !== data.profilePic.name || name !== data.name){
                flag = true;
            }
        }
    );

    console.log("flag" + flag);

    if(flag){
    
        await People.findOne( { email : req.body.email } ).then(
            (data)=>{
                arrayUsername = data ? data.people : [];
            }
        );

        for(let i of arrayUsername){
            await User.findOne({username : i.username}).then(
                (data) => {
                    arrayEmail.push(data.email);
                }
            )
        }

        console.log(arrayEmail);

        for(let i of arrayEmail){

            let people = [];
            await People.findOne( { email : i } ).then(
                (data)=>{
                    let index = data.people.findIndex( (val) => val.username === username );
                    people = data.people;
                    people[index] = {
                        username : username,
                        name : name,
                        profilePic : pic
                    }
                }
            )
            console.log(people);
            People.updateOne( { email : i } , { $set : { people : people } } ).then();

        }

    }

    User.updateOne( { email : req.body.email } , { $set : req.body.user  }).then(
        ()=>{
            res.json({"status":true});
        }
    );

})

router.post('/changePassword',(req,res) =>{
    User.updateOne( {email : req.body.email} , { $set : { password: req.body.password } } ).then(
        () => {
            res.json({status:true});
        }
    )
})

module.exports = router;