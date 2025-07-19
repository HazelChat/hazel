// duo-stroke/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconClipboardArrowDownRightDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 15v-4.6c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748c-.475-.242-1.032-.35-1.816-.398m-8 0c-.784.048-1.341.156-1.816.398a4 4 0 0 0-1.748 1.748C4 7.039 4 8.16 4 10.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748c.803.409 1.84.434 3.816.436"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18.057 23a10 10 0 0 0 1.873-1.802A.32.32 0 0 0 20 21m0 0c0-.07-.023-.14-.07-.198A10 10 0 0 0 18.057 19M20 21h-6m2-16.962V4c0-.465 0-.697-.051-.888a1.5 1.5 0 0 0-1.06-1.06C14.697 2 14.464 2 14 2h-4c-.465 0-.697 0-.888.051a1.5 1.5 0 0 0-1.06 1.06C8 3.304 8 3.536 8 4v.038c0 .44.001.665.051.85a1.5 1.5 0 0 0 1.06 1.06C9.304 6 9.536 6 10 6h4c.465 0 .697 0 .888-.051a1.5 1.5 0 0 0 1.06-1.06c.05-.186.052-.411.052-.85Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconClipboardArrowDownRightDuoStroke
