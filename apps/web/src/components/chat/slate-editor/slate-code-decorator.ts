// IMPORTANT: prism-setup must be imported before any prismjs/components/*
// modules.  The language components are IIFEs that reference a bare `Prism`
// global; prism-setup ensures that global exists in production bundles.
import Prism from "./prism-setup"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-json"
import "prismjs/components/prism-python"
import "prismjs/components/prism-typescript"
import { Element, Node, type NodeEntry, type Range, Text } from "slate"
import { type CodeBlockElement, isCodeBlockElement } from "./types"

// Track which languages have been loaded to avoid duplicate imports
const loadedLanguages = new Set<string>(["bash", "javascript", "json", "python", "typescript", "js", "ts"])

// Map of language aliases and their import paths
const languageImports: Record<string, () => Promise<unknown>> = {
	c: () => import("prismjs/components/prism-c"),
	cpp: () => import("prismjs/components/prism-cpp"),
	csharp: () => import("prismjs/components/prism-csharp"),
	css: () => import("prismjs/components/prism-css"),
	diff: () => import("prismjs/components/prism-diff"),
	go: () => import("prismjs/components/prism-go"),
	graphql: () => import("prismjs/components/prism-graphql"),
	java: () => import("prismjs/components/prism-java"),
	jsx: () => import("prismjs/components/prism-jsx"),
	kotlin: () => import("prismjs/components/prism-kotlin"),
	markdown: () => import("prismjs/components/prism-markdown"),
	md: () => import("prismjs/components/prism-markdown"),
	php: () => import("prismjs/components/prism-php"),
	ruby: () => import("prismjs/components/prism-ruby"),
	rb: () => import("prismjs/components/prism-ruby"),
	rust: () => import("prismjs/components/prism-rust"),
	rs: () => import("prismjs/components/prism-rust"),
	scss: () => import("prismjs/components/prism-scss"),
	sql: () => import("prismjs/components/prism-sql"),
	swift: () => import("prismjs/components/prism-swift"),
	tsx: () => import("prismjs/components/prism-tsx"),
	yaml: () => import("prismjs/components/prism-yaml"),
	yml: () => import("prismjs/components/prism-yaml"),
}

/**
 * Dynamically load a Prism language component
 * Returns true if the language is now available, false otherwise
 */
export async function loadPrismLanguage(language: string): Promise<boolean> {
	const normalizedLang = language.toLowerCase()

	// Already loaded
	if (loadedLanguages.has(normalizedLang) || Prism.languages[normalizedLang]) {
		loadedLanguages.add(normalizedLang)
		return true
	}

	// Try to load the language
	const loader = languageImports[normalizedLang]
	if (loader) {
		try {
			await loader()
			loadedLanguages.add(normalizedLang)
			return true
		} catch {
			// Failed to load, will fall back to plaintext
			return false
		}
	}

	return false
}

// Flatten nested tokens into a single-level array with types
interface NormalizedToken {
	types: string[]
	content: string
}

function normalizeTokens(tokens: Array<string | Prism.Token>): NormalizedToken[] {
	const normalized: NormalizedToken[] = []

	function flatten(token: string | Prism.Token, types: string[] = []): void {
		if (typeof token === "string") {
			if (token.length > 0) {
				normalized.push({ types, content: token })
			}
		} else {
			const newTypes = types.concat(token.type)

			if (Array.isArray(token.content)) {
				for (const child of token.content) {
					flatten(child, newTypes)
				}
			} else {
				flatten(token.content, newTypes)
			}
		}
	}

	for (const token of tokens) {
		flatten(token)
	}

	return normalized
}

export function decorateCodeBlock([block, blockPath]: NodeEntry): Range[] {
	if (!Element.isElement(block) || !isCodeBlockElement(block)) {
		return []
	}

	const codeBlock = block as CodeBlockElement
	const language = codeBlock.language || "plaintext"
	const grammar = Prism.languages[language]

	if (!grammar) {
		return []
	}

	// Get all text from code block
	const text = codeBlock.children
		.map((line) => (Text.isText(line) ? line.text : Node.string(line)))
		.join("\n")

	// Tokenize with Prism
	const tokens = Prism.tokenize(text, grammar)
	const normalizedTokens = normalizeTokens(tokens)

	const decorations: any[] = []
	let offset = 0

	for (const token of normalizedTokens) {
		const length = token.content.length
		if (!length) continue

		const end = offset + length

		// Create decoration range with token types as properties
		const decoration: any = {
			anchor: { path: [...blockPath, 0, 0], offset },
			focus: { path: [...blockPath, 0, 0], offset: end },
			token: true,
		}

		// Add each token type as a property
		for (const type of token.types) {
			decoration[type] = true
		}

		decorations.push(decoration)
		offset = end
	}

	return decorations
}
