// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigRightDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.79 4.195a1 1 0 0 0-1.588.92c.53 4.574.53 9.194 0 13.77a1 1 0 0 0 1.588.92 36.3 36.3 0 0 0 6.744-6.487 2.11 2.11 0 0 0 0-2.637 36.3 36.3 0 0 0-6.744-6.486Z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M4.569 7.999c-.252 0-.498 0-.706.017a2 2 0 0 0-.77.201 2 2 0 0 0-.874.874 2 2 0 0 0-.2.77c-.02.208-.02.454-.02.706v2.864c0 .252 0 .498.017.706.015.268.084.53.201.77a2 2 0 0 0 .874.874c.24.117.503.186.77.201.208.017.454.017.706.017h9.959a1 1 0 0 0 1-.95q.15-3.05 0-6.1a1 1 0 0 0-1-.95z"
				clip-rule="evenodd"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconArrowBigRightDuoSolid
