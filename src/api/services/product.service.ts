/* eslint-disable no-unused-vars */

import logEvent from '~/helpers/log-event'
import { ResponseStory } from '~/middleware/express-formatter'
import ProductSchema, { Product } from '~/models/product.model'
import logging from '~/utils/logging'

const NAMESPACE = 'Product'

export const createNew = async (productInput: Product): Promise<ResponseStory> => {
  try {
    const product = await ProductSchema.create()
    product
    return {
      status: 200
    }
  } catch (error) {
    logging.error(NAMESPACE, `${error}`)
    logEvent(`${error}`)
    throw error
  }
}

// Get by id
export const getByID = async (id: number): Promise<ResponseStory> => {
  try {
    const product = await ProductSchema.findByPk(id)
    return {
      status: product ? 200 : 404,
      message: product ? `${NAMESPACE} founded!` : `${NAMESPACE} not found!`,
      data: product
    }
  } catch (error) {
    logging.error(NAMESPACE, `${error}`)
    logEvent(`${error}`)
    throw error
  }
}

// Get all
export const getAll = async (): Promise<ResponseStory> => {
  try {
    const products = await ProductSchema.findAll()
    return {
      status: products ? 200 : 400,
      message: products ? `${NAMESPACE} founded!` : `${NAMESPACE} not found!`,
      data: products,
      meta: {
        total: products.length
      }
    }
  } catch (error) {
    logging.error(NAMESPACE, `${error}`)
    logEvent(`${error}`)
    throw error
  }
}

// Update
export const updateByID = async (product: Product): Promise<ResponseStory> => {
  try {
    return {
      status: 200
    }
  } catch (error) {
    logging.error(NAMESPACE, `${error}`)
    logEvent(`${error}`)
    throw error
  }
}

// Delete
export const deleteByID = async (id: number): Promise<ResponseStory> => {
  try {
    const productFind = await ProductSchema.findByPk(id)
    if (!productFind) {
      return {
        status: 404,
        message: `${NAMESPACE} not found!`
      }
    } else {
      return {
        status: 200,
        message: `${NAMESPACE} has been deleted!`,
        data: await productFind.destroy()
      }
    }
  } catch (error) {
    logging.error(NAMESPACE, `${error}`)
    logEvent(`${error}`)
    throw error
  }
}
