<script lang="ts" module>
  import { z } from "astro:schema";

  const SplashSchema = z.object({
    type: z.literal("splash"),
    image: z.string().url(),
    label: z.string().min(1).max(25).optional(),
  });

  const CountdownSchema = z.object({
    type: z.literal("countdown"),
    duration: z.number(),
    label: z.string().min(1).max(25).optional(),
  });

  const SpotlightSchema = z.object({
    type: z.literal("spotlight"),
    A: z.string(),
    label: z.string().min(1).max(25).optional(),
  });

  const TwoUpSchema = z.object({
    type: z.literal("two-up"),
    A: z.string(),
    B: z.string(),
    label: z.string().min(1).max(25).optional(),
  });

  const ThreeUpSchema = z.object({
    type: z.literal("three-up"),
    A: z.string(),
    B: z.string(),
    C: z.string(),
    label: z.string().min(1).max(25).optional(),
  });

  const FourUpSchema = z.object({
    type: z.literal("four-up"),
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
    label: z.string().min(1).max(25).optional(),
  });

  const PullSchema = z.object({
    type: z.literal("pull"),
    A: z.string(),
    B: z.array(z.string()),
    label: z.string().min(1).max(25).optional(),
  });

  const CallConfigSchema = z.object({
    scenes: z.array(
      PullSchema.or(SpotlightSchema)
        .or(TwoUpSchema)
        .or(SplashSchema)
        .or(FourUpSchema)
        .or(ThreeUpSchema)
        .or(CountdownSchema)
    ),
  });

  type Pull = z.infer<typeof PullSchema>;
  type TwoUp = z.infer<typeof TwoUpSchema>;
  type Splash = z.infer<typeof SplashSchema>;
  type FourUp = z.infer<typeof FourUpSchema>;
  type ThreeUp = z.infer<typeof ThreeUpSchema>;
  type Spotlight = z.infer<typeof SpotlightSchema>;
  type Countdown = z.infer<typeof CountdownSchema>;

  export type CallConfig = z.infer<typeof CallConfigSchema>;
  export type Scenes =
    | Pull
    | TwoUp
    | FourUp
    | Splash
    | ThreeUp
    | Countdown
    | Spotlight;
</script>

<script lang="ts">
  import SplashImage from "lucide-svelte/icons/image";
  import { scrollShadowClasses } from "$/lib/classes";
  import { ScrollArea } from "$/components/ui/scroll-area";

  type Props = {
    scenes?: Scenes[];
  };

  let { scenes = $bindable([]) }: Props = $props();
</script>

{#snippet Spotlight()}
  <div class="p-1 w-28 aspect-video">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input"
      style="grid-template-areas: 'A';"
    >
      <i class="bg-background">&nbsp;</i>
    </div>
  </div>
{/snippet}

{#snippet TwoUp()}
  <div class="p-1 w-28 aspect-video">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input grid-cols-2"
      style="grid-template-areas: 'A B';"
    >
      <i class="bg-background">&nbsp;</i>
      <i class="bg-background">&nbsp;</i>
    </div>
  </div>
{/snippet}

{#snippet ThreeUp()}
  <div class="p-1 w-28 aspect-video">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input grid-cols-3"
      style="grid-template-areas: 'A B C';"
    >
      <i class="bg-background">&nbsp;</i>
      <i class="bg-background">&nbsp;</i>
      <i class="bg-background">&nbsp;</i>
    </div>
  </div>
{/snippet}

{#snippet FourUp()}
  <div class="p-1 w-28 aspect-video">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input grid-cols-2 grid-rows-2"
      style="grid-template-areas: 'A B' 'C D';"
    >
      <i class="bg-background">&nbsp;</i>
      <i class="bg-background">&nbsp;</i>
      <i class="bg-background">&nbsp;</i>
      <i class="bg-background">&nbsp;</i>
    </div>
  </div>
{/snippet}

{#snippet Pull()}
  <div class="p-1 w-28 aspect-video">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input grid-cols-4"
      style="grid-template-areas: 'A A A B';"
    >
      <i class="bg-background" style="grid-area: A;">&nbsp;</i>
      <div class="bg-background p-1 flex flex-col gap-1 items-center">
        <i class="border rounded-sm size-3">&nbsp;</i>
        <i class="border rounded-sm size-3">&nbsp;</i>
        <i class="border rounded-sm size-3">&nbsp;</i>
      </div>
    </div>
  </div>
{/snippet}

{#snippet Countdown()}
  <div class="p-1 w-28 aspect-video">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input"
      style="grid-template-areas: 'A';"
    >
      <i
        class="bg-background flex items-center justify-center text-xs font-bold text-input"
        >00:10</i
      >
    </div>
  </div>
{/snippet}

{#snippet Splash()}
  <div class="p-1 w-28 aspect-video">
    <div
      class="size-full grid border rounded-md overflow-clip gap-px bg-input"
      style="grid-template-areas: 'A';"
    >
      <i
        class="bg-background flex items-center justify-center text-xs font-bold text-input"
      >
        <SplashImage size={30} strokeWidth={1} />
      </i>
    </div>
  </div>
{/snippet}

<div class="rounded-md border flex">
  <ScrollArea
    class="border-r p-4 flex-1 flex flex-col h-[400px] {scrollShadowClasses}"
  >
    <button
      class="flex gap-6 items-center hover:bg-input ring-input w-full p-1 rounded-md overflow-clip"
    >
      {@render Spotlight()}
      <strong>Spotlight</strong>
    </button>
    <button
      class="flex gap-6 items-center hover:bg-input ring-input w-full p-1 rounded-md overflow-clip"
    >
      {@render TwoUp()}
      <strong>Two Up</strong>
    </button>
    <button
      class="flex gap-6 items-center hover:bg-input ring-input w-full p-1 rounded-md overflow-clip"
    >
      {@render ThreeUp()}
      <strong>Three Up</strong>
    </button>
    <button
      class="flex gap-6 items-center hover:bg-input ring-input w-full p-1 rounded-md overflow-clip"
    >
      {@render FourUp()}
      <strong>Four Up</strong>
    </button>
    <button
      class="flex gap-6 items-center hover:bg-input ring-input w-full p-1 rounded-md overflow-clip"
    >
      {@render Pull()}
      <strong>Pull One</strong>
    </button>
    <button
      class="flex gap-6 items-center hover:bg-input ring-input w-full p-1 rounded-md overflow-clip"
    >
      {@render Countdown()}
      <strong>Countdown</strong>
    </button>
    <button
      class="flex gap-6 items-center hover:bg-input ring-input w-full p-1 rounded-md overflow-clip"
    >
      {@render Splash()}
      <strong>Splash Screen</strong>
    </button>
  </ScrollArea>
  <article class="flex-[2]"></article>
</div>
