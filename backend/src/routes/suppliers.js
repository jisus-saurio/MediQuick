import express from 'express';  
const router = express.router();
import supplierController from '../controllers/suppliersControllers';
router 

    .route('/')
    .get(supplierController.getProveedores)
    .post(supplierController.createProveedores)
    .put(supplierController.updateProveedorestores)
    .delete(supplierController.deleteProveedores);
export default router;