import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getObjectKeysFromString } from './utlities';
import {} from '@supabase/supabase-js';
import { supabase, tableName } from '$lib/config/supabase';
import axios from 'axios';
import type { ResponseType } from './getLocationDetail';
import { getDetailFromWikiPedia, searchWikipedia, type WikipediaPage } from './wikipedia';
type Props = {
	book: string;
};

type Result = {
	real_life_location: string[];
	fictional_location: string[];
	bookName: string;
	author: string;
};
type SupabaseType = {
	real: string[];
	fictional: string[];
	bookName: string;
	author: string;
	image: string;
	des?: string;
	id: number;
};

type AiReturnType = Result & { error: string };

export type ReturnType = Result & { image: string; des?: string };

export const handleSupabase = async () => {};

const handleAiModel = async (bookName: string): Promise<AiReturnType> => {
	try {
		const genAI = new GoogleGenerativeAI('AIzaSyBl_4mojkgTB-ZIH2HDUoejXlaAXPgmnlE');
		const schema = {
			description: 'book setails',
			type: SchemaType.OBJECT,
			properties: {
				real_life_location: {
					type: SchemaType.ARRAY,
					items: {
						type: SchemaType.STRING
					},
					nullable: false
				},
				fictional_location: {
					type: SchemaType.ARRAY,
					items: {
						type: SchemaType.STRING
					},
					nullable: false
				},
				bookName: {
					type: SchemaType.STRING,
					nullable: false
				},
				author: {
					type: SchemaType.STRING,
					nullable: false
				}
			},
			required: ['real_life_location', 'fictional_location', 'bookName', 'author']
		};

		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-flash',
			generationConfig: {
				responseMimeType: 'application/json',
				responseSchema: schema
			}
		});

		const result = await model.generateContent(
			`List a location mention on this book ${bookName}.retun only location names`
		);

		const resultText = result.response.text();
		const resultObj = getObjectKeysFromString<Result>(resultText);

		const output: AiReturnType = {
			...resultObj,
			error: ''
		};

		return output;
	} catch (error) {
		return {
			fictional_location: [],
			real_life_location: [],
			bookName: '',
			error: 'Something Went Wrong , Try Again',
			author: ''
		};
	}
};

const getBookFromDatabase = async (bookName: string): Promise<any[] | null> => {
	const { error, data } = await supabase
		.from(tableName)
		.select()
		.ilike('bookName', `%${bookName}%`);
	// console.log(data, error);

	return error ? null : data || null;
};

const getBookOtherDetail = async (bookName: string): Promise<ResponseType<WikipediaPage>> => {
	const result: ResponseType<WikipediaPage> = { data: null, success: false };
	const bookNameForWikiPedia = await searchWikipedia(bookName, 'book');

	if (!bookNameForWikiPedia.success || !bookNameForWikiPedia.data) {
		return result;
	}

	const bookDetailFromWikipedia = await getDetailFromWikiPedia(bookNameForWikiPedia.data?.title);
	result.data = bookDetailFromWikipedia.data;
	result.success = bookDetailFromWikipedia.success;
	return result;
};

// const insertBookInDatabase = async(bookName:string)

export const getBooksLocation = async ({ book }: Props): Promise<ResponseType<ReturnType[]>> => {
	const bookDetail = await getBookFromDatabase(book);
	console.log(bookDetail, 'ss');

	if (bookDetail && bookDetail.length > 0) {
		const bookDetails = (bookDetail as SupabaseType[]).map((item) => ({
			error: '',
			bookName: item?.bookName,
			real_life_location: item?.real,
			fictional_location: item?.fictional,
			author: item?.author,
			des: item?.des,
			image: item?.image
		}));
		return {
			data: bookDetails,
			success: true
		};
	}

	// return {
	// 	data: null,
	// 	success: false
	// };

	const aiResult: AiReturnType = await handleAiModel(book);

	if (aiResult.error) {
		return {
			data: null,
			success: false
		};
	}
	const checkAiResultArray = ['unknow', '', aiResult.author, 'string'];
	const checkAiResult = checkAiResultArray.includes(aiResult.author);
	if (checkAiResult) {
		return {
			data: null,
			success: false
		};
	}
	const bookDetailFromWikipedia = await getBookOtherDetail(book);
	console.log(bookDetailFromWikipedia);

	const { error, data } = await supabase.from(tableName).insert({
		bookName: aiResult.bookName,
		real: aiResult.real_life_location,
		fictional: aiResult.fictional_location,
		image: bookDetailFromWikipedia.data?.originalimage?.source ?? '',
		des: bookDetailFromWikipedia.data?.extract,
		author: aiResult.author
	});

	const bookDetails: ReturnType = {
		...aiResult,
		image: bookDetailFromWikipedia.data?.originalimage?.source ?? '',
		des: bookDetailFromWikipedia.data?.extract
	};

	const result: ResponseType<ReturnType[]> = {
		data: [bookDetails],
		success: true
	};

	console.log(error, data);

	return result;
};
