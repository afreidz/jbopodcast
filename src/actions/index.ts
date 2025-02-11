import * as CallActions from "./calls";
import * as MemberActions from "./members";
import * as ConnectionActions from "./connection";

export const server = {
  calls: { ...CallActions },
  members: { ...MemberActions },
  connections: { ...ConnectionActions },
};
