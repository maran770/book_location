<script>
	const { text, children } = $props();
</script>

<a href={`https://www.google.com/search?q=${text}`} target="_blank">
	{@render children?.()}
</a>
