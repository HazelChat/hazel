# Convex to TanStack DB Migration Tracker

## Migration Progress Summary

### ✅ Completed Migrations (15 queries)
- **Organizations**: 5 queries migrated
- **Channels**: 4 queries migrated (including chat-provider)
- **Users**: 3 queries migrated (all using `useUser()` hook)
- **Messages**: 1 query migrated (chat-provider messages query)
- **Pinned Messages**: 1 query migrated
- **Notifications**: 1 query migrated

### 🚧 Remaining Work
- **Message queries**: 3 queries
- **Channel relations**: 2 queries (favorites, threads)
- **Attachments/Social**: 2 queries
- **Real-time features**: 3 queries (typing indicator, presence - skipped for now)

## Query Migrations

### ✅ Easy - Direct Collection Queries (Start Here)

#### Organizations
- [x] `routes/_app/index.tsx:11` - `api.me.getOrganization` → `organizationMemberCollection` joined with `organizationCollection`
- [x] `routes/_app/onboarding.tsx:20` - `api.organizations.getUserOrganizations` → `organizationMemberCollection` joined with `organizationCollection`
- [x] `app-sidebar/sidebar-mobile.tsx:18` - `api.organizations.getOrganizationById` → `organizationCollection` by ID
- [x] `app-sidebar/workspace-switcher.tsx:26` - `api.organizations.getOrganizationById` → `organizationCollection` by ID
- [x] `app-sidebar/workspace-switcher.tsx:30` - `api.organizations.getUserOrganizations` → `organizationMemberCollection` joined with `organizationCollection`

#### Channels
- [x] `routes/_app/$orgId/chat/index.tsx:22` - `api.channels.getChannelsForOrganization` → `channelCollection` joined with `channelMemberCollection`
- [x] `notification-manager.tsx:19` - `api.channels.getChannelsForOrganization` → `channelCollection` joined with `channelMemberCollection`
- [x] `providers/chat-provider.tsx:96` - `api.channels.getChannel` → `channelCollection` by ID

#### Users
- [x] `routes/_app/$orgId/chat/index.tsx:23` - `api.me.getCurrentUser` → Using `useUser()` hook
- [x] `chat/message-item.tsx:74` - `api.me.getCurrentUser` → Using `useUser()` hook
- [x] `app-sidebar/channel-item.tsx:206` - `api.me.getCurrentUser` → Using `useUser()` hook
- [ ] `editor/editor-ui/mention-node.tsx:81` - `api.organizationMembers.getOrganizationMember` → `organizationMemberCollection` by ID

### 🔄 Medium - Queries with Joins/Relations

#### Messages
- [ ] `chat/message-reply-section.tsx:20` - `api.messages.getMessageById` → `messageCollection` by ID
- [ ] `chat/reply-indicator.tsx:17` - `api.messages.getMessageById` → `messageCollection` by ID
- [ ] `chat/thread-panel.tsx:24` - `api.messages.getMessageById` → `messageCollection` by ID
- [x] `providers/chat-provider.tsx:108` - `api.messages.getPinnedMessages` → `pinnedMessageCollection` with channel filter

#### Channels with Relations
- [ ] `chat/thread-panel.tsx:33` - `api.channels.getThreadChannel` → `channelCollection` with thread filter
- [ ] `app-sidebar/sidebar-favorite-group.tsx:14` - `api.channels.getFavoritedChannels` → `channelMemberCollection` with favorite filter
- [ ] `sidebar-favorite-group.tsx:14` - `api.channels.getFavoritedChannels` → `channelMemberCollection` with favorite filter

### 🔴 Complex - Real-time/Special Features

#### Attachments
- [ ] `chat/message-composer.tsx:37` - `api.attachments.getMessageAttachments` → `attachmentCollection` with message filter

#### Social
- [ ] `modals/create-dm-modal.tsx:44` - `api.social.getFriendsForOrganization` → Need to understand social schema

#### Real-time (Skip for now)
- [ ] `providers/chat-provider.tsx:113` - `api.typingIndicator.list` → Real-time feature
- [ ] `presence/presence-provider.tsx:66` - `api.me.getCurrentUser` → Presence system
- [ ] `presence/online-users-indicator.tsx:16` - `api.me.getCurrentUser` → Presence system

## Migration Pattern Examples

### Simple Collection Query
```typescript
// Before (Convex)
const organizationQuery = useQuery(convexQuery(api.me.getOrganization, {}))

// After (TanStack DB)
const { data: organization } = useLiveQuery(
  organizationCollection.where('userId', '==', currentUserId).findFirst()
)
```

### Query by ID
```typescript
// Before (Convex)
const { data } = useQuery(convexQuery(api.organizations.getOrganizationById, { organizationId }))

// After (TanStack DB)
const { data } = useLiveQuery(
  organizationCollection.findById(organizationId)
)
```

### Filtered Collection Query
```typescript
// Before (Convex)
const channelsQuery = useQuery(convexQuery(api.channels.getChannelsForOrganization, { organizationId }))

// After (TanStack DB)
const { data: channels } = useLiveQuery(
  channelCollection.where('organizationId', '==', organizationId).findMany()
)
```

## Files to Import Collections

All files will need to import from `~/db/collections`:
```typescript
import { 
  organizationCollection,
  channelCollection,
  messageCollection,
  userCollection,
  organizationMemberCollection,
  channelMemberCollection,
  pinnedMessageCollection,
  attachmentCollection
} from "~/db/collections"
```

## Migration Order

1. **Phase 1**: Simple organization queries (5 queries)
2. **Phase 2**: Simple channel queries (3 queries)
3. **Phase 3**: Simple user queries (4 queries)
4. **Phase 4**: Message queries (4 queries)
5. **Phase 5**: Complex channel queries (3 queries)
6. **Phase 6**: Attachments and social (2 queries)
7. **Phase 7**: Real-time features (3 queries) - Skip for now

Total: 24 queries (21 to migrate now, 3 to skip)