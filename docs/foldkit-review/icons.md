# Foldkit review: icon accessibility

Status: applied (2026-10-15), after the legacy React app and the parity harness were deleted.

## Rules

- **Decorative by default.** A Nucleo icon (`apps/web-foldkit/src/icons/index.ts`) renders
  `aria-hidden="true"` and no `<title>`. Passing `title` names it instead: the svg gets `role="img"`
  and a `<title>`. The 32 legacy `badge 13` titles and the file-name titles (`dots`, `close`,
  `chevron-down`, ...) are gone.
- **Every icon-only control has an `aria-label`.** Icon-plus-text controls need nothing; their text
  is the whole name ("Channels", "Browse channels", "Hazel Labs").

## Icon-only controls labelled in this change

| Where | Label |
| --- | --- |
| `shell/channels-sidebar/tree.ts` `dotsMenuTrigger`, `menus.ts` row menu | `Channel options` / `Conversation options` |
| `shell/channels-sidebar/tree.ts` `sectionPlusButton` | the action's words (`Create new channel`, `Join existing channel`, `Start a conversation`) |
| `shell/channels-sidebar/menus.ts` section "+" menu | `Section actions` |
| `shell/channels-sidebar/create-channel-hint.ts` | `Dismiss` |
| `shell/mobile.ts` `mobileMenuButton` | `Open sidebar` |
| `chat/image-viewer.ts` toolbar | `Download`, `Copy image URL`, `Open in browser`, `Close` |
| `composer/draft-view.ts` attachment preview | `Remove <file name>` |
| `page/home/view.ts` member row | `Message <name>` |
| `page/settings/invitations/view.ts` row menu | `Invitation actions` |
| `page/settings/custom-emojis/view.ts` | `Delete :<name>:` |
| `page/settings/chat-sync/view.ts` | `Delete connection` |
| `page/channel-settings/overview/view.ts` | `Change channel icon`, `Remove channel icon` |
| `page/channel-settings/connect/share-modal-view.ts` | `Clear workspace` |
| `page/channel-settings/integrations/row-menu.ts` | `Subscription actions` |
| `page/channel-settings/integrations/webhooks.ts` | `Copy webhook URL` |
| `page/channel-settings/integrations/token-display.ts` | `Copy token`, `Copy URL` |
| `page/channel-settings/integrations/provider-card.ts` | `Copy URL`, `URL info` |
| `ui/command-menu-form.ts` back button | `Back` |

Buttons that already carried a label keep it ("Add reaction", "More actions", "Call", "Close thread",
"Remove invite", "Clear search", "Previous image", ...).
