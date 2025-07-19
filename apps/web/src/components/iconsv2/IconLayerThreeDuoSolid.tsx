// duo-solid/security
import type { Component, JSX } from "solid-js"

export const IconLayerThreeDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 12c-.12.254-.49.441-1.233.816l-6.325 3.196c-.529.267-.793.4-1.07.453a2 2 0 0 1-.743 0c-.278-.052-.542-.186-1.07-.453l-6.326-3.196C3.49 12.441 3.119 12.254 3 12m18 4.5c-.12.254-.49.441-1.233.816l-6.325 3.196c-.529.267-.793.4-1.07.453a2 2 0 0 1-.743 0c-.278-.052-.542-.186-1.07-.453l-6.326-3.196C3.49 16.941 3.119 16.754 3 16.5"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12.543 2.048a3.1 3.1 0 0 0-1.086 0c-.41.073-.789.252-1.226.46L3.835 5.531c-.336.159-.647.306-.884.445-.228.133-.571.359-.768.75a1.72 1.72 0 0 0 0 1.545c.197.392.54.618.768.751.237.14.548.286.884.445l6.396 3.025c.437.207.816.386 1.226.46.359.063.727.063 1.086 0 .41-.074.789-.253 1.226-.46l6.396-3.025c.336-.159.647-.306.884-.445.228-.133.571-.359.768-.75a1.72 1.72 0 0 0 0-1.545c-.197-.392-.54-.618-.768-.751-.237-.14-.548-.286-.884-.445l-6.396-3.025c-.437-.207-.816-.386-1.226-.46Z"
			/>
		</svg>
	)
}

export default IconLayerThreeDuoSolid
