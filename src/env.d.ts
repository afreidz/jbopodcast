import type { UsersRecord } from "@pocketbase/types";

declare global {
  namespace App {
    interface Locals {
      user?: UsersRecord;
    }
  }
