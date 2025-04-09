const { failedMessagesController } = require('../controllers');

const router = require('express').Router();


router.get('/',failedMessagesController.listFailedMessages);
router.post('/:uuid/replay', failedMessagesController.replayMessage);
router.patch('/:uuid/discard', failedMessagesController.discardMessage);

module.exports = router;
