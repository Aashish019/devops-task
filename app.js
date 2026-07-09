const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.use((req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(2)}ms`
        );
    });

    next();
});

app.get('/', (req, res) => res.json({ message: 'Hello, DevOps!' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

if (require.main === module) {
    app.listen(PORT, () => console.log(`App running on port ${PORT}`));
}

module.exports = app;