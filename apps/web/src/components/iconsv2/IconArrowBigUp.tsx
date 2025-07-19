// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigUp: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				fill-rule="evenodd"
				d="M19.804 9.208a1 1 0 0 1-.92 1.588q-1.439-.166-2.884-.264v8.896c0 .253 0 .5-.017.707a2 2 0 0 1-.201.77 2 2 0 0 1-.874.874 2 2 0 0 1-.77.2 9 9 0 0 1-.706.018h-2.864c-.252 0-.498 0-.706-.017a2 2 0 0 1-.77-.2 2 2 0 0 1-.874-.875 2 2 0 0 1-.201-.77C8 19.926 8 19.68 8 19.427v-8.895q-1.446.098-2.885.264a1 1 0 0 1-.919-1.588 36.3 36.3 0 0 1 6.486-6.744 2.11 2.11 0 0 1 2.636 0 36.3 36.3 0 0 1 6.486 6.744Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowBigUp
