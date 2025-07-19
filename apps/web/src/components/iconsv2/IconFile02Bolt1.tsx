// contrast/files-&-folders
import type { Component, JSX } from "solid-js"

export const IconFile02Bolt1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 11a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m1 8.5-1.802 2.403c-.374.498-.561.748-.548.934a.5.5 0 0 0 .238.391c.16.098.467.046 1.082-.056l2.06-.344c.615-.102.923-.153 1.082-.056a.5.5 0 0 1 .238.391c.013.186-.174.436-.548.934L12 17.5m8-7.5v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8Z"
			/>
		</svg>
	)
}

export default IconFile02Bolt1
