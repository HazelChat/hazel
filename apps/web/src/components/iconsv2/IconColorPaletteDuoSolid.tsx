// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconColorPaletteDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M12.536 1.515c-5.772-.307-10.742 4.16-11.05 9.932s4.16 10.742 9.933 11.05c1.148.06 2.024-.614 2.426-1.462.424-.892.339-2.064-.339-2.816-.152-.168-.156-.565.083-.78.11-.098.32-.182.784-.175.516.008 1.026.108 1.54.135 3.448.184 6.422-2.488 6.606-5.936v-.006c.25-5.238-4.36-9.643-9.983-9.942Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M10.249 7.263a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" />
			<path fill="currentColor" d="M5.479 11a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" />
			<path fill="currentColor" d="M16.723 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
		</svg>
	)
}

export default IconColorPaletteDuoSolid
