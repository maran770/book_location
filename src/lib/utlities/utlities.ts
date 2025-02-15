export function getObjectKeysFromString<T>(jsonString: string): T {
	try {
		const parsedObject = JSON.parse(jsonString);
		return parsedObject;
	} catch (error) {
		console.error('Invalid JSON string:', error);
		return {} as T;
	}
}
