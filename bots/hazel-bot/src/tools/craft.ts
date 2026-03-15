import { Tool } from "effect/unstable/ai"
import { Schema } from "effect"

export const CraftSearchDocuments = Tool.make("craft_search_documents", {
	description: "Search across all documents in the connected Craft space",
	parameters: {
		query: Schema.String.annotate({ description: "Search query text" }),
	},
	success: Schema.Unknown,
})

export const CraftGetDocument = Tool.make("craft_get_document", {
	description: "Fetch the content blocks of a Craft document by its ID",
	parameters: {
		documentId: Schema.String.annotate({ description: "The document ID to fetch" }),
	},
	success: Schema.Unknown,
})

export const CraftCreateDocument = Tool.make("craft_create_document", {
	description: "Create a new Craft document. Use this after confirming with the user what you will create.",
	parameters: {
		title: Schema.String.annotate({ description: "Document title" }),
		content: Schema.optional(
			Schema.String.annotate({ description: "Initial text content for the document" }),
		),
		folderId: Schema.optional(
			Schema.String.annotate({ description: "Optional folder ID to create the document in" }),
		),
	},
	success: Schema.Unknown,
})

export const CraftInsertBlocks = Tool.make("craft_insert_blocks", {
	description: "Add content blocks to an existing Craft document",
	parameters: {
		documentId: Schema.String.annotate({ description: "The document ID to add blocks to" }),
		blocks: Schema.Array(
			Schema.Struct({
				type: Schema.String.annotate({
					description: 'Block type (e.g., "text")',
				}),
				content: Schema.optional(Schema.String.annotate({ description: "Block text content" })),
			}),
		).annotate({ description: "Array of blocks to insert" }),
		parentBlockId: Schema.optional(
			Schema.String.annotate({ description: "Optional parent block ID to nest under" }),
		),
	},
	success: Schema.Unknown,
})

export const CraftGetTasks = Tool.make("craft_get_tasks", {
	description: "List tasks from the connected Craft space",
	parameters: {
		scope: Schema.optional(
			Schema.Literals(["inbox", "active", "upcoming", "logbook"]).annotate({
				description: "Task scope filter (inbox, active, upcoming, or logbook)",
			}),
		),
	},
	success: Schema.Unknown,
})

export const CraftCreateTask = Tool.make("craft_create_task", {
	description:
		"Create a task in the connected Craft space. Use this after confirming with the user what you will create.",
	parameters: {
		content: Schema.String.annotate({ description: "Task content/description" }),
		documentId: Schema.optional(
			Schema.String.annotate({ description: "Optional document ID to associate the task with" }),
		),
	},
	success: Schema.Unknown,
})

export const CraftGetFolders = Tool.make("craft_get_folders", {
	description: "List all folders in the connected Craft space",
	success: Schema.Unknown,
})

export const CraftSearchBlocks = Tool.make("craft_search_blocks", {
	description: "Search within a specific Craft document for matching blocks",
	parameters: {
		documentId: Schema.String.annotate({ description: "The document ID to search within" }),
		query: Schema.String.annotate({ description: "Search query text" }),
	},
	success: Schema.Unknown,
})

/** All Craft tool definitions for use in Toolkit.make() */
export const AllCraftTools = [
	CraftSearchDocuments,
	CraftGetDocument,
	CraftCreateDocument,
	CraftInsertBlocks,
	CraftGetTasks,
	CraftCreateTask,
	CraftGetFolders,
	CraftSearchBlocks,
] as const
