import type { TypedPocketBase } from "@pocketbase/types";

declare namespace App {
  interface Locals {
    client: TypedPocketBase;
  }
}
