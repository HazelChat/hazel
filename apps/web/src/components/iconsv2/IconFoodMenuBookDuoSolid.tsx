// duo-solid/food
import type { Component, JSX } from "solid-js"

export const IconFoodMenuBookDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.956 1c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.583 2.359q-.015.177-.025.365H2a1 1 0 0 0 0 2h.001L2 9.956v4.088l.001.956H2a1 1 0 1 0 0 2h.046q.011.189.025.365c.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583.874.071 1.958.071 3.321.071h2.088c1.363 0 2.447 0 3.321-.071.896-.074 1.66-.227 2.359-.583a6 6 0 0 0 2.622-2.622c.356-.7.51-1.463.583-2.359.071-.874.071-1.958.071-3.321V9.956c0-1.363 0-2.447-.071-3.321-.074-.896-.227-1.66-.583-2.359a6 6 0 0 0-2.622-2.622c-.7-.356-1.463-.51-2.359-.583C15.491 1 14.407 1 13.044 1z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M12 5a1 1 0 0 1 1 1v.1c2.282.463 4 2.481 4 4.9a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2 5 5 0 0 1 4-4.9V6a1 1 0 0 1 1-1Zm-3 6h6a3 3 0 1 0-6 0Z"
				clip-rule="evenodd"
			/>
			<path fill="currentColor" d="M8 16a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z" />
		</svg>
	)
}

export default IconFoodMenuBookDuoSolid
