<script lang="ts">
	const { message, targetElement, parentElement } = $props<{
		message: string;
		targetElement: HTMLElement | null;
		parentElement: HTMLElement | null;
	}>();

	let errorDiv: HTMLDivElement;

	$effect(() => {
		if (targetElement && parentElement) {
			const inputRect = targetElement.getBoundingClientRect();
			const parentRect = parentElement.getBoundingClientRect();

			errorDiv.style.left = `${inputRect.left - parentRect.left}px`;
			errorDiv.style.top = `${inputRect.height + 16 + 4}px`;
		}
	});
</script>

<div bind:this={errorDiv} class="error-message" role="alert">
	{message}
</div>

<style>
	.error-message {
		position: absolute;
		background: #e24a4a;
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 14px;
		z-index: 1000;
		white-space: nowrap;
		pointer-events: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
</style>
