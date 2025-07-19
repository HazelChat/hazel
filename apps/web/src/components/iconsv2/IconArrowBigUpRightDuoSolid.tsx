// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigUpRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="m4.529 13.815-.023.023a9 9 0 0 0-.487.511 2 2 0 0 0-.403.687 2 2 0 0 0 0 1.236c.095.29.254.511.403.686.135.16.309.333.487.512l.023.022 1.98 1.98.022.023c.178.178.352.352.51.487.176.148.398.308.688.402.402.13.834.13 1.236 0 .29-.094.512-.254.686-.402.16-.135.333-.309.512-.487l.022-.023 7.02-7.02a1 1 0 0 0 .034-1.378 62 62 0 0 0-4.312-4.312 1 1 0 0 0-1.38.034l-7.02 7.02z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M9.044 3.92a1 1 0 0 0-.473 1.772 59.8 59.8 0 0 1 9.737 9.736 1 1 0 0 0 1.773-.472c.464-3.104.526-6.248.182-9.355a2.106 2.106 0 0 0-1.864-1.864 36.3 36.3 0 0 0-9.355.182Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconArrowBigUpRightDuoSolid
