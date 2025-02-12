export const scrollShadowClasses = `
relative

before:h-6
before:z-10
before:top-0
before:w-full
before:left-0
before:right-0
before:absolute
before:content-['']
before:to-transparent
before:from-background
before:bg-gradient-to-b
before:pointer-events-none

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
