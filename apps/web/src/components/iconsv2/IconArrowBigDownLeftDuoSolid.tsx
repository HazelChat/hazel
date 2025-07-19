// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigDownLeftDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m19.471 10.185.023-.023q.253-.246.487-.511c.179-.2.316-.433.403-.687a2 2 0 0 0 0-1.236 2 2 0 0 0-.403-.686c-.135-.16-.309-.333-.487-.512l-.023-.022-1.98-1.98-.022-.023a9 9 0 0 0-.511-.487 2 2 0 0 0-.687-.402 2 2 0 0 0-1.236 0c-.29.094-.512.254-.686.402-.16.135-.333.31-.512.487l-.022.023-7.02 7.02a1 1 0 0 0-.034 1.378 62 62 0 0 0 4.312 4.312 1 1 0 0 0 1.379-.034l7.02-7.02z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M14.956 20.08a1 1 0 0 0 .473-1.772 59.8 59.8 0 0 1-9.737-9.736 1 1 0 0 0-1.773.472 36.3 36.3 0 0 0-.182 9.355 2.106 2.106 0 0 0 1.864 1.864c3.113.343 6.258.282 9.355-.182Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconArrowBigDownLeftDuoSolid
