'use strict';

import Table from './table.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createTable = async (req, res) => {
    try {

        const { id } = req.params
        const data = req.body

        const restaurant = await Restaurant.findById(id)

        if(!restaurant){
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            })
        }

        const newTable = new Table({
            ...data,
            restaurantId: id
        })

        await newTable.save()

        res.status(201).json({
            success: true,
            message: 'Mesa creada correctamente',
            table: newTable
        })

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una mesa con ese número en este restaurante'
            })
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear mesa',
            error: error.message
        })
    }
}

export const getRestaurantTables = async (req,res)=>{
    try{

        const { id } = req.params
        const { location, status } = req.query

        const filter = { restaurantId: id, active: false }

        if(location) filter.location = location
        if(status) filter.status = status

        const tables = await Table.find(filter)
            .populate('restaurantId','name')

        res.status(200).json({
            success: true,
            total: tables.length,
            tables
        })

    }catch(error){
        res.status(500).json({
            success: false,
            message:'Error al obtener mesas',
            error: error.message
        })
    }
}

export const getTableById = async (req,res)=>{
    try{

        const { id } = req.params

        const table = await Table.findById(id)
        .populate('restaurantId','name')

        if(!table || !table.active){
            return res.status(404).json({
                success: false,
                message:'Mesa no encontrada'
            })
        }

        res.status(200).json({
            success: true,
            table
        })

    }catch(error){

        res.status(500).json({
            success: false,
            message: 'Error al obtener mesa',
            error: error.message
        })
    }
}

export const updateTable = async (req,res)=>{
    try{

        const { id } = req.params
        const { capacity, location, description } = req.body

        const table = await Table.findById(id)

        if(!table){
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            })
        }

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            { capacity, location, description },
            { new: true, runValidators: true }
        )

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada',
            updatedTable
        })

    }catch(error){

        res.status(500).json({
            success: false,
            message: 'Error al actualizar mesa',
            error: error.message
        })
    }
}

export const changeTableStatus = async (req,res)=>{
    try{

        const { id } = req.params
        const { status } = req.body

        const table = await Table.findById(id)

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            })
        }

        table.status = status
        await table.save()

        res.status(200).json({
            success: true,
            message: 'Estado actualizado',
            table
        })

    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado',
            error: error.message
        })
    }
}

export const changeTableActive = async (req, res) => {
    try {
        const { id } = req.params;

        const active = req.url.includes('/activate');
        const action = active ? 'activada' : 'desactivada';

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            { active },
            { new: true }
        );

        if (!updatedTable) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Mesa ${action} exitosamente`,
            data: updatedTable
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la mesa',
            error: error.message
        });
    }
};