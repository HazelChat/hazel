// icons/svgs/duo-solid/communication

import type React from "react"
import type { SVGProps } from "react"

export const IconChatChattingDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M22 11A9 9 0 0 0 4.45 8.187a8.4 8.4 0 0 1 11.26 11.556l.417-.046.034-.003.01-.001.13-.008.008-.001.014-.001h.023l.13.003c.107.001.214.009.504.03l1.777.126c.35.025.672.048.942.044.289-.004.62-.038.95-.194a2.2 2.2 0 0 0 1.045-1.045c.155-.33.19-.66.194-.95.004-.269-.02-.592-.044-.941l-.127-1.777a9 9 0 0 1-.03-.505l-.002-.128h0v-.048l.01-.128v-.01l.003-.034.012-.118.047-.41c.04-.35.1-.847.18-1.512v-.01A9 9 0 0 0 22 11Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M8.4 9.2a6.38 6.38 0 0 0-4.252 1.616 6.39 6.39 0 0 0-2.069 5.797c.048.301.084.523.108.682l.035.241.004.043.003.032v.082c0 .05-.004.118-.021.358l-.102 1.419c-.016.229-.033.46-.03.656.003.215.029.492.163.775.178.377.482.681.86.86.282.134.56.16.775.163a8 8 0 0 0 .656-.03l1.418-.102c.24-.017.31-.021.36-.022h.081l.074.007h0l.059.008.183.028.681.107Q7.883 22 8.4 22a6.4 6.4 0 0 0 4.784-2.148A6.4 6.4 0 0 0 8.4 9.2Z"
			/>
		</svg>
	)
}

export default IconChatChattingDuoSolid
