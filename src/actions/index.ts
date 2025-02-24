import * as CallActions from "./calls";
import * as StreamActions from "./stream";
import * as MemberActions from "./members";
import * as ConnectionActions from "./connection";

export const server = {
  calls: { ...CallActions },
  stream: { ...StreamActions },
  members: { ...MemberActions },
  connections: { ...ConnectionActions },
};
