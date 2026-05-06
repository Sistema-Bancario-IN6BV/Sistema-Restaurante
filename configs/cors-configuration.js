export const corsOptions = {
    origin: true,
    credentials: true,
    // PATCH es necesario para /events/:id/cancel
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
