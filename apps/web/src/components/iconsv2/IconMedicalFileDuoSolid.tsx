// duo-solid/medical
import type { Component, JSX } from "solid-js"

export const IconMedicalFileDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13 6.332a1 1 0 1 0-2 0V7.6l-1.098-.634a1 1 0 1 0-1 1.732L10 9.332l-1.098.634a1 1 0 0 0 1 1.732L11 11.064v1.268a1 1 0 1 0 2 0v-1.268l1.098.634a1 1 0 1 0 1-1.732L14 9.332l1.098-.634a1 1 0 1 0-1-1.732L13 7.6z"
			/>
			<path fill="currentColor" d="M9 16a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2z" />
		</svg>
	)
}

export default IconMedicalFileDuoSolid
