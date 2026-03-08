const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/user');


// HOME PAGE (CHAT PAGE)

router.get('/', authMiddleware, async (req,res)=>{

    try{

        const user = await User.findById(req.user.id)
        .populate("friends");   // get friends data

        const friends = user.friends;

        res.render('chat',{
            user,
            friends
        });

    }catch(err){
        console.log(err);
        res.send("Error loading chat page");
    }

});


// LOGIN PAGE
router.get('/login',(req,res)=>{
    res.render('login');
});


// REGISTER PAGE
router.get('/register',(req,res)=>{
    res.render('register');
});


// PROFILE PAGE
router.get('/profile',authMiddleware, async (req,res)=>{

    const user = await User.findById(req.user.id);

    res.render('profile',{
        user:user
    });

});


// SEARCH USERS
router.get('/search', authMiddleware, async (req, res) => {
  const q = req.query.q || "";

  const users = await User.find({
    name: { $regex: q, $options: 'i' },
    _id: { $ne: req.user.id }          // exclude yourself
  }).select('name email profilePhoto username friendRequests');

  const currentUser = await User.findById(req.user.id).select('friends friendRequests');

  res.render('search', { users, currentUser, query: q });
});



router.get('/requests',   authMiddleware, async (req,res)=>{

    try {

        const user = await User.findById(req.user.id).populate("friendRequests");

        res.render('requests',{
            requests: user.friendRequests
        });

    } catch(err) {
        console.log(err);
        res.send("Error loading friend requests");
    }

});
router.post('/sendRequest/:id', authMiddleware, async (req, res) => {
    try {
        const toId   = req.params.id;   // person being requested
        const fromId = req.user.id;     // logged-in user sending it

        if (toId === fromId) return res.send("Cannot add yourself");

        const toUser   = await User.findById(toId);
        const fromUser = await User.findById(fromId);

        if (!toUser || !fromUser) return res.status(404).send("User not found");

        // Already friends?
        if (fromUser.friends.includes(toId)) return res.send("Already friends");

        // Request already sent?
        if (toUser.friendRequests.includes(fromId)) return res.send("Request already sent");

        // Only push into the RECEIVER's friendRequests
        toUser.friendRequests.push(fromId);
        await toUser.save();

        res.redirect('/search?q=');

    } catch (err) {
        console.log(err);
        res.send("Error sending friend request");
    }
});
router.post('/acceptRequest/:id', authMiddleware, async (req,res)=>{
    try {
        const toId = req.params.id;
        const fromId = req.user.id;

        const toUser = await User.findById(toId);
        const fromUser = await User.findById(fromId);

        if (!toUser || !fromUser) {
            return res.status(404).send("User not found");
        }

        // Remove request from 'to' user
        toUser.friendRequests = toUser.friendRequests.filter(id => id.toString() !== fromId);
        await toUser.save();

        // Remove request from 'from' user
        fromUser.friendRequests = fromUser.friendRequests.filter(id => id.toString() !== toId);
        await fromUser.save();

        // Add each other as friends
        toUser.friends.push(fromId);
        await toUser.save();
        fromUser.friends.push(toId);
        await fromUser.save();

        res.redirect('/requests');
    } catch (err) {
        console.log(err);
        res.send("Error accepting friend request");
    }
});
router.post('/rejectRequest/:id', authMiddleware, async (req,res)=>{
    try {
        const toId = req.params.id;
        const fromId = req.user.id;

        const toUser = await User.findById(toId);
        const fromUser = await User.findById(fromId);

        if (!toUser || !fromUser) {
            return res.status(404).send("User not found");
        }

        // Remove request from 'to' user
        toUser.friendRequests = toUser.friendRequests.filter(id => id.toString() !== fromId);
        await toUser.save();

        // Remove request from 'from' user
        fromUser.friendRequests = fromUser.friendRequests.filter(id => id.toString() !== toId);
        await fromUser.save();

        res.redirect('/requests');
    } catch (err) {
        console.log(err);
        res.send("Error rejecting friend request");
    }
});
router.post('/cancelRequest/:id', authMiddleware, async (req, res) => {
  try {
    const toId   = req.params.id;
    const fromId = req.user.id;

    const toUser = await User.findById(toId);
    if (!toUser) return res.status(404).send("User not found");

    // Remove fromId from toUser's friendRequests
    toUser.friendRequests = toUser.friendRequests.filter(
      id => id.toString() !== fromId.toString()
    );
    await toUser.save();

    res.redirect('/search?q=');
  } catch (err) {
    console.log(err);
    res.send("Error cancelling request");
  }
});

module.exports = router;