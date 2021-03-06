import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(
	+(process.env.REDIS_PORT as string),
	process.env.REDIS_IP,
	{
		connectTimeout: +(process.env.REDIS_CONNECTION_TIMEOUT as string)
	}
);

// sets the base scoped key for redis
const baseKey = 'lm:web:oidc:';

/**
 * Sets a value, depending on it's use and scope
 *
 * @param use
 * @param scoped
 * @param value
 */
const setValue = async (
	use: string,
	value: any,
	expires?: number,
	scoped?: string
): Promise<void> => {
	let key: string;

	if (scoped) {
		key = baseKey + use + ':' + scoped;
	} else {
		key = baseKey + use;
	}

	if (expires) {
		await redis.set(key, value, 'EX', expires);
	} else {
		await redis.set(key, value);
	}
};

/**
 * Gets a value, depending on it's use and scope
 *
 * @param use
 * @param scoped
 */
const getValue = async (
	use: string,
	scoped?: string
): Promise<string | null> => {
	let key: string;

	if (scoped) {
		key = baseKey + use + ':' + scoped;
	} else {
		key = baseKey + use;
	}

	return await redis.get(key);
};

/**
 * Delete a value, depending on it's use and scope
 *
 * @param use
 * @param scoped
 */
const delValue = async (use: string, scoped?: string): Promise<number> => {
	let key: string;

	if (scoped) {
		key = baseKey + use + ':' + scoped;
	} else {
		key = baseKey + use;
	}

	return await redis.del(key);
};

/**
 * Increment user's usage in redis
 * creates a new string if it doesn't exist
 *
 * @param use
 * @param ip
 */
const incrUser = async (use: string, ip: string): Promise<string | null> => {
	const key = baseKey + use + ':' + ip;

	const currentEntry = await redis.get(key);

	if (currentEntry) {
		// increments the value
		redis.incr(key);
	} else {
		// creates a new key for the user with tries set to 1
		// lets the key expire after 5 minutes
		redis.set(key, 1, 'EX', 60 * 5);
	}

	return await redis.get(key);
};

/**
 * Deletes the user count entry before it expires
 *
 * @param use
 * @param ip
 */
const delUser = async (use: string, ip: string): Promise<void> => {
	const key = baseKey + use + ':' + ip;

	// removes the key
	redis.del(key);
};

export { setValue, getValue, delValue, incrUser, delUser, baseKey };
