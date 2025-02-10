import * as CallActions from "./calls";
import * as MemberActions from "./members";

export const server = {
  calls: { ...CallActions },
  members: { ...MemberActions },
};
