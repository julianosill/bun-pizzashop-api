/* eslint-disable drizzle/enforce-delete-with-where */
import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'
import chalk from 'chalk'

import { db } from './connection'
import {
  authLinks,
  orderItems,
  orders,
  products,
  restaurants,
  users,
} from './schema'

// Reset database
await db.delete(users)
await db.delete(restaurants)
await db.delete(orderItems)
await db.delete(orders)
await db.delete(products)
await db.delete(authLinks)

console.log(chalk.yellowBright('✓ Database reset!'))

// Create customers
const [customerOne, customerTwo] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])
  .returning()
console.log(chalk.yellowBright('✓ Customers created!'))

// Create manager
const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      role: 'manager',
    },
  ])
  .returning({ id: users.id })
console.log(chalk.yellowBright('✓ Manager created!'))

// Create restaurant
const [restaurant] = await db
  .insert(restaurants)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning()
console.log(chalk.yellowBright('✓ Restaurant created!'))

// Creaate products
function generatProducts() {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 })),
    restaurantId: restaurant.id,
  }
}
const availableProducts = await db
  .insert(products)
  .values([
    generatProducts(),
    generatProducts(),
    generatProducts(),
    generatProducts(),
    generatProducts(),
    generatProducts(),
  ])
  .returning()
console.log(chalk.yellowBright('✓ Products created!'))

// Create orders
type OrdersInsertProps = typeof orders.$inferInsert
type OrderItemsToInsertProps = typeof orderItems.$inferInsert

const ordersToInsert: OrdersInsertProps[] = []
const orderItemsToInsert: OrderItemsToInsertProps[] = []

for (let i = 0; i < 200; i++) {
  const orderId = createId()
  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 4,
  })

  let totalInCents = 0

  orderProducts.forEach((orderProduct) => {
    const quantity = faker.number.int({ min: 1, max: 4 })
    totalInCents += orderProduct.priceInCents * quantity
    orderItemsToInsert.push({
      orderId,
      productId: orderProduct.id,
      priceInCents: orderProduct.priceInCents,
      quantity,
    })
  })

  ordersToInsert.push({
    id: orderId,
    customerId: faker.helpers.arrayElement([customerOne.id, customerTwo.id]),
    restaurantId: restaurant.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'delivering',
      'delivered',
      'canceled',
    ]),
    createdAt: faker.date.recent({ days: 40 }),
  })
}
await db.insert(orders).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToInsert)
console.log(chalk.greenBright('✓ Orders created!'))

console.log(chalk.greenBright('✓ Database seeded successfully!'))

process.exit()
