// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconBagSackPouchDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.964 5.69q-.564 0-1.106.089c-3.99.648-6.697 4.628-7.365 8.344-.341 1.895-.191 3.882.694 5.504.909 1.668 2.536 2.839 4.881 3.13a32 32 0 0 0 7.864 0c2.235-.277 3.823-1.355 4.756-2.91.911-1.519 1.138-3.39.9-5.203-.466-3.568-2.82-7.435-6.389-8.607a6.9 6.9 0 0 0-2.162-.348z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12.888 3.5a2.98 2.98 0 0 1 2.47-.385l-1.075 2.689q.47.086.916.234.509.167.983.404l1.41-3.526a1 1 0 0 0-.556-1.3l-.65-.26a4.97 4.97 0 0 0-4.607.48 2.97 2.97 0 0 1-2.233.441l-.977-.195a1 1 0 0 0-1.11 1.387l1.167 2.627a7 7 0 0 1 2.012-.398l-.606-1.364a4.97 4.97 0 0 0 2.856-.834Z"
			/>
		</svg>
	)
}

export default IconBagSackPouchDuoSolid
