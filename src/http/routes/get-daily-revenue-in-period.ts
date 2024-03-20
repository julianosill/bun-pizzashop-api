import dayjs from 'dayjs'
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm'
import { Elysia, t } from 'elysia'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getDailyRevenueInPeriod = new Elysia().use(auth).get(
  '/metrics/daily-revenue-in-period',
  async ({ getCurrentUser, query, set }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new UnauthorizedError()

    const { from, to } = query

    const startDate = from ? dayjs(from) : dayjs().subtract(6, 'days')
    const endDateBasedOnFrom = from ? startDate.add(6, 'days') : dayjs()
    const endDate = to ? dayjs(to) : endDateBasedOnFrom

    if (endDate.diff(startDate, 'days') > 7) {
      set.status = 400
      return {
        message: 'You cannot request revenue for a period longer than 7 days',
      }
    }

    const startDateOnLocalTimezone = startDate
      .startOf('day')
      .add(startDate.utcOffset(), 'minutes')
      .toDate()
    const endDateOnLocalTimezone = endDate
      .endOf('day')
      .add(endDate.utcOffset(), 'minutes')
      .toDate()

    const dailyRevenue = await db
      .select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'DD/MM')`,
        revenueInCents: sum(orders.totalInCents).mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startDateOnLocalTimezone),
          lte(orders.createdAt, endDateOnLocalTimezone),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`)

    const orderedDailyRevenue = dailyRevenue.sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number)
      const [dayB, monthB] = b.date.split('/').map(Number)

      if (monthA === monthB) return dayA - dayB

      const dateA = new Date(2024, monthA - 1)
      const dateB = new Date(2024, monthB - 1)

      return dateA.getTime() - dateB.getTime()
    })

    return { dailyRevenue: orderedDailyRevenue }
  },
  {
    query: t.Object({
      from: t.Optional(t.String()),
      to: t.Optional(t.String()),
    }),
  },
)
