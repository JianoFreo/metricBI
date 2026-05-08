import express from 'express';
import path from 'path';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js'

const app = express();
const __dirname = path.resolve()

app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Server is healthy' });
});
if (ENV.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../admin/dist")));

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../admin", "dist", "index.html"));
    });
}
app.listen(ENV.PORT, async () => {
    console.log(`the server is running at ${ENV.PORT}`);
    console.log(`The env is on ${ENV.NODE_ENV}`)
    await connectDB()
});
