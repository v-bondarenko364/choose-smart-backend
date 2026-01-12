// import type { Context } from 'elysia';

// import jwt from 'jsonwebtoken';
// import { URL } from 'node:url';

// import prisma from '@/lib/prisma';
// import { normalizeResponse } from '@/lib/response';

// import type { User } from '../modules/user/user.types';

// declare global {
// 	interface Request {
// 		user?: User;
// 	}
// }

// export const authMiddleware = async ({ request, cookie: { token }, status }: Context) => {
// 	// Handle root path case
// 	if (request.url === '/') {
// 		console.log('request.url is / - skipping', request.url);
// 		console.log('request', request);

// 		return;
// 	}

// 	const path = new URL(request.url).pathname;

// 	// Skip auth check for auth routes and webhooks
// 	if (path.startsWith('/auth') || path.startsWith('/webhooks/')) {
// 		return;
// 	}

// 	try {
// 		const authHeader = request.headers.get('authorization');
// 		const requestToken =
// 			(authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
// 			(token.value as string);

// 		if (!requestToken) {
// 			console.log('!requestToken');

// 			return status(401, normalizeResponse(null, 401, 'No token provided'));
// 		}

// 		const secret = process.env.JWT_SECRET!;
// 		const decoded = jwt.verify(requestToken, secret) as { id: number; email: string };
// 		const user = await prisma.user.findUnique({
// 			where: { id: decoded.id, email: decoded.email },
// 			select: {
// 				id: true,
// 				name: true,
// 				email: true,
// 				characterId: true,
// 				characterReflection: true,
// 				onboardingCompleted: true,
// 				focusArea: true,
// 				insightStyle: true,
// 				regSource: true,
// 				stats: {
// 					select: {
// 						id: true,
// 						statId: true,
// 						amount: true,
// 						stat: {
// 							select: {
// 								id: true,
// 							},
// 						},
// 					},
// 				},
// 			},
// 		});

// 		if (!user) {
// 			console.log('!user');

// 			return status(401, normalizeResponse(null, 401, 'User not found'));
// 		}

// 		// Store user in request context instead of returning it
// 		request.user = user as User;
// 	} catch (error) {
// 		console.log('ERROR INSIDE MIDDLEWARE', error);

// 		return status(401, normalizeResponse(null, 401, 'Invalid token'));
// 	}
// };
