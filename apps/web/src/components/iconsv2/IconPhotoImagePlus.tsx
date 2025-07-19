// solid/media
import type { Component, JSX } from "solid-js"

export const IconPhotoImagePlus: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M9.956 2c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.583 2.359C1 8.509 1 9.593 1 10.956v2.088c0 1.363 0 2.447.071 3.321.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583C7.509 22 8.593 22 9.956 22h2.58a1 1 0 0 0 .868-1.495l-.006-.01a1 1 0 0 0-.863-.495H10c-1.106 0-1.96 0-2.654-.031A12.25 12.25 0 0 1 18.247 9.314c.625-.064 1.357-.064 2.692-.064h.054C21 9.755 21 10.331 21 11v2.352a1 1 0 0 0 2 0v-2.396c0-1.363 0-2.447-.071-3.321-.074-.896-.227-1.66-.583-2.359a6 6 0 0 0-2.622-2.622c-.7-.356-1.463-.51-2.359-.583C16.491 2 15.407 2 14.044 2zM7.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M20 16a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPhotoImagePlus
