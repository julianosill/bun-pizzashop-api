import { Elysia } from 'elysia'

import { approveOrder } from './routes/approve-order'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { cancelOrder } from './routes/cancel-order'
import { deliverOrder } from './routes/deliver-order'
import { dispatchOrder } from './routes/dispatch-order'
import { getCanceledMonthOrdersAmount } from './routes/get-canceled-month-orders-amount'
import { getDayOrdersAmount } from './routes/get-day-orders-amount'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getMonthOrdersAmount } from './routes/get-month-orders-amount'
import { getMonthRevenue } from './routes/get-month-revenue'
import { getOrderDetails } from './routes/get-order-details'
import { getOrders } from './routes/get-orders'
import { getPopularProducts } from './routes/get-popular-products'
import { getProfile } from './routes/get-profile'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { signOut } from './routes/sign-out'

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(dispatchOrder)
  .use(deliverOrder)
  .use(cancelOrder)
  .use(getOrders)
  .use(getMonthRevenue)
  .use(getDayOrdersAmount)
  .use(getMonthOrdersAmount)
  .use(getCanceledMonthOrdersAmount)
  .use(getPopularProducts)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status
        return error.toResponse()
      }
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
      default: {
        console.error(error)
        return new Response(null, { status: 500 })
      }
    }
  })

app.listen(3333, () => {
  console.log('HTTP server running')
})
