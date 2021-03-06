import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default (
	userId: number,
	username: string,
	hasAvatar: boolean
): object => {
	const accessToken = jwt.sign(
		{ userId, username, hasAvatar },
		process.env.PRIVATE_KEY + '',
		{
			algorithm: 'RS256',
			expiresIn: 3600 * 24 * 356,
			issuer: 'https://auth.luminu.net'
		}
	);

	return {
		accessToken,
		message: 'loginSuccessful',
		success: true
	};
};
