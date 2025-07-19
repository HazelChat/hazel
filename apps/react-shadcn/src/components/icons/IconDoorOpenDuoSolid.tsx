// icons/svgs/duo-solid/building

import type React from "react"
import type { SVGProps } from "react"

export const IconDoorOpenDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M11 2.98a1 1 0 1 1 0 2H9c-.717 0-1.194 0-1.56.03a2 2 0 0 0-.53.095l-.09.039a1.5 1.5 0 0 0-.598.552l-.059.104c-.052.103-.104.265-.133.62C6 6.787 6 7.264 6 7.98V19h5a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2h2V7.98c0-.683-.001-1.256.037-1.723.04-.479.125-.934.345-1.365l.135-.242A3.5 3.5 0 0 1 5.91 3.362l.163-.077c.383-.164.784-.233 1.202-.267.467-.039 1.04-.038 1.724-.038z"
				/>
				<path fill="currentColor" d="M22 19a1 1 0 1 1 0 2h-3a1 1 0 1 1 0-2z" />
			</g>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M11.705.466a2.15 2.15 0 0 1 .868.082c.272.074.595.196.94.326l3.243 1.217.611.23c.579.225 1.06.444 1.447.785l.156.146c.35.35.625.77.802 1.235l.08.245c.16.582.148 1.238.148 2.04v10.512c0 .81.012 1.47-.151 2.057l-.081.247a3.5 3.5 0 0 1-.814 1.24l-.157.146c-.392.341-.88.56-1.465.78l-.62.227-3.222 1.175c-.343.125-.664.244-.934.315a2.2 2.2 0 0 1-.865.075l-.14-.027a2 2 0 0 1-1.115-.702l-.113-.157c-.212-.326-.273-.677-.299-.96-.025-.279-.024-.621-.024-.986V3.308c0-.368 0-.713.024-.994.026-.284.088-.638.302-.966l.114-.157c.283-.352.679-.6 1.124-.7zm1.324 10.152a1 1 0 0 0 0 2h.918a1 1 0 0 0 0-2z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconDoorOpenDuoSolid
