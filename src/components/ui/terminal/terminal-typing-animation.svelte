<!--
	jsrepo 1.41.2
	Installed from github/ieedan/shadcn-svelte-extras
	2-26-2025
-->

<script lang="ts">
	import { cn } from '../../../blocks/utils/utils';
	import { onDestroy } from 'svelte';
	import { useAnimation } from './terminal.svelte.js';
	import type { TerminalAnimationProps } from './types';
	import { typewriter } from '../../../blocks/actions/typewriter.svelte';

	let { children, delay = 0, class: className }: TerminalAnimationProps = $props();

	let playAnimation = $state(false);
	let animationSpeed = $state(1);

	const play = (speed: number) => {
		playAnimation = true;
		animationSpeed = speed;
	};

	const animation = useAnimation({ delay, play });

	onDestroy(() => animation.dispose());
</script>

{#if playAnimation}
	<span
		class={cn('block', className)}
		transition:typewriter={{
			speed: animationSpeed * 2,
			onComplete: () => animation.onComplete?.()
		}}
	>
		{@render children?.()}
	</span>
{/if}
