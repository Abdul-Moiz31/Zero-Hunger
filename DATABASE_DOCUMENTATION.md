# Database Documentation

MongoDB via Mongoose. Three collections: **users**, **foods**, **notifications**.
All use Mongoose `timestamps` (`createdAt`, `updatedAt`).

## `users`

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, validated |
| `password` | String | required, **bcrypt-hashed** (pre-save hook) |
| `role` | enum | `donor` \| `ngo` \| `volunteer` \| `admin` |
| `organization_name` | String | NGO / volunteer org link |
| `contact_number` | String | |
| `resetPasswordToken` | String | SHA-256 hash of the emailed token |
| `resetPasswordExpires` | Date | 1-hour expiry |
| `status` | enum | `Active` \| `Inactive` (default `Active`) |
| `completedOrders` | Number | incremented when a volunteer completes a task |
| `joinedDate` | Date | |
| `isApproved` | Boolean | gates login (default `false`) |
| `ngoId` | ObjectId → User | links a volunteer to their NGO |
| `rating` | Number | volunteer rating (capped at 5) |

**Methods:** `comparePassword(candidate)` → bcrypt compare.
**Indexes:** unique `email`; `{ resetPasswordToken, resetPasswordExpires }`.

## `foods`

| Field | Type | Notes |
|---|---|---|
| `donorId` | ObjectId → User | required, indexed |
| `title` | String | required |
| `description` | String | |
| `quantity` | Number | |
| `unit` | String | e.g. "meals", "loaves" |
| `expiry_time` | Date | |
| `pickup_window_start` / `_end` | String | time window |
| `status` | enum | `available` \| `in_progress` \| `assigned` \| `completed` (indexed) |
| `ngoId` | ObjectId → User | set on claim, indexed |
| `acceptance_time` | Date | set on claim |
| `volunteerId` | ObjectId → User | set on assignment, indexed |
| `delivered_time` | Date | set on completion |
| `pickup_location` | String | |
| `temperature_requirements` | String | |
| `contact_number` | String | |
| `dietary_info` | String | |
| `img` | String | ImgBB URL |

**Indexes:** `donorId`, `status`, `ngoId`, `volunteerId`, compound `{ status, ngoId }`.

## `notifications`

| Field | Type | Notes |
|---|---|---|
| `recipientId` | ObjectId → User | required, indexed |
| `message` | String | required |
| `taskId` | ObjectId → Food | optional (some notifications aren't task-bound) |
| `type` | enum | `new_donation` \| `claimed` \| `assigned` \| `in_progress` \| `completed` \| `approved` \| `general` |
| `read` | Boolean | default `false` |

**Indexes:** `recipientId`; compound `{ recipientId, read, createdAt }`.

## Relationships

```
User (donor) ─1───many─► Food.donorId
User (ngo)   ─1───many─► Food.ngoId
User (volunteer) ─1──many─► Food.volunteerId
User (ngo)   ─1───many─► User.ngoId (volunteers)
User         ─1───many─► Notification.recipientId
Food         ─1───many─► Notification.taskId
```

## Lifecycle notes

- A `Food` moves `available → assigned → in_progress → completed`.
- On completion the assigned volunteer's `rating` increases by 0.5 (max 5) and
  `completedOrders` increments.
- Notifications are created through a single `emitNotification()` helper, which
  also pushes them over Socket.IO in real time.
