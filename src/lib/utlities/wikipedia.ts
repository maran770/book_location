import axios from 'axios';
import type { ResponseType } from './getLocationDetail';

export type WikipediaPage = {
	type: string;
	title: string;
	displaytitle: string;
	namespace: {
		id: number;
		text: string;
	};
	wikibase_item: string;
	titles: {
		canonical: string;
		normalized: string;
		display: string;
	};
	pageid: number;
	thumbnail?: {
		source: string;
		width: number;
		height: number;
	};
	originalimage?: {
		source: string;
		width: number;
		height: number;
	};
	lang: string;
	dir: string;
	revision: string;
	tid: string;
	timestamp: string;
	description: string;
	description_source: string;
	content_urls: {
		desktop: {
			page: string;
			revisions: string;
			edit: string;
			talk: string;
		};
		mobile: {
			page: string;
			revisions: string;
			edit: string;
			talk: string;
		};
	};
	extract: string;
	extract_html: string;
};

export type WikipediaSearch = {
	title: string;
};

export type WikipediaPageSearchResult = {
	query: {
		searchinfo: {
			totalhits: number;
		};
		search: WikipediaSearch[];
	};
};

export const getDetailFromWikiPedia = async (
	searchWord: string
): Promise<ResponseType<WikipediaPage>> => {
	const { data } = await axios(`https://en.wikipedia.org/api/rest_v1/page/summary/${searchWord}`);

	const result: ResponseType<WikipediaPage> = {
		data: data,
		success: data ? true : false
	};
	return result;
};

export const searchWikipedia = async (searchWord: string, search: string = '') => {
	const result: ResponseType<WikipediaSearch> = {
		data: null,
		success: false
	};
	try {
		const { data } = await axios.get(
			`http://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${searchWord} ${search}&origin=*`
		);
		const isSuccess = data && data?.query && data.query?.search && data.query.search?.length > 0;
		result.data = isSuccess ? data.query.search[0] : null;
		result.success = isSuccess ? true : false;
	} catch (error) {
		console.log(error);
	} finally {
		return result;
	}
};
