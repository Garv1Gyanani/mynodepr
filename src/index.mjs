// src/index.mjs
import { query } from "express-validator";
const mockusers = [
    { id: 1, username: 'johndoe', email: 'johndoe@example.com' },
    { id: 2, username: 'janedoe', email: 'janedoe@example.com' },
    { id: 3, username: 'bobby88', email: 'bobby88@example.com' },
    { id: 4, username: 'alicegreen', email: 'alice.green@example.com' },
    { id: 5, username: 'charliebrown', email: 'charlie.brown@example.com' },
    { id: 6, username: 'david_smith', email: 'david.smith@example.com' },
    { id: 7, username: 'emily_watson', email: 'emily.w@example.com' },
    { id: 8, username: 'frankie', email: 'frankie@example.com' },
    { id: 9, username: 'grace2023', email: 'grace2023@example.com' },
];

// Middleware to log requests
async function loggingMiddleware(request) {
    console.log(`${request.method} - ${request.url}`);
}

// Function to find a user by ID
async function finduserbyindex(request) {
    const { id } = request.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        return new Response('Bad request', { status: 400 });
    }
    const user = mockusers.find(user => user.id === userId);
    if (!user) {
        return new Response('Not found', { status: 404 });
    }
    return user;
}

// Main fetch handler to handle all routes
export default {
    async fetch(req) {
        const url = new URL(req.url);
        const { pathname } = url;

        // Logging Middleware
        await loggingMiddleware(req);

        // Root Route
        if (pathname === '/') {
            return new Response(JSON.stringify({ msg: 'hello' }), { status: 200 });
        }

        // API Users Route
        if (pathname === '/api/users') {
            const { searchParams } = url;
            const filter = searchParams.get('filter');
            const value = searchParams.get('value');

            if (!filter && !value) {
                return new Response(JSON.stringify(mockusers), { status: 200 });
            }
            const filteredUsers = mockusers.filter(user => user[filter]?.includes(value));
            return new Response(JSON.stringify(filteredUsers), { status: 200 });
        }

        // Create User (POST /api/users)
        if (pathname === '/api/users' && req.method === 'POST') {
            const body = await req.json();
            const newUser = { id: mockusers[mockusers.length - 1].id + 1, ...body };
            mockusers.push(newUser);
            return new Response(JSON.stringify(newUser), { status: 201 });
        }

        // Get User by ID (GET /api/users/:id)
        if (pathname.startsWith('/api/users/') && req.method === 'GET') {
            const id = pathname.split('/')[3];
            const user = await finduserbyindex({ params: { id } });

            if (user instanceof Response) {
                return user; // Return the error response directly
            }

            return new Response(JSON.stringify(user), { status: 200 });
        }

        // Update User (PUT /api/users/:id)
        if (pathname.startsWith('/api/users/') && req.method === 'PUT') {
            const id = pathname.split('/')[3];
            const user = await finduserbyindex({ params: { id } });

            if (user instanceof Response) {
                return user; // Return the error response directly
            }

            const body = await req.json();
            const userIndex = mockusers.findIndex(user => user.id === parseInt(id));
            mockusers[userIndex] = { ...mockusers[userIndex], ...body };
            return new Response(null, { status: 200 });
        }

        // Patch User (PATCH /api/users/:id)
        if (pathname.startsWith('/api/users/') && req.method === 'PATCH') {
            const id = pathname.split('/')[3];
            const user = await finduserbyindex({ params: { id } });

            if (user instanceof Response) {
                return user; // Return the error response directly
            }

            const body = await req.json();
            const userIndex = mockusers.findIndex(user => user.id === parseInt(id));
            mockusers[userIndex] = { ...mockusers[userIndex], ...body };
            return new Response(null, { status: 200 });
        }

        // Default case for unsupported routes
        return new Response('Not found', { status: 404 });
    }
};
