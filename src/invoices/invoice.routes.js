import { getRestaurantInvoices } from './invoice.controller.js'
import { Router } from 'express'
import {
    createInvoice,
    getMyInvoices,
    getInvoiceByOrder,
    payInvoice,
    deleteInvoice
} from './invoice.controller.js'

const router = Router()

router.post('/create', createInvoice)
router.get('/my', getMyInvoices)
router.get('/restaurant/:restaurantId', getRestaurantInvoices)
router.get('/order/:orderId', getInvoiceByOrder)
router.patch('/:id/pay', payInvoice)
router.delete('/:id', deleteInvoice)

export default router