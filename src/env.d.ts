declare namespace App {
  interface Locals {
    user: {
      id: string;
      email: string;
      name?: string | null;
      handle?: string | null;
      role: import("@prisma/client").MEMBER_ROLE;
    };
  }
}
