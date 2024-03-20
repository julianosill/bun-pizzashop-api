import dayjs from 'dayjs'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import { Elysia } from 'elysia'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getDayOrdersAmount = new Elysia()
  .use(auth)
  .get('/metrics/day-orders-amount', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new UnauthorizedError()

    const today = dayjs()
    const yesterday = today.subtract(1, 'day')
    const startOfYesterday = yesterday.startOf('day')

    const ordersPerDay = await db
      .select({
        dayWithMonthAndYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfYesterday.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)

    const todayWithMonthAndYear = today.format('YYYY-MM-DD')
    const yesterdayWithMonthAndYear = yesterday.format('YYYY-MM-DD')

    const todayOrdersAmount = ordersPerDay.find((orderPerDay) => {
      return orderPerDay.dayWithMonthAndYear === todayWithMonthAndYear
    })
    const yesterdayOrdersAmount = ordersPerDay.find((orderPerDay) => {
      return orderPerDay.dayWithMonthAndYear === yesterdayWithMonthAndYear
    })

    const diffFromYesterday =
      todayOrdersAmount && yesterdayOrdersAmount
        ? (todayOrdersAmount.amount * 100) / yesterdayOrdersAmount.amount
        : null

    return {
      amount: todayOrdersAmount?.amount,
      diffFromYesterday: diffFromYesterday
        ? Number((diffFromYesterday - 100).toFixed(2))
        : null,
    }
  })
