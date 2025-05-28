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
import type * as channelMembers from "../channelMembers.js";
import type * as lib_user from "../lib/user.js";
import type * as messages from "../messages.js";
import type * as middleware_authenticated from "../middleware/authenticated.js";
import type * as pinnedMessages from "../pinnedMessages.js";
import type * as reactions from "../reactions.js";
import type * as serverChannels from "../serverChannels.js";
import type * as serverMembers from "../serverMembers.js";
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
  channelMembers: typeof channelMembers;
  "lib/user": typeof lib_user;
  messages: typeof messages;
  "middleware/authenticated": typeof middleware_authenticated;
  pinnedMessages: typeof pinnedMessages;
  reactions: typeof reactions;
  serverChannels: typeof serverChannels;
  serverMembers: typeof serverMembers;
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
