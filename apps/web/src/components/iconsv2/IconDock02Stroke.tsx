// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconDock02Stroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 15H3m2.8-4h.4c.28 0 .42 0 .527-.055a.5.5 0 0 0 .218-.218C7 10.62 7 10.48 7 10.2v-.4c0-.28 0-.42-.054-.527a.5.5 0 0 0-.219-.218C6.62 9 6.48 9 6.2 9h-.4c-.28 0-.42 0-.527.055a.5.5 0 0 0-.218.218C5 9.38 5 9.52 5 9.8v.4c0 .28 0 .42.054.527a.5.5 0 0 0 .219.218C5.38 11 5.52 11 5.8 11Zm6 0h.4c.28 0 .42 0 .527-.055a.5.5 0 0 0 .218-.218C13 10.62 13 10.48 13 10.2v-.4c0-.28 0-.42-.055-.527a.5.5 0 0 0-.218-.218C12.62 9 12.48 9 12.2 9h-.4c-.28 0-.42 0-.527.055a.5.5 0 0 0-.218.218C11 9.38 11 9.52 11 9.8v.4c0 .28 0 .42.055.527a.5.5 0 0 0 .218.218c.107.055.247.055.527.055Zm6 0h.4c.28 0 .42 0 .527-.055a.5.5 0 0 0 .218-.218C19 10.62 19 10.48 19 10.2v-.4c0-.28 0-.42-.055-.527a.5.5 0 0 0-.218-.218C18.62 9 18.48 9 18.2 9h-.4c-.28 0-.42 0-.527.055a.5.5 0 0 0-.218.218C17 9.38 17 9.52 17 9.8v.4c0 .28 0 .42.055.527a.5.5 0 0 0 .218.218c.107.055.247.055.527.055Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconDock02Stroke
