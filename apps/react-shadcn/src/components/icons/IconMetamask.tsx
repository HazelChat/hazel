// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconMetamask: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M21.191 2.63a2.5 2.5 0 0 0-1.867-.16l-4.902 1.508a.5.5 0 0 1-.147.022H9.45a.5.5 0 0 1-.154-.024l-4.6-1.478a2.5 2.5 0 0 0-3.13 1.57c-.035.1-.073.201-.12.322l-.041.109a8 8 0 0 0-.192.555c-.117.398-.218.93-.074 1.505l1.14 4.542a3 3 0 0 1-.062 1.673l-.851 2.573a2.5 2.5 0 0 0-.02 1.508l.714 2.366a2.5 2.5 0 0 0 3.038 1.693l2.36-.631a.5.5 0 0 1 .42.076l1.646 1.176c.423.302.932.465 1.452.465h2.043a2.5 2.5 0 0 0 1.45-.464l1.655-1.178a.5.5 0 0 1 .42-.075l2.363.63a2.5 2.5 0 0 0 3.037-1.688l.718-2.365a2.5 2.5 0 0 0-.022-1.52l-.857-2.562a3 3 0 0 1-.063-1.685l1.142-4.53.016-.075c.12-.553.02-1.062-.095-1.447a8 8 0 0 0-.196-.562l-.042-.108c-.048-.124-.088-.226-.123-.328a2.5 2.5 0 0 0-1.23-1.413ZM8.501 10c-1.098 0-2 .903-2 2s.902 2 2 2c1.096 0 2-.903 2-2s-.904-2-2-2Zm7 0c-1.098 0-2 .903-2 2s.902 2 2 2c1.096 0 2-.903 2-2s-.904-2-2-2Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconMetamask
