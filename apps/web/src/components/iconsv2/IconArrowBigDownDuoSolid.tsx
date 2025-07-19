// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigDownDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.803 14.791a1 1 0 0 0-.92-1.588c-4.574.53-9.194.53-13.77 0a1 1 0 0 0-.92 1.588 36.3 36.3 0 0 0 6.487 6.744 2.11 2.11 0 0 0 2.637 0 36.3 36.3 0 0 0 6.486-6.744Z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M15.999 4.601V4.57c0-.252 0-.498-.017-.706a2 2 0 0 0-.201-.77 2 2 0 0 0-.874-.874 2 2 0 0 0-.77-.2C13.929 2 13.683 2 13.431 2h-2.864c-.252 0-.498 0-.706.017a2 2 0 0 0-.77.201 2 2 0 0 0-.874.874 2 2 0 0 0-.201.77c-.017.208-.017.454-.017.706v9.959a1 1 0 0 0 .95 1q3.05.15 6.1 0a1 1 0 0 0 .95-1z"
				clip-rule="evenodd"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconArrowBigDownDuoSolid
