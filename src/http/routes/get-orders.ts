import { and, count, eq, getTableColumns, ilike } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-typebox'
import { Elysia, t } from 'elysia'

import { db } from '../../db/connection'
import { orders, users } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getOrders = new Elysia().use(auth).get(
  '/orders',
  async ({ getCurrentUser, query }) => {
    const { restaurantId } = await getCurrentUser()
    const { customerName, orderId, status, pageIndex } = query

    if (!restaurantId) throw new UnauthorizedError()

    const orderTableColumns = getTableColumns(orders)

    const basequery = db
      .select(orderTableColumns)
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customerId))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined,
        ),
      )

    const [totalOrdersQuery, allOrders] = await Promise.all([
      db.select({ count: count() }).from(basequery.as('baseQuery')),
      db
        .select()
        .from(basequery.as('baseQuery'))
        .offset(pageIndex * 10)
        .limit(10),
    ])

    const totalOrders = totalOrdersQuery[0].count

    return {
      orders: allOrders,
      meta: { pageIndex, perPage: 10, totalCount: totalOrders },
    }
  },
  {
    query: t.Object({
      customerName: t.Optional(t.String()),
      orderId: t.Optional(t.String()),
      status: t.Optional(createSelectSchema(orders).properties.status),
      pageIndex: t.Numeric({ minimum: 0 }),
    }),
  },
)
