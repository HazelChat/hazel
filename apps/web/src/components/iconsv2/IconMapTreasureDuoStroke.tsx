// duo-stroke/navigation
import type { Component, JSX } from "solid-js"

export const IconMapTreasureDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.769 6.116c-.642.32-.963.481-1.198.72a2 2 0 0 0-.462.748C3 7.9 3 8.26 3 8.978v5.897c0 1.667 0 2.5.342 3.008a2 2 0 0 0 1.399.864c.606.08 1.352-.293 2.843-1.039.51-.255.765-.382 1.032-.435.254-.05.514-.05.768 0 .267.053.522.18 1.032.435l3.153 1.577c.525.262.787.393 1.062.445.244.045.494.045.738 0 .275-.052.537-.183 1.062-.445l2.8-1.4c.642-.322.963-.482 1.198-.722a2 2 0 0 0 .462-.747C21 16.1 21 15.74 21 15.022V9.125c0-1.667 0-2.5-.342-3.008a2 2 0 0 0-1.399-.864c-.606-.08-1.352.293-2.843 1.039-.51.255-.765.383-1.032.435a2 2 0 0 1-.768 0c-.267-.052-.522-.18-1.032-.435L10.43 4.716c-.525-.263-.787-.394-1.062-.446a2 2 0 0 0-.738 0c-.275.052-.537.183-1.062.446z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.01 12H7m4.02 0h-.01m3.49-1.5L16 12m0 0 1.5 1.5M16 12l1.5-1.5M16 12l-1.5 1.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconMapTreasureDuoStroke
