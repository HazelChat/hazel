// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconRedditNewDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18.564 9.98a2.426 2.426 0 1 1 2.36 3.762q.045.32.045.645c0 3.572-4.016 6.467-8.969 6.467s-8.969-2.895-8.969-6.467q0-.326.044-.644a2.427 2.427 0 1 1 2.36-3.762m13.13 0c-1.636-1.266-3.966-2.058-6.553-2.06m6.552 2.06q.233.18.446.372M5.436 9.98C7.073 8.713 9.408 7.92 12 7.92h.012M5.436 9.98q-.233.18-.446.372m7.022-2.433c-.57-2.441 1.481-4.959 4.174-4.612m0 0v.04a1.348 1.348 0 1 0 0-.04Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.427 17.006c-1.44 1.438-3.554 1.438-4.853 0z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.617 12.441c-.525 0-.976.522-1.008 1.201-.03.68.429.956.954.956s.917-.247.948-.926c.032-.68-.37-1.23-.894-1.23Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16.384 12.441c.524 0 .975.522 1.007 1.201.031.68-.428.956-.954.956-.525 0-.917-.247-.948-.926-.031-.68.37-1.23.895-1.23Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconRedditNewDuoStroke
