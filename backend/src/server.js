import express from 'express';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js'

const app = express();

app.get('/api/test',(res, req) =>{
    res.status(200).json({ message: 'Server is healthy' });
});

app.listen(ENV.PORT, async () => {
    console.log(`the server is running at ${ENV.PORT}`);
    console.log(`The env is on ${ENV.NODE_ENV}`)
    await connectDB()
});
