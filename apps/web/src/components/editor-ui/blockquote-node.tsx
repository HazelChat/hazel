"use client"

import { PlateElement, type PlateElementProps } from "platejs/react"

export function BlockquoteElement(props: PlateElementProps) {
	return (
		<PlateElement as="blockquote" className="relative my-1 pl-4 italic" {...props}>
			<span
				className="absolute top-0 left-0 h-full w-1 rounded-[2px] bg-brand-primary"
				aria-hidden="true"
			/>
			{props.children}
		</PlateElement>
	)
}
