/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts from "../accounts.js";
import type * as channelMembers from "../channelMembers.js";
import type * as channels from "../channels.js";
import type * as lib_activeRecords_account from "../lib/activeRecords/account.js";
import type * as lib_activeRecords_customFunctions from "../lib/activeRecords/customFunctions.js";
import type * as lib_activeRecords_user from "../lib/activeRecords/user.js";
import type * as lib_utils from "../lib/utils.js";
import type * as messages from "../messages.js";
import type * as middleware_withAccount from "../middleware/withAccount.js";
import type * as middleware_withUser from "../middleware/withUser.js";
import type * as pinnedMessages from "../pinnedMessages.js";
import type * as reactions from "../reactions.js";
import type * as servers from "../servers.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  channelMembers: typeof channelMembers;
  channels: typeof channels;
  "lib/activeRecords/account": typeof lib_activeRecords_account;
  "lib/activeRecords/customFunctions": typeof lib_activeRecords_customFunctions;
  "lib/activeRecords/user": typeof lib_activeRecords_user;
  "lib/utils": typeof lib_utils;
  messages: typeof messages;
  "middleware/withAccount": typeof middleware_withAccount;
  "middleware/withUser": typeof middleware_withUser;
  pinnedMessages: typeof pinnedMessages;
  reactions: typeof reactions;
  servers: typeof servers;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
