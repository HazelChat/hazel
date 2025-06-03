- Add isLoading and error state to createQuery
- Add error tuple to createMutation
- Add convex client tests to our sdk

- Move Pinned Message back to separate table

# Features
- Add Presence (online/offline)
- File uploads with convex
- Readd threads
- Readd last read message

- Call Feature



# Improvements 
- Add local caching for messages 
- Delete Notification after it was seen (maybe just a simple cron cleanup job)
- Improve typing presence todo less calls

- Rework presence with convex component https://github.com/get-convex/presence

- Improve mobile app UI and add settings in both web + mobile to mute Notifications