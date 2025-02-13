import type { CALL_SCENE } from "@prisma/client";

export const scrollShadowClasses = `
relative

after:h-6
after:z-10
after:w-full
after:left-0
after:right-0
after:bottom-0
after:absolute
after:content-['']
after:to-background
after:from-transparent
after:bg-gradient-to-b
after:pointer-events-none
		`
  .split("\n")
  .join(" ");

export const SceneGrids: Record<CALL_SCENE, string> = {
  spotlight: "grid-template-areas: 'A';",
  countdown: "grid-template-areas: 'A';",
  twoUp:
    "grid-template-areas: 'A B';  grid-template-columns: repeat(2, minmax(0, 1fr));",
  threeUp:
    "grid-template-areas: 'A B C'; grid-template-columns: repeat(3, minmax(0, 1fr));",
  fourUp:
    "grid-template-areas: 'A B' 'C D'; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr));",
  pull: "grid-template-areas: 'A A A B'; grid-template-columns: repeat(4, minmax(0, 1fr));",
  splash: "grid-template-areas: 'A';",
};
