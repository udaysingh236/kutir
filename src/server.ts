import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';
const port = process.env.port || 3000;
app.listen(port, () => {
    logger.info(`server is running on ${port}`);
});
