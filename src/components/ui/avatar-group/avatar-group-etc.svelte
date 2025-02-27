<!--
	jsrepo 1.41.2
	Installed from github/ieedan/shadcn-svelte-extras
	2-27-2025
-->

<script lang="ts">
	import { cn } from '../../../blocks/utils/utils';

	type Props = {
		class?: string;
		plus: number;
	};

	let { plus, class: className }: Props = $props();
</script>

<div
	class={cn(
		'relative flex size-10 items-center justify-center rounded-full bg-accent text-sm ring-2 ring-background',
		className
	)}
>
	<span>+{plus}</span>
</div>
