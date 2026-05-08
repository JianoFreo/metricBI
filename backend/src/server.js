import express from 'express';

const app = express();

app.get('/api/test',(res, req) =>{
    res.status(200).json({ message: 'Server is healthy' });
} )