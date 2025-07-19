// duo-solid/communication
import type { Component, JSX } from "solid-js"

export const IconInboxOutgoingDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21.928 11a2 2 0 0 0-.059-.18c-.055-.146-.134-.283-.29-.558l-1.736-3.037c-.671-1.175-1.007-1.762-1.479-2.19a4 4 0 0 0-1.444-.837M2.072 11q.025-.09.059-.18c.055-.146.134-.283.29-.558l1.736-3.037c.671-1.175 1.007-1.762 1.478-2.19a4 4 0 0 1 1.445-.837"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12 3c-.328 0-.656.11-.925.328A11 11 0 0 0 9.2 5.274a1 1 0 0 0 1.6 1.2q.098-.13.2-.256V9a1 1 0 1 0 2 0V6.218q.102.126.2.256a1 1 0 0 0 1.6-1.2 11 11 0 0 0-1.875-1.946A1.47 1.47 0 0 0 12 3Z"
			/>
			<path
				fill="currentColor"
				d="M1.108 10.734A1 1 0 0 1 2.072 10h5.005C8.139 10 9 10.861 9 11.923 9 13.07 9.93 14 11.077 14h1.846C14.07 14 15 13.07 15 11.923c0-1.062.861-1.923 1.923-1.923h5.005a1 1 0 0 1 .964.734q.045.165.072.332c.036.233.036.466.036.73v.248c0 1.363 0 2.447-.071 3.321-.074.896-.227 1.66-.583 2.359a6 6 0 0 1-2.622 2.622c-.7.356-1.463.51-2.358.583-.875.071-1.96.071-3.322.071H9.956c-1.363 0-2.447 0-3.321-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C1 14.491 1 13.407 1 12.044v-.248c0-.264 0-.497.036-.73q.027-.168.072-.332Z"
			/>
		</svg>
	)
}

export default IconInboxOutgoingDuoSolid
