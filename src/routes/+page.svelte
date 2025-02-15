<script lang="ts">
	type InputChangeEvent = Event & {
		currentTarget: EventTarget & HTMLInputElement;
	};
	import { bookNames } from '$lib/constents/bookNames';
	import { getBooksLocation, type ReturnType } from '$lib/utlities/getBooksLocation';
	import { getLocationDetail } from '$lib/utlities/getLocationDetail';
	import type { WikipediaPage } from '$lib/utlities/wikipedia';
	import A from './component/A.svelte';

	let bookName: string = $state('');
	let error: string = $state('');
	let locationDetails: WikipediaPage[] = $state([]);
	let loading: boolean = $state(false);
	const emptyBookDetail = {
		author: '',
		bookName: '',
		des: '',
		fictional_location: [],
		image: '',
		real_life_location: []
	};
	let bookDetails: ReturnType = $state(emptyBookDetail);

	const resetError = () => (error = '');
	const resetLocation = () => (locationDetails = []);

	const handleChangeInput = (e: InputChangeEvent) => {
		if (e.currentTarget) {
			bookName = e.currentTarget.value;
			resetError();
		}
	};

	const getBookLocation = async (bookName: string) => {
		resetLocation();
		resetError();
		loading = true;
		bookDetails = emptyBookDetail;
		if (bookName.trim() === '') {
			error = 'Please enter a book name';
			loading = false;
			return;
		}

		const result = await getBooksLocation({ book: bookName });

		if (!result.success || !result.data || result.data.length <= 0) {
			error = 'Something went wrong. Please try again.';
			loading = false;

			return;
		}
		bookDetails = result.data[0];
		console.log(result.data[0]);

		// for(let i = 0; i < result.data[0].real_life_location.length; i++) {
		// const locationDetailsResponse = await getLocationDetail(result.data[0].real_life_location);
		// if (!locationDetailsResponse.success || locationDetailsResponse.data === null) {
		// 	error = 'Something went wrong. Please try again.';
		// 	loading = false;
		// 	return;
		// }

		// locationDetails = locationDetailsResponse.data;
		// console.log(locationDetails, locationDetailsResponse);
		loading = false;

		// }
	};

	const preDefinedBook = (bookName: string) => {
		getBookLocation(bookName);
	};

	const googleSearch = (searchWord: string) => {
		window.open(`https://www.google.com/search?q=${searchWord}`, '_blank');
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col gap-5">
	<h1 class="font-mono font-[900]">Discover the Real Places Behind Your Favorite Books!</h1>
	<p class="font-mono font-extralight">
		Whether it’s a classic novel or modern fiction, our tool helps you trace the real locations that
		inspired the story.
	</p>
	<div class="flex w-[400px] gap-2 rounded-lg border-2 p-3">
		<input
			onchange={handleChangeInput}
			onfocus={resetError}
			value={bookName}
			type="text"
			placeholder="Book name"
			class="w-[270px] outline-none"
		/>
		<button
			disabled={loading}
			class="cursor-pointer rounded-lg bg-[#4B4B47] p-1.5 text-[#fdfcef]"
			onclick={() => getBookLocation(bookName)}>Map It Out</button
		>
	</div>
	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}
	<div id="book_names" class="flex flex-row flex-wrap justify-center gap-3">
		{#each bookNames as book}
			<button
				disabled={loading}
				class="cursor-pointer rounded-full border-2 p-2 hover:border-[#fdfcef] hover:bg-[#4B4B47] hover:text-[#fdfcef]"
				onclick={() => preDefinedBook(book)}
			>
				{book}
			</button>
		{/each}
	</div>

	{#if loading}
		<div class="h-6 w-6 animate-spin rounded-full border-b-2 border-current"></div>
	{/if}

	{#if bookDetails.bookName && !loading}
		<div class="box-content flex h-auto w-[500px] flex-col gap-2">
			<img
				src={bookDetails.image}
				alt={bookDetails.bookName}
				class="h-[300px] w-[500px] object-cover"
			/>

			<button
				onclick={() => googleSearch(bookDetails.bookName)}
				class="cursor-pointer text-left text-3xl text-[#4B4B47] hover:text-orange-500 hover:underline"
				>{bookDetails.bookName}</button
			>

			<button
				class="cursor-pointer text-left text-lg text-[#4B4B47] hover:text-orange-500 hover:underline"
				onclick={() => googleSearch(bookDetails.author)}>{bookDetails.author}</button
			>
			<p class=" text-sm tracking-wider">{bookDetails?.des}</p>
			<div class="flex justify-between py-3">
				{#if bookDetails.real_life_location.length > 0}
					<div>
						<h3 class="text-lg text-[#]">Real Life Locations</h3>
						<ul class="list-disc">
							{#each bookDetails.real_life_location as location}
								<li>
									<button
										class="cursor-pointer hover:text-orange-500 hover:underline"
										onclick={() => googleSearch(location)}
									>
										{location}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
				{#if bookDetails.fictional_location.length > 0}
					<div>
						<h3 class="text-lg text-[#4B4B47]">Fictional Locations</h3>
						<ul class="list-disc">
							{#each bookDetails.fictional_location as location}
								<li>
									<button
										class="cursor-pointer hover:text-orange-500 hover:underline"
										onclick={() => googleSearch(location)}
									>
										{location}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- {#if locationDetails.length > 0 && !loading}
		<div id="location_details" class="flex flex-col gap-3">
			{#each locationDetails as locationDetail}
				<div class="box-content flex h-[360px] w-[470px] flex-col gap-2 rounded-lg border-2 p-6">
					<img
						src={locationDetail.originalimage?.source}
						alt={locationDetail.title}
						class="h-[50%] w-[100%] object-cover"
					/>
					<a
						class="text-[#4B4B47] hover:underline"
						href={locationDetail.content_urls.desktop.page}
						target="_blank">{locationDetail.title}</a
					>
					<p class="line-clamp-5">{locationDetail.extract}</p>
				</div>
			{/each}
		</div>
	{/if} -->
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
