<!--
	jsrepo 1.41.2
	Installed from github/ieedan/shadcn-svelte-extras
	2-27-2025
-->

<script lang="ts">
	import { cn } from '../../../blocks/utils/utils';
	import type { WithChildren } from 'bits-ui';

	type Props = WithChildren<{
		class?: string;
		orientation?: 'vertical' | 'horizontal';
	}>;

	let { orientation = 'horizontal', class: className, children }: Props = $props();
</script>

<div
	data-orientation={orientation}
	class={cn(
		'group/avatar-group flex items-center data-[orientation="horizontal"]:flex-row data-[orientation="vertical"]:flex-col data-[orientation="horizontal"]:-space-x-2 data-[orientation="vertical"]:-space-y-2',
		className
	)}
>
	{@render children?.()}
</div>
