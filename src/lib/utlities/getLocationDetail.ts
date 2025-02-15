import axios from 'axios';
import { getDetailFromWikiPedia, type WikipediaPage } from './wikipedia';

type ReturnType = {
	name: string;
	description: string;
	image: string;
	url: string;
};

export type ResponseType<T> = {
	data: T | null;
	success: boolean;
};

export type WikipediaPageOrNull = WikipediaPage | null;

export const getLocationDetail = async (
	locations: string[]
): Promise<ResponseType<WikipediaPage[]>> => {
	const locationsDetailPromise = locations.map(async (location) => {
		const result = await getDetailFromWikiPedia(location);
		if (result.data) return result.data;
	});
	const locationsDetail = await Promise.all(locationsDetailPromise);
	if (locationsDetail.length === 0) return { data: null, success: false };
	const result: ResponseType<WikipediaPage[]> = {
		data: locationsDetail as WikipediaPage[],
		success: true
	};
	console.log(locationsDetail, 'jkj');

	return result;
};
