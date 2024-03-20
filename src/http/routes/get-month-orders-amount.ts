import dayjs from 'dayjs'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import { Elysia } from 'elysia'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getMonthOrdersAmount = new Elysia()
  .use(auth)
  .get('/metrics/month-orders-amount', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new UnauthorizedError()

    const today = dayjs()
    const lastMonth = today.subtract(1, 'month')
    const startOfLastMonth = lastMonth.startOf('month')

    const orderPerMonth = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfLastMonth.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

    const currentMonthWithYear = today.format('YYYY-MM')
    const lastMonthWithYear = lastMonth.format('YYYY-MM')

    const currentMonthOrders = orderPerMonth.find((order) => {
      return order.monthWithYear === currentMonthWithYear
    })
    const lastMonthOrders = orderPerMonth.find((order) => {
      return order.monthWithYear === lastMonthWithYear
    })

    const diffFromLastMonth =
      currentMonthOrders && lastMonthOrders
        ? (currentMonthOrders.amount * 100) / lastMonthOrders.amount
        : null

    return {
      amount: currentMonthOrders?.amount,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : null,
    }
  })
