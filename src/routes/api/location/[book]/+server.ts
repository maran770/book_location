import { json } from '@sveltejs/kit';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const GET = async ({ params }) => {
	const { book } = params;
	const genAI = new GoogleGenerativeAI('AIzaSyBl_4mojkgTB-ZIH2HDUoejXlaAXPgmnlE');
	const schema = {
		description: 'List of recipes',
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
			}
		},
		required: ['real_life_location', 'fictional_location']
	};

	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: schema
		}
	});

	const result = await model.generateContent(`List a location mention on this book ${book}`);

	// const prompt = `List a location mention on this book ${book} using this JSON schema:
	//     real_life_location: Array<string>
	//     fictional_location: Array<string>
	//         Return: {
	//             'real_life_location': real_life_location,
	//             'fictional_location': fictional_location
	//         }  And any fictinaol location refeanrance real life location add location in real_life_location Array like this real_life_Locaion(fictional_location)`;

	// const result = await model.generateContent(prompt);
	const resultText = result.response.text();
	console.log(resultText);

	return json(resultText);
};
