import type { Element, ElementContent, Text } from "hast"
import type { Schema } from "property-information"
import type { Component, JSX } from "solid-js"
import type { Position } from "unist"

/* File for types which are not handled correctly in JSDoc mode */

export interface SolidMarkdownProps {
	node: Element
	children: Component[]
	/**
	 * Passed when `options.rawSourcePos` is given
	 */
	sourcePosition?: Position
	/**
	 * Passed when `options.includeElementIndex` is given
	 */
	index?: number
	/**
	 * Passed when `options.includeElementIndex` is given
	 */
	siblingCount?: number
}

export type NormalComponents = {
	[TagName in keyof JSX.IntrinsicElements]:
		| keyof JSX.IntrinsicElements
		| Component<JSX.IntrinsicElements[TagName] & SolidMarkdownProps>
}
export type Raw = {
	type: "raw"
	value: string
}
export type Context = {
	options: Options
	schema: Schema
	listDepth: number
}
type TransformLink = (href: string, children: ElementContent[], title?: string) => string
type TransformImage = (src: string, alt: string, title?: string) => string
type TransformLinkTargetType = "_self" | "_blank" | "_parent" | "_top" | (string & {})
type TransformLinkTarget = (
	href: string,
	children: ElementContent[],
	title?: string,
) => TransformLinkTargetType | undefined
export type SolidMarkdownNames = keyof JSX.IntrinsicElements
type CodeComponent = Component<JSX.IntrinsicElements["code"] & SolidMarkdownProps & { inline?: boolean }>
type HeadingComponent = Component<JSX.IntrinsicElements["h1"] & SolidMarkdownProps & { level: number }>
type LiComponent = Component<
	JSX.IntrinsicElements["li"] &
		SolidMarkdownProps & {
			checked: boolean | null
			index: number
			ordered: boolean
		}
>
type OrderedListComponent = Component<
	JSX.IntrinsicElements["ol"] & SolidMarkdownProps & { depth: number; ordered: true }
>
type TableCellComponent = Component<
	JSX.IntrinsicElements["table"] &
		SolidMarkdownProps & { style?: Record<string, unknown>; isHeader: boolean }
>
type TableRowComponent = Component<JSX.IntrinsicElements["tr"] & SolidMarkdownProps & { isHeader: boolean }>
type UnorderedListComponent = Component<
	JSX.IntrinsicElements["ul"] & SolidMarkdownProps & { depth: number; ordered: false }
>
type SpecialComponents = {
	code: CodeComponent | SolidMarkdownNames
	h1: HeadingComponent | SolidMarkdownNames
	h2: HeadingComponent | SolidMarkdownNames
	h3: HeadingComponent | SolidMarkdownNames
	h4: HeadingComponent | SolidMarkdownNames
	h5: HeadingComponent | SolidMarkdownNames
	h6: HeadingComponent | SolidMarkdownNames
	li: LiComponent | SolidMarkdownNames
	ol: OrderedListComponent | SolidMarkdownNames
	td: TableCellComponent | SolidMarkdownNames
	th: TableCellComponent | SolidMarkdownNames
	tr: TableRowComponent | SolidMarkdownNames
	ul: UnorderedListComponent | SolidMarkdownNames
}
export type Components = Omit<
	Partial<Omit<NormalComponents, keyof SpecialComponents>> & Partial<SpecialComponents>,
	"text"
> & {
	text?: Component<{
		node: Text
	}>
}

export type Options = {
	sourcePos: boolean
	rawSourcePos: boolean
	skipHtml: boolean
	includeElementIndex: boolean
	transformLinkUri: null | false | TransformLink
	transformImageUri?: TransformImage
	linkTarget: TransformLinkTargetType | TransformLinkTarget
	components: Components
}
