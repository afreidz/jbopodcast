/*
	jsrepo 1.41.2
	Installed from github/ieedan/shadcn-svelte-extras
	2-27-2025
*/

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
