// duo-solid/general
import type { Component, JSX } from "solid-js"

export const IconNotebookDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M1.504 4.198C4.772 2.331 8.929 2.95 12 4.006c3.071-1.056 7.228-1.675 10.496.192a1 1 0 0 1 .504.869v15.5a1 1 0 0 1-1.394.919c-2.795-1.198-6.322-.38-9.192.924a1 1 0 0 1-.828 0c-2.87-1.304-6.398-2.122-9.192-.924A1 1 0 0 1 1 20.566v-15.5a1 1 0 0 1 .504-.868Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 21.504V5"
			/>
		</svg>
	)
}

export default IconNotebookDuoSolid
