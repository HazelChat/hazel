// icons/svgs/duo-solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconDiscordDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m10.622 5-.546-1.093A1.476 1.476 0 0 0 8.35 3.14c-.682.196-2.186.685-3.421 1.537l-.032.023c-2.231 1.673-3.175 4.323-3.581 6.575-.375 2.074-.322 3.979-.299 4.801l.006.206c.005.239.066.485.194.711 1.124 1.984 2.678 2.994 3.958 3.5.635.25 1.201.377 1.614.44a6 6 0 0 0 .695.067h.025l.001-1v1a1 1 0 0 0 .9-.566l.809-1.675c1.964.488 3.603.488 5.567 0l.805 1.674a1 1 0 0 0 .901.567v-1l.001 1h.025a3 3 0 0 0 .195-.01c.124-.008.294-.024.5-.056.413-.064.98-.19 1.614-.441 1.28-.506 2.834-1.516 3.958-3.5.128-.226.19-.472.195-.71q.001-.088.005-.207c.023-.822.076-2.727-.298-4.8-.407-2.253-1.35-4.903-3.582-6.576l-.032-.023c-1.235-.852-2.738-1.341-3.42-1.537a1.476 1.476 0 0 0-1.729.77L13.383 5z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.001 17c.6.225 1.155.416 1.678.573 2.444.736 4.202.736 6.646 0A27 27 0 0 0 17.004 17m-7.002-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm6.001 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
			/>
		</svg>
	)
}

export default IconDiscordDuoSolid
