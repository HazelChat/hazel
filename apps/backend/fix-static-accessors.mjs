import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const serviceMap = {
	'AttachmentPolicy': 'attachmentPolicy',
	'MessagePolicy': 'messagePolicy',
	'ChannelPolicy': 'channelPolicy',
	'ChannelMemberPolicy': 'channelMemberPolicy',
	'ChannelSectionPolicy': 'channelSectionPolicy',
	'OrganizationPolicy': 'organizationPolicy',
	'OrganizationMemberPolicy': 'organizationMemberPolicy',
	'InvitationPolicy': 'invitationPolicy',
	'MessageReactionPolicy': 'messageReactionPolicy',
	'NotificationPolicy': 'notificationPolicy',
	'PinnedMessagePolicy': 'pinnedMessagePolicy',
	'TypingIndicatorPolicy': 'typingIndicatorPolicy',
	'UserPolicy': 'userPolicy',
	'UserPresenceStatusPolicy': 'userPresenceStatusPolicy',
	'IntegrationConnectionPolicy': 'integrationConnectionPolicy',
	'ChannelWebhookPolicy': 'channelWebhookPolicy',
	'GitHubSubscriptionPolicy': 'gitHubSubscriptionPolicy',
	'RssSubscriptionPolicy': 'rssSubscriptionPolicy',
	'BotPolicy': 'botPolicy',
	'CustomEmojiPolicy': 'customEmojiPolicy',
	'AttachmentRepo': 'attachmentRepo',
	'MessageRepo': 'messageRepo',
	'ChannelRepo': 'channelRepo',
	'ChannelMemberRepo': 'channelMemberRepo',
	'ChannelSectionRepo': 'channelSectionRepo',
	'OrganizationRepo': 'organizationRepo',
	'OrganizationMemberRepo': 'organizationMemberRepo',
	'InvitationRepo': 'invitationRepo',
	'UserRepo': 'userRepo',
	'PinnedMessageRepo': 'pinnedMessageRepo',
	'TypingIndicatorRepo': 'typingIndicatorRepo',
	'NotificationRepo': 'notificationRepo',
	'MessageReactionRepo': 'messageReactionRepo',
	'MessageOutboxRepo': 'messageOutboxRepo',
	'UserPresenceStatusRepo': 'userPresenceStatusRepo',
	'IntegrationConnectionRepo': 'integrationConnectionRepo',
	'IntegrationTokenRepo': 'integrationTokenRepo',
	'ChannelWebhookRepo': 'channelWebhookRepo',
	'GitHubSubscriptionRepo': 'gitHubSubscriptionRepo',
	'RssSubscriptionRepo': 'rssSubscriptionRepo',
	'BotRepo': 'botRepo',
	'BotCommandRepo': 'botCommandRepo',
	'BotInstallationRepo': 'botInstallationRepo',
	'CustomEmojiRepo': 'customEmojiRepo',
	'ConnectConversationRepo': 'connectConversationRepo',
	'ConnectConversationChannelRepo': 'connectConversationChannelRepo',
	'ConnectInviteRepo': 'connectInviteRepo',
	'ConnectParticipantRepo': 'connectParticipantRepo',
	'ChatSyncConnectionRepo': 'chatSyncConnectionRepo',
	'ChatSyncChannelLinkRepo': 'chatSyncChannelLinkRepo',
	'ChatSyncMessageLinkRepo': 'chatSyncMessageLinkRepo',
	'ChatSyncEventReceiptRepo': 'chatSyncEventReceiptRepo',
	'ChannelAccessSyncService': 'channelAccessSync',
	'DiscordSyncWorker': 'discordSyncWorker',
	'ConnectConversationService': 'connectConversationService',
};

// Skip these patterns (they're not static accessor calls)
const skipPatterns = ['layer', 'toLayer', 'Default', 'make', 'of('];

function processFile(filePath) {
	let content = readFileSync(filePath, 'utf8');
	const originalContent = content;

	// Find all static accessor usages
	const usedServices = new Set();
	for (const [className, varName] of Object.entries(serviceMap)) {
		// Match ClassName.something where something starts with lowercase
		// and is not a known non-accessor pattern
		const regex = new RegExp(`(?<!import.*|from.*|//.*|yield\\* )${className}\\.(?!layer|toLayer|Default|make\\b|of\\()([a-z])`, 'gm');
		if (regex.test(content)) {
			// Also check that we're not already yielding it to a local var with same name
			if (!content.includes(`const ${varName} = yield* ${className}`)) {
				usedServices.add(className);
			}
			// Replace the static calls with instance calls
			const replaceRegex = new RegExp(`(?<!import .*|type .*)\\b${className}\\.(?!layer|toLayer|Default|make\\b|of\\()`, 'g');
			content = content.replace(replaceRegex, `${varName}.`);
		}
	}

	if (usedServices.size === 0) {
		if (content !== originalContent) {
			writeFileSync(filePath, content, 'utf8');
			console.log(`Updated references in: ${filePath}`);
		}
		return;
	}

	// Find the first Effect.gen pattern where we should add yields
	// Look for the outermost Effect.gen(function* () { that has yields after it
	const genRegex = /Effect\.gen\(function\* \(\) \{\n((?:\s*(?:const \w+ = yield\* [^\n]+|\/\/[^\n]*)\n)*)/;
	const match = content.match(genRegex);
	if (match) {
		const insertIdx = match.index + match[0].length;
		const existingYields = match[1] || '';

		// Determine indentation from existing yields
		const indentMatch = existingYields.match(/^(\s+)const/m);
		const indent = indentMatch ? indentMatch[1] : '\t\t';

		let additions = '';
		for (const className of usedServices) {
			const varName = serviceMap[className];
			if (!content.includes(`const ${varName} = yield* ${className}`)) {
				additions += `${indent}const ${varName} = yield* ${className}\n`;
			}
		}

		if (additions) {
			content = content.slice(0, insertIdx) + additions + content.slice(insertIdx);
		}
	}

	writeFileSync(filePath, content, 'utf8');
	console.log(`Fixed: ${filePath} (services: ${[...usedServices].join(', ')})`);
}

function walkDir(dir) {
	const entries = readdirSync(dir);
	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			walkDir(fullPath);
		} else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
			processFile(fullPath);
		}
	}
}

// Process RPC handlers
walkDir(resolve('src/rpc/handlers'));
// Process route files
walkDir(resolve('src/routes'));
// Process service files that use static accessors
walkDir(resolve('src/services'));
