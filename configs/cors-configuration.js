export const corsOptions = {
    origin: true,
    credentials: true,
    // PATCH es necesario para /events/:id/cancel
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
