const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const AuthController = require('../controllers/authController');

router.use(AuthController.verifySession);

router.get('/', TaskController.getTasks);
router.post('/create', AuthController.verifyAdmin, TaskController.createTask);
router.put('/:id/start', TaskController.startTask);
router.put('/:id/pause', TaskController.pauseTask);
router.put('/:id/finalize', TaskController.finalizeTask);
router.put('/:id/reject', AuthController.verifyAdmin, TaskController.rejectTask);
router.get('/global-lock/status', AuthController.verifyAdmin, TaskController.getGlobalLockStatus);
router.post('/global-lock', AuthController.verifyAdmin, TaskController.toggleGlobalLock);
router.get('/collaborators', AuthController.verifyAdmin, TaskController.getCollaborators);
router.put('/:id/assign', TaskController.selfAssignTask);
router.delete('/:id', AuthController.verifyAdmin, TaskController.deleteTask);

module.exports = router;
