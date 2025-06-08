import pushNotifications from "@convex-dev/expo-push-notifications/convex.config"
import presence from "@convex-dev/presence/convex.config"

import { defineApp } from "convex/server"

const app = defineApp()
app.use(pushNotifications)
app.use(presence)

export default app
