const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado. Por favor inicie sesión.' });
  }
}

router.get('/', requireAuth, TaskController.getTasks);
router.post('/', requireAuth, TaskController.createTask);
router.post('/:id/start', requireAuth, TaskController.startTask);
router.post('/:id/pause', requireAuth, TaskController.pauseTask);
router.post('/:id/finalize', requireAuth, TaskController.finalizeTask);
router.post('/:id/reject', requireAuth, TaskController.rejectTask);
router.post('/:id/assign', requireAuth, TaskController.selfAssignTask);
router.post('/global-lock', requireAuth, TaskController.toggleGlobalLock);
router.get('/collaborators', requireAuth, TaskController.getCollaborators);

module.exports = router;
