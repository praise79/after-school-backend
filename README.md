# Bright Futures backend

Express REST API for the Bright Futures after-school activities coursework. It uses MongoDB's official native `mongodb` driver and `MongoClient`; it does not use Mongoose or another ODM.

## Setup

1. Copy `.env.example` to `.env` and supply the real MongoDB Atlas URI.
2. Set `CLIENT_URL` to the exact Vue frontend origin. In production this must be the GitHub Pages origin; multiple known origins may be comma-separated.
3. Run `npm install`.
4. Run `npm run dev` locally, or `npm start` in production.

The server connects to Atlas and creates required unique indexes before listening. It exits with a non-zero code if the connection fails.

## Seed activities

Run `npm run seed` to upsert the original activity catalogue and ten lesson records in the `lesson` collection. It uses the native driver and can be run again safely.

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service health check |
| GET | `/api/activities` | List active activities |
| GET | `/api/activities/:id` | Get one active activity |
| POST | `/api/bookings` | Reserve places and create a booking |
| GET | `/api/bookings/:reference` | Minimal booking confirmation lookup |
| GET | `/lessons` | List ten lessons; supports backend `search`, `teacher`, `sortBy` and `direction` query parameters |
| PUT | `/lessons/:id` | Set a lesson's remaining `space` to any non-negative whole number |
| POST | `/order` | Validate and save a lesson order in the `order` collection |
| GET | `/enrolment/:lessonid` | Return the number of spaces already bought for a lesson |
| GET | `/images/lesson.svg` | Static lesson image served by Express |

Responses use `{ "success": true, "data": ... }` on success and `{ "success": false, "message": "..." }` on errors.

## Database records

`activities` must contain `name`, `slug`, `description`, `category`, `minAge`, `maxAge`, `schedule`, `price`, `capacity`, `placesBooked`, `isActive`, `createdAt`, and `updatedAt`. `slug` has a unique index.

`bookings` records include a unique `reference`, the `activityId` as an `ObjectId`, the student and guardian contact fields, `places`, the server-calculated `totalPrice`, `status`, and `createdAt`. No payment-card information is accepted or stored.

The assessed `lesson` collection stores `topic`, `subject`, `location`, `price`, `space`, `teacherFirstName`, `teacherLastName`, `image`, `isActive`, `createdAt`, and `updatedAt`. The assessed `order` collection stores `name`, `phone`, `lessonIDs`, `numberOfSpaces`, `reference`, and `createdAt`.

Every request is logged as `method url time status duration` in the Render console. Lesson images are served by the Express static middleware at `/images`.

## Booking safety

The API validates the request, retrieves the price from the activity document, and reserves capacity with one conditional native-driver `findOneAndUpdate` operation. This prevents overbooking from concurrent requests. Booking insertion is a separate write, so the code compensates by returning reserved capacity if insertion fails. A process failure between those two writes cannot provide cross-document atomicity; that would require an Atlas-compatible transaction, which is intentionally not claimed here.

## Security controls

The API has a 20 KB JSON body limit, Helmet headers, an API rate limit, disabled `X-Powered-By`, safe error responses, and a CORS allow-list. `CLIENT_URL` is mandatory in production: the server fails closed for browser origins if it is missing. Never commit `.env` or put the Atlas URI in the frontend.
