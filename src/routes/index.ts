import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /v1/healthcheck:
 *  get:
 *     tags:
 *     - Healthcheck
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */
router.get('/healthcheck', (req, res) => {
    res.status(200).send('Hello from Kutir, I am alive..!!');
});

export default router;
