import Invoice from './invoice.model.js'
import Order from '../orders/order.model.js'

// Crear factura
export const createInvoice = async (req, res) => {
    try {

        const { order } = req.body

        const orderFound = await Order.findById(order)

        if (!orderFound) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            })
        }

        const invoice = new Invoice({
            order,
            total: orderFound.total
        })

        await invoice.save()

        res.status(201).json({
            success: true,
            message: 'Factura creada',
            data: invoice
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear factura',
            error: error.message
        })
    }
}

// Mis facturas
export const getMyInvoices = async (req, res) => {
    try {

        const invoices = await Invoice.find()
            .populate('order')

        res.status(200).json({
            success: true,
            data: invoices
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener facturas',
            error: error.message
        })
    }
}

// Factura por orden
export const getInvoiceByOrder = async (req, res) => {
    try {

        const { orderId } = req.params

        const invoice = await Invoice.findOne({ order: orderId })
            .populate('order')

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            })
        }

        res.status(200).json({
            success: true,
            data: invoice
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar factura',
            error: error.message
        })
    }
}

// Pagar factura
export const payInvoice = async (req, res) => {
    try {

        const { id } = req.params

        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { paid: true },
            { new: true }
        )

        res.status(200).json({
            success: true,
            message: 'Factura pagada',
            data: invoice
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al pagar factura',
            error: error.message
        })
    }
}

// Eliminar factura
export const deleteInvoice = async (req, res) => {
    try {

        const { id } = req.params

        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        )

        res.status(200).json({
            success: true,
            message: 'Factura eliminada',
            data: invoice
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar factura',
            error: error.message
        })
    }
}
export const getRestaurantInvoices = async (req, res) => {
    try {

        const { restaurantId } = req.params

        const invoices = await Invoice.find()
            .populate({
                path: 'order',
                match: { restaurant: restaurantId }
            })

        const filteredInvoices = invoices.filter(i => i.order !== null)

        res.status(200).json({
            success: true,
            data: filteredInvoices
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener facturas del restaurante',
            error: error.message
        })
    }
}
