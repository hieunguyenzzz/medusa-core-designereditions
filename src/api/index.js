import { Router } from "express"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import { getConfigFile, parseCorsOrigins } from "medusa-core-utils"
import { ConfigModule } from "@medusajs/medusa/dist/types/global"
import cors from "cors"

export default (rootDirectory, pluginOptions) => {
  const router = Router()
  const { configModule } = getConfigFile(rootDirectory, "medusa-config")
  const { projectConfig } = configModule
  const corsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  }
  router.options("/admin/abandon_carts", cors(corsOptions))
  router.get("/admin/abandon_carts", cors(corsOptions) , async (req, res) => {

    let data = await getAllAbandonCart();
    console.log(data);
    res.json(data)
  })
  router.options("/admin/abandon_cart/:cartId", cors(corsOptions))
  router.get("/admin/abandon_cart/:cartId", cors(corsOptions) , async (req, res) => {
    const { cartId } = req.params;
    console.log(cartId);
    const data = await prisma.cart.findFirst({where: {id: cartId}})
    const lineItems = await prisma.line_item.findMany({where: {cart_id: cartId}});
    res.json({cart: data, lineItems})
  })

  return router
}

const getAllAbandonCart = async () => {
  let orders = await prisma.order.findMany();
  let notAbandoncart =  [];
  for(const order of orders) {
    notAbandoncart.push(order.cart_id || "");
  }
  return await prisma.cart.findMany({where: {id: {notIn: notAbandoncart}}});
}

const getLineItem = async (cartId) => {
  return await prisma.line_item.findMany({where: {cart_id: cartId}})
}