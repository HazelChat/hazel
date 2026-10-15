import "@fontsource/inter/400.css"
import "@fontsource/inter/400-italic.css"
import "./styles.css"

import { Runtime } from "foldkit"
import { setSessionBearerProvider } from "~/lib/session-bearer"
import { initTauri } from "~/lib/tauri"
import { isDesktop } from "./platform/desktop"
import { desktopSessionBearer } from "./platform/desktop-auth"
import { Flags, flags, init, managedResources, Message, Model, subscriptions, update, view } from "./main"
import { ResourcesLive } from "./rpc"

const container = document.getElementById("app")!

const startApplication = () =>
	Runtime.run(
		Runtime.makeApplication({
			Model,
			Flags,
			init,
			update,
			view,
			subscriptions,
			managedResources,
			resources: ResourcesLive,
			container,
			routing: {
				onUrlRequest: (request) => Message.ClickedLink({ request }),
				onUrlChange: (url) => Message.ChangedUrl({ url }),
			},
			devTools: { Message },
		}),
		{ flags },
	)

// The desktop app has no API cookie: its requests carry its own session as a bearer.
if (isDesktop) setSessionBearerProvider(desktopSessionBearer)
startApplication()
// Desktop only: native notification permission (a no-op in the browser).
void initTauri()
