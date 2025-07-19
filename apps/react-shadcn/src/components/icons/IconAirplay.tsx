// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconAirplay: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1a10 10 0 0 0-6.925 17.214 1.001 1.001 0 0 0 1.608-1.123 1 1 0 0 0-.223-.32 8 8 0 1 1 11.08 0 1 1 0 0 0-.03 1.414 1 1 0 0 0 1.415.029A10 10 0 0 0 12 1ZM9.897 7.597A4 4 0 0 1 15.2 13.4a1 1 0 0 0 1.6 1.2 6 6 0 1 0-9.6 0 1 1 0 1 0 1.6-1.2 4 4 0 0 1 1.097-5.803ZM12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm1.182 5.017a3 3 0 0 0-2.364 0c-.528.226-.913.635-1.243 1.07-.325.427-.683 1-1.111 1.685l-.026.04-.756 1.21-.023.037c-.23.368-.438.701-.58.984-.144.284-.304.671-.268 1.118a2 2 0 0 0 .8 1.445c.36.268.774.337 1.09.366s.709.029 1.143.029h4.312c.434 0 .827 0 1.142-.029.317-.03.73-.098 1.09-.366a2 2 0 0 0 .8-1.445c.037-.447-.123-.834-.267-1.118-.142-.283-.35-.616-.58-.984l-.023-.036-.756-1.21-.026-.041c-.428-.685-.786-1.258-1.11-1.685-.331-.435-.716-.844-1.244-1.07Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconAirplay
