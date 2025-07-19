// icons/svgs/solid/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconTruckTrash: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 6a1 1 0 0 0-1.294-.956l-13 4A1 1 0 0 0 1 10v5.339c0 .527 0 .982.03 1.356.033.396.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.462.235.946.302 1.335.324q.097.005.2.007a3.001 3.001 0 0 0 5.656-.004h4.342a3.001 3.001 0 0 0 5.657.004q.102-.002.199-.007c.39-.022.874-.089 1.335-.324a3 3 0 0 0 1.311-1.31c.193-.38.264-.772.296-1.168.031-.374.031-.83.031-1.356V13.5q0-.192-.072-.371l-1.245-3.115c-.24-.6-.45-1.127-.817-1.531a3 3 0 0 0-1.171-.794c-.513-.19-1.08-.19-1.725-.189H16zm0 9.67a3 3 0 0 1 3.83 1.833q.043 0 .086-.003c.271-.015.435-.056.538-.109a1 1 0 0 0 .437-.437c.025-.05.063-.15.085-.422C21 16.25 21 15.877 21 15.3v-1.607l-1.124-2.81c-.32-.8-.398-.954-.49-1.055a1 1 0 0 0-.39-.265c-.129-.048-.3-.063-1.162-.063H16zM6 18.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm10 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTruckTrash
