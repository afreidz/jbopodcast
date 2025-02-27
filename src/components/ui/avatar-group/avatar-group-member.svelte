<!--
	jsrepo 1.41.2
	Installed from github/ieedan/shadcn-svelte-extras
	2-27-2025
-->

<script lang="ts">
	import AvatarRoot from '../avatar/avatar.svelte';
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import { cn } from '../../../blocks/utils/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AvatarPrimitive.RootProps = $props();
</script>

<AvatarRoot bind:ref class={cn('bg-accent ring-2 ring-background', className)} {...restProps} />
