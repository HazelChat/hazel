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
	'ChannelAccessSyncService': 'channelAccessSync',
	'DiscordSyncWorker': 'discordSyncWorker',
	'ConnectConversationService': 'connectConversationService',
};

function processFile(filePath) {
	let content = readFileSync(filePath, 'utf8');
	const originalContent = content;

	// Find all static accessor usages
	const usedServices = new Set();
	for (const [className] of Object.entries(serviceMap)) {
		// Match ClassName.something where something starts with lowercase letter
		// Exclude: import lines, type annotations, .layer, .toLayer, .Default, .make
		const regex = new RegExp(`\\b${className}\\.(?!layer\\b|toLayer\\b|Default\\b|make\\b|of\\(|Schema\\b)[a-z]`);
		// Check in non-import, non-comment lines
		const lines = content.split('\n');
		for (const line of lines) {
			if (line.trimStart().startsWith('import ') || line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;
			if (line.includes('Effect.fn("')) continue; // Don't match inside string names
			if (regex.test(line)) {
				usedServices.add(className);
				break;
			}
		}
	}

	if (usedServices.size === 0) return;

	// Replace static calls with instance calls (skip strings and imports)
	for (const className of usedServices) {
		const varName = serviceMap[className];
		// Already yielded?
		if (content.includes(`const ${varName} = yield* ${className}`)) {
			// Just replace the static calls
			const lines = content.split('\n');
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].trimStart().startsWith('import ') || lines[i].trimStart().startsWith('//')) continue;
				if (lines[i].includes('Effect.fn("')) continue; // Don't touch string literals
				const re = new RegExp(`\\b${className}\\.(?!layer\\b|toLayer\\b|Default\\b|make\\b|of\\(|Schema\\b)`, 'g');
				lines[i] = lines[i].replace(re, `${varName}.`);
			}
			content = lines.join('\n');
		} else {
			// Need to add yield and replace calls
			const lines = content.split('\n');
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].trimStart().startsWith('import ') || lines[i].trimStart().startsWith('//')) continue;
				if (lines[i].includes('Effect.fn("')) continue;
				const re = new RegExp(`\\b${className}\\.(?!layer\\b|toLayer\\b|Default\\b|make\\b|of\\(|Schema\\b)`, 'g');
				lines[i] = lines[i].replace(re, `${varName}.`);
			}
			content = lines.join('\n');

			// Find the first Effect.gen to add yield
			const genRegex = /Effect\.gen\(function\* \(\) \{\n((?:\s*(?:const \w+ = yield\* [^\n]+|\/\/[^\n]*)\n)*)/;
			const match = content.match(genRegex);
			if (match) {
				const insertIdx = match.index + match[0].length;
				const existingContent = match[1] || '';
				const indentMatch = existingContent.match(/^(\s+)const/m);
				const indent = indentMatch ? indentMatch[1] : '\t\t';
				const addition = `${indent}const ${varName} = yield* ${className}\n`;
				content = content.slice(0, insertIdx) + addition + content.slice(insertIdx);
			}
		}
	}

	if (content !== originalContent) {
		writeFileSync(filePath, content, 'utf8');
		console.log(`Fixed: ${filePath} (services: ${[...usedServices].join(', ')})`);
	}
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

walkDir(resolve('src/rpc/handlers'));
walkDir(resolve('src/routes'));
walkDir(resolve('src/services'));
