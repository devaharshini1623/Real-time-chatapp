const router = require('express').Router();
const authController = require('../controllers/authController');
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');

// Register
router.post('/register', authController.registerUser);

// Login
router.post('/login', authController.loginUser);

// Update profile with photo upload
router.post(
    '/updateProfile',
    authMiddleware,
    upload.single('profilePhoto'),
    authController.updateProfile
);

// Logout
router.get('/logout', authController.logoutUser);
router.post('/sendRequest/:id',     authMiddleware, authController.sendRequest);

// Accept a friend request
router.post('/acceptRequest/:id',   authMiddleware, authController.acceptRequest);

// Reject a friend request
router.post('/rejectRequest/:id',   authMiddleware, authController.rejectRequest);

// Page: view all pending requests
router.get('/requests',             authMiddleware, authController.getRequestsPage);

router.post('/addFriend/:id',
    authMiddleware,
    authController.addFriend
);
router.get('/messages/:friendId',
    authMiddleware,
    authController.getMessages
);


module.exports = router;


